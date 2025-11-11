use once_cell::sync::Lazy;
use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use tauri::async_runtime::{self, JoinHandle};
use tauri::{AppHandle, Emitter};
use tokio::time::sleep;

const PROGRESS_SLEEP_MS: u64 = 450;

#[derive(Clone, Copy)]
struct PhaseStep {
    level: &'static str,
    message: &'static str,
}

#[derive(Clone, Copy)]
struct Phase {
    name: &'static str,
    weight: u32,
    steps: &'static [PhaseStep],
}

const PHASE_1_STEPS: &[PhaseStep] = &[
    PhaseStep { level: "INFO", message: "Loading telemetry capture into workspace" },
    PhaseStep { level: "INFO", message: "Parsing lap boundaries and validating coverage" },
    PhaseStep { level: "INFO", message: "Normalizing telemetry signals" },
    PhaseStep { level: "INFO", message: "Data ingestion complete" },
];

const PHASE_2_STEPS: &[PhaseStep] = &[
    PhaseStep { level: "INFO", message: "Generating 3D point cloud" },
    PhaseStep { level: "INFO", message: "Aligning GPS coordinates" },
    PhaseStep { level: "WARN", message: "Smoothing G-force spikes" },
    PhaseStep { level: "INFO", message: "Interpolating missing frames" },
    PhaseStep { level: "INFO", message: "Point cloud normalization complete" },
];

const PHASE_3_STEPS: &[PhaseStep] = &[
    PhaseStep { level: "INFO", message: "Meshing track surface" },
    PhaseStep { level: "INFO", message: "Projecting rumble strips" },
    PhaseStep { level: "INFO", message: "Baking visual overlays" },
    PhaseStep { level: "INFO", message: "Track model finalized" },
];

const PHASES: &[Phase] = &[
    Phase { name: "Phase 1: Data Ingestion", weight: 35, steps: PHASE_1_STEPS },
    Phase { name: "Phase 2: Point Cloud Generation", weight: 45, steps: PHASE_2_STEPS },
    Phase { name: "Phase 3: Model Finalization", weight: 20, steps: PHASE_3_STEPS },
];

#[derive(Clone, Copy, Default, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartProcessingOptions {
    pub simulate_failure: Option<bool>,
}

#[derive(Clone, Serialize)]
struct ProcessingProgressPayload {
    overall_progress: u8,
    phase_progress: u8,
    phase_index: usize,
    total_phases: usize,
    phase_name: &'static str,
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
struct ProcessingCompletePayload {
    success: bool,
    message: Option<String>,
}

#[derive(Clone, Serialize)]
struct ProcessingErrorPayload {
    message: String,
}

struct ProcessingTask {
    cancel_flag: Arc<AtomicBool>,
    handle: JoinHandle<()>,
}

struct ProcessingManager {
    task: Mutex<Option<ProcessingTask>>,
}

impl ProcessingManager {
    const fn new() -> Self {
        Self { task: Mutex::new(None) }
    }

    fn start(&self, app_handle: AppHandle, options: StartProcessingOptions) -> Result<(), String> {
        let mut guard = self
            .task
            .lock()
            .map_err(|_| "Processing state is unavailable".to_string())?;

        if guard.is_some() {
            return Err("Processing is already running".into());
        }

        let cancel_flag = Arc::new(AtomicBool::new(false));
        let cancel_clone = cancel_flag.clone();
        let simulate_failure = options.simulate_failure.unwrap_or(false);

        let handle = async_runtime::spawn(async move {
            let outcome = processing_worker(app_handle.clone(), cancel_clone, simulate_failure).await;

            match outcome {
                ProcessingOutcome::Completed => {
                    let _ = app_handle.emit(
                        "processing-complete",
                        ProcessingCompletePayload {
                            success: true,
                            message: Some("Track processing finished successfully.".into()),
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

        *guard = Some(ProcessingTask { cancel_flag, handle });
        Ok(())
    }

    fn cancel(&self) -> Result<(), String> {
        let guard = self
            .task
            .lock()
            .map_err(|_| "Processing state is unavailable".to_string())?;

        if let Some(task) = guard.as_ref() {
            task.cancel_flag.store(true, Ordering::SeqCst);
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
    Completed,
    Cancelled,
    Failed(String),
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

async fn processing_worker(
    app_handle: AppHandle,
    cancel_flag: Arc<AtomicBool>,
    simulate_failure: bool,
) -> ProcessingOutcome {
    emit_log(&app_handle, "INFO", "Processing pipeline started.");

    let total_weight: u32 = PHASES.iter().map(|phase| phase.weight).sum();
    let mut completed_weight: u32 = 0;

    for (phase_index, phase) in PHASES.iter().enumerate() {
        emit_log(&app_handle, "INFO", &format!("{} started.", phase.name));

        let steps = phase.steps;
        if steps.is_empty() {
            continue;
        }

        for (step_index, step) in steps.iter().enumerate() {
            if cancel_flag.load(Ordering::SeqCst) {
                emit_log(&app_handle, "WARN", "Processing cancelled by user.");
                return ProcessingOutcome::Cancelled;
            }

            // Simulate an error halfway through the final phase when requested.
            if simulate_failure && phase_index == PHASES.len() - 1 && step_index == steps.len() / 2 {
                emit_log(
                    &app_handle,
                    "ERROR",
                    "Mesh generation failed: invalid lap coverage detected.",
                );
                return ProcessingOutcome::Failed(
                    "Track meshing failed due to inconsistent lap coverage.".into(),
                );
            }

            let phase_progress = (((step_index + 1) * 100) / steps.len()).min(100) as u8;
            let phase_fraction = phase_progress as f32 / 100.0;
            let weighted_progress = completed_weight as f32 + (phase.weight as f32 * phase_fraction);
            let overall_progress = ((weighted_progress / total_weight as f32) * 100.0)
                .clamp(0.0, 100.0)
                .round() as u8;

            let remaining_weight = (total_weight as f32 - weighted_progress).max(0.0);
            let eta_seconds = (remaining_weight * (PROGRESS_SLEEP_MS as f32 / 1000.0))
                .round()
                .max(0.0) as u64;

            let _ = app_handle.emit(
                "processing-progress",
                ProcessingProgressPayload {
                    overall_progress,
                    phase_progress,
                    phase_index,
                    total_phases: PHASES.len(),
                    phase_name: phase.name,
                    message: step.message.to_string(),
                    eta_seconds,
                },
            );

            emit_log(&app_handle, step.level, step.message);
            sleep(std::time::Duration::from_millis(PROGRESS_SLEEP_MS)).await;
        }

        completed_weight += phase.weight;
        emit_log(&app_handle, "INFO", &format!("{} completed.", phase.name));
    }

    emit_log(&app_handle, "INFO", "Processing pipeline completed successfully.");
    ProcessingOutcome::Completed
}

#[tauri::command]
pub fn start_processing(
    app_handle: AppHandle,
    options: Option<StartProcessingOptions>,
) -> Result<(), String> {
    PROCESSING_MANAGER.start(app_handle, options.unwrap_or_default())
}

#[tauri::command]
pub fn cancel_processing() -> Result<(), String> {
    PROCESSING_MANAGER.cancel()
}

#[tauri::command]
pub fn processing_status() -> Result<bool, String> {
    Ok(PROCESSING_MANAGER.is_running())
}
