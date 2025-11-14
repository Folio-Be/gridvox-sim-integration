use serde::Serialize;
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Serialize)]
pub struct InstallPaths {
    pub ams2: Option<String>,
}

/// Attempt to resolve the Automobilista 2 custom liveries directory.
#[tauri::command]
pub fn resolve_ams2_custom_liveries(_app_handle: AppHandle) -> InstallPaths {
    let candidates = vec![
        dirs::document_dir()
            .map(|path| path.join("Automobilista 2\\UserData\\CustomLiveries")),
        Some(PathBuf::from(r"C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\UserData\CustomLiveries")),
    ];

    let resolved = candidates.into_iter().flatten().find(|path| path.exists());

    InstallPaths {
        ams2: resolved.map(|path| path.to_string_lossy().to_string()),
    }
}
