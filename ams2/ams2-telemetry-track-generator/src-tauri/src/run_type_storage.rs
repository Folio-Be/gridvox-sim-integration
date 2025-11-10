use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{create_dir_all, File};
use std::io::{Read, Write};
use std::path::PathBuf;
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

fn storage_path<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let mut base = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;
    base.push("gridvox");
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

    let mut file = File::open(&path).map_err(|err| format!("Failed to open storage file: {err}"))?;
    let mut buffer = String::new();
    file.read_to_string(&mut buffer)
        .map_err(|err| format!("Failed to read storage file: {err}"))?;

    if buffer.trim().is_empty() {
        return Ok(HashMap::new());
    }

    serde_json::from_str(&buffer).map_err(|err| format!("Failed to parse storage file: {err}"))
}

fn write_all<R: tauri::Runtime>(app: &tauri::AppHandle<R>, data: &RunTypeMap) -> Result<(), String> {
    let path = storage_path(app)?;
    let mut file = File::create(&path).map_err(|err| format!("Failed to create storage file: {err}"))?;
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
