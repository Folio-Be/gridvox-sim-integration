#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::paths::resolve_ams2_custom_liveries;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![resolve_ams2_custom_liveries])
        .setup(|app| {
            let window = app.get_window("main");
            if let Some(window) = window {
                window.set_title("GridVox AI Livery Designer").ok();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running GridVox Livery Designer");
}
