// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod telemetry_bridge;

use commands::{show_overlay, hide_overlay, is_overlay_visible, play_overlay_video};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            show_overlay,
            hide_overlay,
            is_overlay_visible,
            play_overlay_video,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
