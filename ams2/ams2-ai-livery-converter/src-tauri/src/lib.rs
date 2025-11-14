// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to the AMS2 AI Livery Designer!", name)
}

#[tauri::command]
fn process_image(image_path: String) -> Result<String, String> {
    // TODO: Integrate with Python backend for AI processing
    Ok(format!("Processing image: {}", image_path))
}

#[tauri::command]
fn export_livery(car_id: String, output_path: String) -> Result<String, String> {
    // TODO: Export generated livery as DDS file
    Ok(format!("Exporting livery for {} to {}", car_id, output_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            process_image,
            export_livery
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
