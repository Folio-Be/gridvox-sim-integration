mod audio;
mod run_type_storage;
mod telemetry;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn start_native_recording() -> Result<String, String> {
    audio::start_recording()
}

#[tauri::command]
fn stop_native_recording() -> Result<String, String> {
    audio::stop_recording()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            start_native_recording,
            stop_native_recording,
            telemetry::start_telemetry,
            telemetry::stop_telemetry,
            telemetry::is_telemetry_running,
            run_type_storage::load_run_type_assignments,
            run_type_storage::save_run_type_assignment
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
