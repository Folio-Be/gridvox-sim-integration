use chrono::Local;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{create_dir_all, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::path::BaseDirectory;
use tauri::Manager;

const STORAGE_FILE_NAME: &str = "run_type_assignments.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredTelemetryPoint {
    pub timestamp: u64,
    pub speed: f32,
    pub position: [f32; 3],
    pub throttle: f32,
    pub brake: f32,
    pub gear: i32,
    pub rpm: f32,
    pub lap_distance: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredRunTypeAssignment {
    pub lap_id: u64,
    pub lap_number: u32,
    pub assigned_at: u64,
    pub validity: String,
    pub time_seconds: Option<f32>,
    pub distance_meters: Option<f32>,
    pub telemetry_points: Vec<StoredTelemetryPoint>,
}

type RunTypeMap = HashMap<String, HashMap<String, StoredRunTypeAssignment>>;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportRunTypeRecordingsRequest {
    pub track_key: String,
    pub track_location: String,
    #[serde(default)]
    pub track_variation: String,
    pub assignments: HashMap<String, StoredRunTypeAssignment>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportRunTypeRecordingResult {
    pub run_type: String,
    pub file_path: String,
}

fn storage_path<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let mut base = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;
    base.push("simvox");
    if let Err(err) = create_dir_all(&base) {
        return Err(format!("Unable to create storage directory: {err}"));
    }
    base.push(STORAGE_FILE_NAME);
    Ok(base)
}

fn read_all<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Result<RunTypeMap, String> {
    let path = storage_path(app)?;
    if !path.exists() {
        return Ok(HashMap::new());
    }

    let mut file =
        File::open(&path).map_err(|err| format!("Failed to open storage file: {err}"))?;
    let mut buffer = String::new();
    file.read_to_string(&mut buffer)
        .map_err(|err| format!("Failed to read storage file: {err}"))?;

    if buffer.trim().is_empty() {
        return Ok(HashMap::new());
    }

    serde_json::from_str(&buffer).map_err(|err| format!("Failed to parse storage file: {err}"))
}

fn write_all<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    data: &RunTypeMap,
) -> Result<(), String> {
    let path = storage_path(app)?;
    let mut file =
        File::create(&path).map_err(|err| format!("Failed to create storage file: {err}"))?;
    let contents = serde_json::to_string_pretty(data)
        .map_err(|err| format!("Failed to serialize assignments: {err}"))?;
    file.write_all(contents.as_bytes())
        .map_err(|err| format!("Failed to write assignments: {err}"))
}

#[tauri::command]
pub fn load_run_type_assignments<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    track_key: String,
) -> Result<HashMap<String, StoredRunTypeAssignment>, String> {
    let all = read_all(&app)?;
    Ok(all.get(&track_key).cloned().unwrap_or_default())
}

#[tauri::command]
pub fn save_run_type_assignment<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    track_key: String,
    run_type: String,
    assignment: StoredRunTypeAssignment,
) -> Result<(), String> {
    let mut all = read_all(&app)?;
    let run_type_entry = all.entry(track_key).or_insert_with(HashMap::new);
    run_type_entry.insert(run_type, assignment);
    write_all(&app, &all)
}

fn slugify_component(input: &str) -> String {
    let mut slug = String::with_capacity(input.len());
    let mut prev_hyphen = false;
    for ch in input.chars() {
        let lower = ch.to_ascii_lowercase();
        if lower.is_ascii_alphanumeric() {
            slug.push(lower);
            prev_hyphen = false;
        } else if lower.is_ascii_whitespace() || matches!(lower, '-' | '_' | '.') {
            if !prev_hyphen && !slug.is_empty() {
                slug.push('-');
                prev_hyphen = true;
            }
        }
    }
    while slug.ends_with('-') {
        slug.pop();
    }
    if slug.is_empty() {
        "track".to_string()
    } else {
        slug
    }
}

fn build_track_slug(location: &str, variation: &str) -> String {
    if variation.trim().is_empty() {
        slugify_component(location)
    } else {
        format!(
            "{}-{}",
            slugify_component(location),
            slugify_component(variation)
        )
    }
}

fn resolve_telemetry_dir<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let mut attempts: Vec<PathBuf> = Vec::new();

    if let Ok(path) = app.path().resolve("telemetry-data", BaseDirectory::AppData) {
        attempts.push(path);
    }
    if let Ok(path) = app
        .path()
        .resolve("telemetry-data", BaseDirectory::AppConfig)
    {
        attempts.push(path);
    }
    if let Ok(path) = app
        .path()
        .resolve("telemetry-data", BaseDirectory::Resource)
    {
        attempts.push(path);
    }

    if let Ok(mut cwd) = std::env::current_dir() {
        if cwd
            .file_name()
            .map(|name| name == "src-tauri")
            .unwrap_or(false)
        {
            cwd.pop();
        }
        attempts.push(cwd.join("telemetry-data"));
    }

    let mut last_error = None;
    for path in attempts {
        if let Err(err) = create_dir_all(&path) {
            last_error = Some(format!("{}: {}", path.display(), err));
            continue;
        }
        return Ok(path);
    }

    Err(last_error.unwrap_or_else(|| "Unable to determine telemetry-data directory".to_string()))
}

fn safe_file_path(dir: &Path, base_name: &str, run_type: &str) -> PathBuf {
    let candidate = dir.join(format!("{}-{}.json", base_name, run_type));
    if !candidate.exists() {
        return candidate;
    }
    let timestamp = Local::now().format("%Y%m%d-%H%M%S");
    dir.join(format!("{}-{}-{}.json", base_name, run_type, timestamp))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportFilePayload<'a> {
    track_key: &'a str,
    track: ExportTrackMetadata<'a>,
    run_type: &'a str,
    exported_at: String,
    lap: ExportLapMetadata<'a>,
    telemetry: &'a [StoredTelemetryPoint],
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportTrackMetadata<'a> {
    location: &'a str,
    variation: &'a str,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportLapMetadata<'a> {
    id: u64,
    number: u32,
    validity: &'a str,
    time_seconds: Option<f32>,
    distance_meters: Option<f32>,
    assigned_at: u64,
}

#[tauri::command]
pub fn export_run_type_recordings<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    payload: ExportRunTypeRecordingsRequest,
) -> Result<Vec<ExportRunTypeRecordingResult>, String> {
    if payload.track_key.trim().is_empty() {
        return Err("Track key is required to export recordings.".into());
    }
    if payload.track_location.trim().is_empty() {
        return Err("Track location is required to export recordings.".into());
    }

    let telemetry_dir = resolve_telemetry_dir(&app)?;
    let track_slug = build_track_slug(&payload.track_location, &payload.track_variation);
    let exported_at = Local::now().to_rfc3339();

    let mut results = Vec::new();

    for (run_type, assignment) in payload.assignments.iter() {
        if assignment.telemetry_points.is_empty() {
            return Err(format!(
                "{} recording does not contain telemetry points.",
                run_type
            ));
        }

        let file_path = safe_file_path(&telemetry_dir, &track_slug, run_type);
        let export_payload = ExportFilePayload {
            track_key: &payload.track_key,
            track: ExportTrackMetadata {
                location: &payload.track_location,
                variation: &payload.track_variation,
            },
            run_type,
            exported_at: exported_at.clone(),
            lap: ExportLapMetadata {
                id: assignment.lap_id,
                number: assignment.lap_number,
                validity: &assignment.validity,
                time_seconds: assignment.time_seconds,
                distance_meters: assignment.distance_meters,
                assigned_at: assignment.assigned_at,
            },
            telemetry: &assignment.telemetry_points,
        };

        let serialized = serde_json::to_string_pretty(&export_payload)
            .map_err(|err| format!("Failed to serialise export payload: {err}"))?;
        let mut file = File::create(&file_path)
            .map_err(|err| format!("Failed to create telemetry export file: {err}"))?;
        file.write_all(serialized.as_bytes())
            .map_err(|err| format!("Failed to write telemetry export file: {err}"))?;

        results.push(ExportRunTypeRecordingResult {
            run_type: run_type.clone(),
            file_path: file_path
                .canonicalize()
                .unwrap_or(file_path)
                .to_string_lossy()
                .to_string(),
        });
    }

    Ok(results)
}

#[tauri::command]
pub fn delete_run_type_assignment<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    track_key: String,
    run_type: String,
) -> Result<(), String> {
    if track_key.trim().is_empty() || run_type.trim().is_empty() {
        return Ok(());
    }

    let mut all = read_all(&app)?;
    if let Some(run_type_map) = all.get_mut(&track_key) {
        let removed = run_type_map.remove(&run_type).is_some();
        if removed {
            if run_type_map.is_empty() {
                all.remove(&track_key);
            }
            write_all(&app, &all)?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn clear_run_type_assignments<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    track_key: String,
) -> Result<(), String> {
    if track_key.trim().is_empty() {
        return Ok(());
    }

    let mut all = read_all(&app)?;
    let removed = all.remove(&track_key).is_some();

    if removed || all.is_empty() {
        write_all(&app, &all)?;
    }

    Ok(())
}
