use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
pub fn show_overlay(app: AppHandle) -> Result<(), String> {
    let overlay = app.get_webview_window("overlay")
        .ok_or("Overlay window not found")?;
    
    overlay.show().map_err(|e| e.to_string())?;
    overlay.set_focus().map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    let overlay = app.get_webview_window("overlay")
        .ok_or("Overlay window not found")?;
    
    overlay.hide().map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn is_overlay_visible(app: AppHandle) -> Result<bool, String> {
    let overlay = app.get_webview_window("overlay")
        .ok_or("Overlay window not found")?;
    
    overlay.is_visible().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn play_overlay_video(
    app: AppHandle,
    video_path: String,
) -> Result<(), String> {
    // Show overlay window
    let overlay = app.get_webview_window("overlay")
        .ok_or("Overlay window not found")?;
    
    overlay.show().map_err(|e| e.to_string())?;
    overlay.set_focus().map_err(|e| e.to_string())?;

    // Emit event to overlay window to start playing video
    app.emit("play-overlay-video", serde_json::json!({
        "src": video_path
    })).map_err(|e| e.to_string())?;

    Ok(())
}
