use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use tauri::async_runtime::{self, JoinHandle};
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex as AsyncMutex;
use tokio::time::{sleep, Duration};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartProcessingPayload {
    pub request: Option<TrackGenerationRequest>,
    #[serde(default)]
    pub simulate_failure: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackGenerationRequest {
    pub track_key: String,
    pub track_location: String,
    #[serde(default)]
    pub track_variation: Option<String>,
    #[serde(default)]
    pub exported_files: Vec<ExportedRunFile>,
    #[serde(default)]
    pub assignments: Option<Value>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportedRunFile {
    pub run_type: String,
    pub file_path: String,
}

#[derive(Clone, Serialize)]
struct ProcessingProgressPayload {
    overall_progress: u8,
    phase_progress: u8,
    phase_index: usize,
    total_phases: usize,
    phase_name: String,
    message: String,
    eta_seconds: u64,
}

#[derive(Clone, Serialize)]
struct ProcessingLogPayload {
    level: String,
    message: String,
    timestamp: String,
}

#[derive(Clone, Serialize)]
struct ProcessingSuccessPayload {
    #[serde(rename = "glbPath")]
    glb_path: String,
    #[serde(rename = "metadataPath")]
    metadata_path: String,
    #[serde(rename = "outputDir")]
    output_dir: String,
    track: ScriptTrackSummary,
    alignment: ScriptAlignmentSummary,
}

#[derive(Clone, Serialize)]
struct ProcessingCompletePayload {
    success: bool,
    message: Option<String>,
    result: Option<ProcessingSuccessPayload>,
}

#[derive(Clone, Serialize)]
struct ProcessingErrorPayload {
    message: String,
}

struct ProcessingTask {
    cancel_flag: Arc<AtomicBool>,
    child: Arc<AsyncMutex<Option<Child>>>,
    handle: JoinHandle<()>,
}

struct ProcessingManager {
    task: Mutex<Option<ProcessingTask>>,
}

impl ProcessingManager {
    const fn new() -> Self {
        Self {
            task: Mutex::new(None),
        }
    }

    fn start(&self, app_handle: AppHandle, payload: StartProcessingPayload) -> Result<(), String> {
        let mut guard = self
            .task
            .lock()
            .map_err(|_| "Processing state is unavailable".to_string())?;

        if guard.is_some() {
            return Err("Processing is already running".into());
        }

        let request = payload
            .request
            .ok_or_else(|| "Processing payload is missing run data.".to_string())?;

        let cancel_flag = Arc::new(AtomicBool::new(false));
        let cancel_clone = cancel_flag.clone();
        let child_ref = Arc::new(AsyncMutex::new(None));
        let child_clone = child_ref.clone();
        let simulate_failure = payload.simulate_failure;

        let handle = async_runtime::spawn(async move {
            let outcome = processing_worker(
                app_handle.clone(),
                cancel_clone,
                child_clone,
                request,
                simulate_failure,
            )
            .await;

            match outcome {
                ProcessingOutcome::Completed(result) => {
                    let _ = app_handle.emit(
                        "processing-complete",
                        ProcessingCompletePayload {
                            success: true,
                            message: Some("Track processing finished successfully.".into()),
                            result: Some(result),
                        },
                    );
                }
                ProcessingOutcome::Cancelled => {
                    let _ = app_handle.emit("processing-cancelled", ());
                }
                ProcessingOutcome::Failed(error) => {
                    let _ = app_handle.emit(
                        "processing-error",
                        ProcessingErrorPayload { message: error },
                    );
                }
            }

            PROCESSING_MANAGER.finish();
        });

        *guard = Some(ProcessingTask {
            cancel_flag,
            child: child_ref,
            handle,
        });
        Ok(())
    }

    fn cancel(&self) -> Result<(), String> {
        let guard = self
            .task
            .lock()
            .map_err(|_| "Processing state is unavailable".to_string())?;

        if let Some(task) = guard.as_ref() {
            task.cancel_flag.store(true, Ordering::SeqCst);
            let child = task.child.clone();
            async_runtime::spawn(async move {
                let mut guard = child.lock().await;
                if let Some(mut child_proc) = guard.take() {
                    let _ = child_proc.kill().await;
                }
            });
            Ok(())
        } else {
            Err("No processing run is active".into())
        }
    }

    fn is_running(&self) -> bool {
        self.task
            .lock()
            .map(|guard| guard.is_some())
            .unwrap_or(false)
    }

    fn finish(&self) {
        if let Ok(mut guard) = self.task.lock() {
            *guard = None;
        }
    }
}

static PROCESSING_MANAGER: Lazy<ProcessingManager> = Lazy::new(ProcessingManager::new);

enum ProcessingOutcome {
    Completed(ProcessingSuccessPayload),
    Cancelled,
    Failed(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScriptProgressEvent {
    phase: String,
    phase_index: usize,
    total_phases: usize,
    percent: f64,
    message: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScriptLogEvent {
    level: Option<String>,
    message: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScriptTrackSummary {
    key: String,
    location: String,
    #[serde(default)]
    variation: Option<String>,
    length: f64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScriptAlignmentSummary {
    alignment_score: f64,
    max_start_position_delta: f64,
    resample_count: u32,
    confidence: f64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScriptResultEvent {
    glb_path: String,
    metadata_path: String,
    output_dir: String,
    track: ScriptTrackSummary,
    alignment: ScriptAlignmentSummary,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScriptErrorEvent {
    message: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
enum ScriptEvent {
    Progress(ScriptProgressEvent),
    Log(ScriptLogEvent),
    Result(ScriptResultEvent),
    Error(ScriptErrorEvent),
}

fn current_timestamp() -> String {
    chrono::Local::now().format("%H:%M:%S").to_string()
}

fn emit_log(app_handle: &AppHandle, level: &str, message: &str) {
    let _ = app_handle.emit(
        "processing-log",
        ProcessingLogPayload {
            level: level.to_string(),
            message: message.to_string(),
            timestamp: current_timestamp(),
        },
    );
}

fn emit_progress(app_handle: &AppHandle, progress: ProcessingProgressPayload) {
    let _ = app_handle.emit("processing-progress", progress);
}

fn map_run_files(request: &TrackGenerationRequest) -> Result<HashMap<String, String>, String> {
    let mut mapping = HashMap::new();
    for file in &request.exported_files {
        mapping.insert(file.run_type.to_lowercase(), file.file_path.clone());
    }

    for run in ["outside", "inside", "racing"] {
        if !mapping.contains_key(run) {
            return Err(format!(
                "Missing {} run export. Re-run recording workflow.",
                run
            ));
        }
    }

    Ok(mapping)
}

fn resolve_project_root() -> Result<PathBuf, String> {
    env::current_dir().map_err(|err| format!("Unable to determine project root: {err}"))
}

fn resolve_output_dir(app: &AppHandle, track_key: &str) -> Result<PathBuf, String> {
    let mut base = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;
    base.push("simvox");
    base.push("track-models");
    base.push(track_key);
    fs::create_dir_all(&base).map_err(|err| {
        format!(
            "Unable to create output directory {}: {err}",
            base.display()
        )
    })?;
    Ok(base)
}

async fn processing_worker(
    app_handle: AppHandle,
    cancel_flag: Arc<AtomicBool>,
    child_ref: Arc<AsyncMutex<Option<Child>>>,
    request: TrackGenerationRequest,
    simulate_failure: bool,
) -> ProcessingOutcome {
    if simulate_failure {
        emit_log(&app_handle, "ERROR", "Simulated failure requested.");
        return ProcessingOutcome::Failed("Simulation failure triggered.".into());
    }

    let files = match map_run_files(&request) {
        Ok(map) => map,
        Err(err) => return ProcessingOutcome::Failed(err),
    };

    let project_root = match resolve_project_root() {
        Ok(path) => path,
        Err(err) => return ProcessingOutcome::Failed(err),
    };

    let output_dir = match resolve_output_dir(&app_handle, &request.track_key) {
        Ok(path) => path,
        Err(err) => return ProcessingOutcome::Failed(err),
    };

    emit_log(
        &app_handle,
        "INFO",
        "Launching track generation pipeline (Node)",
    );

    let mut command = Command::new("npx");
    command
        .arg("--yes")
        .arg("tsx")
        .arg("scripts/run-track-generation.ts")
        .arg("--outside")
        .arg(files.get("outside").unwrap())
        .arg("--inside")
        .arg(files.get("inside").unwrap())
        .arg("--racing")
        .arg(files.get("racing").unwrap())
        .arg("--trackKey")
        .arg(&request.track_key)
        .arg("--trackLocation")
        .arg(&request.track_location)
        .arg("--outputDir")
        .arg(output_dir.to_string_lossy().to_string());

    if let Some(variation) = &request.track_variation {
        if !variation.trim().is_empty() {
            command.arg("--trackVariation").arg(variation);
        }
    }

    command.current_dir(project_root);
    command.stdout(std::process::Stdio::piped());
    command.stderr(std::process::Stdio::piped());

    let mut child = match command.spawn() {
        Ok(child) => child,
        Err(err) => {
            return ProcessingOutcome::Failed(format!("Failed to spawn Node process: {err}"));
        }
    };

    let stdout = child.stdout.take();
    let stderr = child.stderr.take();
    {
        let mut guard = child_ref.lock().await;
        *guard = Some(child);
    }

    let mut stdout_reader = stdout.map(|s| BufReader::new(s).lines());
    let mut stderr_reader = stderr.map(|s| BufReader::new(s).lines());

    let mut final_result: Option<ProcessingSuccessPayload> = None;
    let mut cancel_future = Box::pin(async {
        loop {
            if cancel_flag.load(Ordering::SeqCst) {
                break;
            }
            sleep(Duration::from_millis(150)).await;
        }
    });

    loop {
        tokio::select! {
            _ = &mut cancel_future => {
                emit_log(&app_handle, "WARN", "Cancelling track generation...");
                let mut guard = child_ref.lock().await;
                if let Some(mut child_proc) = guard.take() {
                    let _ = child_proc.kill().await;
                }
                return ProcessingOutcome::Cancelled;
            }
            maybe_line = async {
                if let Some(reader) = &mut stdout_reader {
                    reader.next_line().await
                } else {
                    Ok(None)
                }
            } => {
                match maybe_line {
                    Ok(Some(line)) => {
                        if line.trim().is_empty() {
                            continue;
                        }
                        match serde_json::from_str::<ScriptEvent>(&line) {
                            Ok(ScriptEvent::Progress(event)) => {
                                let overall = ((event.phase_index as f64 + (event.percent / 100.0))
                                    / (event.total_phases as f64)
                                    * 100.0)
                                    .clamp(0.0, 100.0);
                                emit_progress(
                                    &app_handle,
                                    ProcessingProgressPayload {
                                        overall_progress: overall.round() as u8,
                                        phase_progress: event.percent.round() as u8,
                                        phase_index: event.phase_index,
                                        total_phases: event.total_phases,
                                        phase_name: event.phase.clone(),
                                        message: event.message.clone(),
                                        eta_seconds: 0,
                                    },
                                );
                                emit_log(&app_handle, "INFO", &format!("{} - {}", event.phase, event.message));
                            }
                            Ok(ScriptEvent::Log(event)) => {
                                let level = event.level.unwrap_or_else(|| "INFO".into());
                                emit_log(&app_handle, &level, &event.message);
                            }
                            Ok(ScriptEvent::Result(event)) => {
                                emit_log(&app_handle, "INFO", "Track generation succeeded.");
                                final_result = Some(ProcessingSuccessPayload {
                                    glb_path: event.glb_path,
                                    metadata_path: event.metadata_path,
                                    output_dir: event.output_dir,
                                    track: event.track,
                                    alignment: event.alignment,
                                });
                            }
                            Ok(ScriptEvent::Error(event)) => {
                                emit_log(&app_handle, "ERROR", &event.message);
                                return ProcessingOutcome::Failed(event.message);
                            }
                            Err(err) => {
                                emit_log(&app_handle, "WARN", &format!("Unparseable output: {line} ({err})"));
                            }
                        }
                    }
                    Ok(None) => {
                        break;
                    }
                    Err(err) => {
                        emit_log(&app_handle, "ERROR", &format!("Failed to read process stdout: {err}"));
                        break;
                    }
                }
            }
            maybe_err = async {
                if let Some(reader) = &mut stderr_reader {
                    reader.next_line().await
                } else {
                    Ok(None)
                }
            } => {
                if let Ok(Some(line)) = maybe_err {
                    if !line.trim().is_empty() {
                        emit_log(&app_handle, "WARN", &format!("[node] {line}"));
                    }
                }
            }
        }
    }

    let mut guard = child_ref.lock().await;
    if let Some(mut child_proc) = guard.take() {
        match child_proc.wait().await {
            Ok(status) => {
                if !status.success() {
                    return ProcessingOutcome::Failed(format!(
                        "Track generation exited with status {}",
                        status
                    ));
                }
            }
            Err(err) => {
                return ProcessingOutcome::Failed(format!(
                    "Failed to await track generation: {err}"
                ));
            }
        }
    }

    match final_result {
        Some(result) => ProcessingOutcome::Completed(result),
        None => ProcessingOutcome::Failed(
            "Track generation completed without producing a result payload.".into(),
        ),
    }
}

#[tauri::command]
pub fn generate_track(
    app_handle: AppHandle,
    payload: StartProcessingPayload,
) -> Result<(), String> {
    PROCESSING_MANAGER.start(app_handle, payload)
}

#[tauri::command]
pub fn cancel_processing() -> Result<(), String> {
    PROCESSING_MANAGER.cancel()
}

#[tauri::command]
pub fn processing_status() -> Result<bool, String> {
    Ok(PROCESSING_MANAGER.is_running())
}
