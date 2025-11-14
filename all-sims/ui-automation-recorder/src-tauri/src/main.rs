#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Utc};
use parking_lot::Mutex;
use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::mpsc;
use tauri::{
    api::cli::{ArgData, Matches},
    Manager, State,
};

mod telemetry;
use telemetry::{BookmarkHotkey, BookmarkNoteMode, TelemetryHandle};

#[derive(Default)]
struct RecorderState {
    session: Mutex<Option<RecordingSession>>,
}

#[derive(Clone, Copy)]
struct CropRegion {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

struct RecordingSession {
    window_title: String,
    output_path: PathBuf,
    input_log_path: PathBuf,
    started_at: DateTime<Utc>,
    _ffmpeg_path: String,
    fps: u32,
    child: Child,
    telemetry: Option<TelemetryHandle>,
}

#[derive(Serialize)]
struct RecordingStatus {
    is_recording: bool,
    window_title: Option<String>,
    output_path: Option<String>,
    started_at: Option<DateTime<Utc>>,
    fps: Option<u32>,
}

#[tauri::command]
fn start_recording(
    state: State<'_, RecorderState>,
    window_title: String,
    output_path: String,
    ffmpeg_path: Option<String>,
    fps: Option<u32>,
    bookmark_ctrl: Option<bool>,
    bookmark_shift: Option<bool>,
    bookmark_key: Option<String>,
    bookmark_note_mode: Option<String>,
    crop_x: Option<i32>,
    crop_y: Option<i32>,
    crop_width: Option<i32>,
    crop_height: Option<i32>,
) -> Result<RecordingStatus, String> {
    let hotkey = BookmarkHotkey::from_parts(
        bookmark_ctrl.unwrap_or(true),
        bookmark_shift.unwrap_or(false),
        bookmark_key.as_deref(),
    );
    let note_mode = bookmark_note_mode
        .as_deref()
        .and_then(BookmarkNoteMode::from_cli_str)
        .unwrap_or_default();
    let crop = crop_region_from_parts(crop_x, crop_y, crop_width, crop_height)
        .map_err(|err| err.to_string())?;
    start_recording_impl(
        &state,
        &window_title,
        &output_path,
        ffmpeg_path.as_deref().unwrap_or("ffmpeg"),
        fps.unwrap_or(60),
        crop,
        hotkey,
        note_mode,
    )
    .map_err(|err| err.to_string())
}

#[tauri::command]
fn stop_recording(state: State<'_, RecorderState>) -> Result<String, String> {
    stop_recording_impl(&state)
        .map(|(video, log)| {
            format!(
                "Recording saved to {} (input log {})",
                video.display(),
                log.display()
            )
        })
        .map_err(|err| err.to_string())
}

#[tauri::command]
fn get_recording_status(state: State<'_, RecorderState>) -> RecordingStatus {
    status_from_state(&state)
}

fn status_from_state(state: &RecorderState) -> RecordingStatus {
    let guard = state.session.lock();
    if let Some(session) = guard.as_ref() {
        RecordingStatus {
            is_recording: true,
            window_title: Some(session.window_title.clone()),
            output_path: Some(session.output_path.to_string_lossy().to_string()),
            started_at: Some(session.started_at.clone()),
            fps: Some(session.fps),
        }
    } else {
        RecordingStatus {
            is_recording: false,
            window_title: None,
            output_path: None,
            started_at: None,
            fps: None,
        }
    }
}

fn start_recording_impl(
    state: &RecorderState,
    window_title: &str,
    output_path: &str,
    ffmpeg_path: &str,
    fps: u32,
    crop_region: Option<CropRegion>,
    bookmark_hotkey: BookmarkHotkey,
    note_mode: BookmarkNoteMode,
) -> Result<RecordingStatus> {
    let mut guard = state.session.lock();
    if guard.is_some() {
        return Err(anyhow!("Recording already in progress"));
    }

    let output_path = PathBuf::from(output_path);
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create directory {}", parent.display()))?;
    }
    let input_log_path = output_path.with_extension("inputs.jsonl");
    let telemetry_handle = TelemetryHandle::start(&input_log_path, &bookmark_hotkey, note_mode)
        .context("Failed to start telemetry logger")?;

    let mut cmd = Command::new(ffmpeg_path);
    cmd.args([
        "-y",
        "-f",
        "gdigrab",
        "-draw_mouse",
        "1",
        "-framerate",
        &fps.to_string(),
        "-i",
        &format!("title={}", window_title),
    ])
    .stdin(Stdio::null())
    .stdout(Stdio::inherit())
    .stderr(Stdio::inherit());

    if let Some(region) = crop_region {
        cmd.args([
            "-vf",
            &format!(
                "crop={}:{}:{}:{}",
                region.width, region.height, region.x, region.y
            ),
        ]);
    }

    cmd.arg(output_path.to_string_lossy().as_ref());

    let child = cmd
        .spawn()
        .with_context(|| format!("Failed to launch ffmpeg at {}", ffmpeg_path))?;

    let session = RecordingSession {
        window_title: window_title.to_string(),
        output_path,
        input_log_path,
        started_at: Utc::now(),
        _ffmpeg_path: ffmpeg_path.to_string(),
        fps,
        child,
        telemetry: Some(telemetry_handle),
    };
    let status = RecordingStatus {
        is_recording: true,
        window_title: Some(session.window_title.clone()),
        output_path: Some(session.output_path.to_string_lossy().to_string()),
        started_at: Some(session.started_at.clone()),
        fps: Some(session.fps),
    };
    *guard = Some(session);

    Ok(status)
}

fn stop_recording_impl(state: &RecorderState) -> Result<(PathBuf, PathBuf)> {
    let mut guard = state.session.lock();
    let mut session = guard.take().ok_or_else(|| anyhow!("No active recording"))?;
    if let Some(telemetry) = session.telemetry.take() {
        telemetry.stop();
    }
    session.child.kill().ok();
    session.child.wait().ok();
    Ok((session.output_path, session.input_log_path))
}

fn handle_cli(app: &mut tauri::App, matches: &Matches) -> Result<()> {
    if let Some(sub) = matches.subcommand.as_ref() {
        if sub.name == "record" {
            let args = &sub.matches.args;
            let window =
                arg_string(args, "window").unwrap_or_else(|| "Automobilista 2".to_string());
            let output = arg_string(args, "output")
                .unwrap_or_else(|| "data/recordings/recording.mp4".to_string());
            let ffmpeg = arg_string(args, "ffmpeg").unwrap_or_else(|| "ffmpeg".to_string());
            let fps = arg_string(args, "fps")
                .and_then(|v| v.parse::<u32>().ok())
                .unwrap_or(60);
            let bookmark_ctrl = arg_bool(args, "bookmark-ctrl");
            let bookmark_shift = arg_bool(args, "bookmark-shift");
            let bookmark_key = arg_string(args, "bookmark-key");
            let bookmark_note_mode = arg_string(args, "bookmark-note-mode");
            let crop_x = arg_i32(args, "crop-x");
            let crop_y = arg_i32(args, "crop-y");
            let crop_width = arg_i32(args, "crop-width");
            let crop_height = arg_i32(args, "crop-height");
            let hotkey = BookmarkHotkey::from_parts(
                bookmark_ctrl.unwrap_or(true),
                bookmark_shift.unwrap_or(false),
                bookmark_key.as_deref(),
            );
            let note_mode = bookmark_note_mode
                .as_deref()
                .and_then(BookmarkNoteMode::from_cli_str)
                .unwrap_or_default();
            let crop_region = crop_region_from_parts(crop_x, crop_y, crop_width, crop_height)?;

            let state = app.state::<RecorderState>();
            start_recording_impl(
                &state,
                &window,
                &output,
                &ffmpeg,
                fps,
                crop_region,
                hotkey,
                note_mode,
            )?;
            println!("Recording '{}' -> {}", window, output);
            println!("Press Ctrl+C to stop...");

            let (tx, rx) = mpsc::channel();
            ctrlc::set_handler(move || {
                let _ = tx.send(());
            })
            .expect("Error setting Ctrl+C handler");
            rx.recv().ok();

            stop_recording_impl(&state)?;
            println!("Stopped recording");
            std::process::exit(0);
        }
    }

    Ok(())
}

fn arg_string(args: &HashMap<String, ArgData>, name: &str) -> Option<String> {
    args.get(name).and_then(|data| match &data.value {
        Value::String(s) => Some(s.clone()),
        Value::Array(arr) => arr.first().and_then(|v| v.as_str().map(|s| s.to_string())),
        Value::Number(n) => Some(n.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        _ => None,
    })
}

fn arg_bool(args: &HashMap<String, ArgData>, name: &str) -> Option<bool> {
    arg_string(args, name).and_then(|value| {
        let lower = value.to_ascii_lowercase();
        match lower.as_str() {
            "true" | "1" | "yes" | "y" => Some(true),
            "false" | "0" | "no" | "n" => Some(false),
            _ => None,
        }
    })
}

fn arg_i32(args: &HashMap<String, ArgData>, name: &str) -> Option<i32> {
    arg_string(args, name).and_then(|value| value.parse::<i32>().ok())
}

fn crop_region_from_parts(
    x: Option<i32>,
    y: Option<i32>,
    width: Option<i32>,
    height: Option<i32>,
) -> Result<Option<CropRegion>> {
    match (x, y, width, height) {
        (Some(x), Some(y), Some(w), Some(h)) => {
            if w <= 0 || h <= 0 {
                return Err(anyhow!("Crop width/height must be positive values"));
            }
            Ok(Some(CropRegion {
                x,
                y,
                width: w as u32,
                height: h as u32,
            }))
        }
        (None, None, None, None) => Ok(None),
        _ => Err(anyhow!(
            "Crop region requires x, y, width, and height or none of them"
        )),
    }
}

fn main() {
    tauri::Builder::default()
        .manage(RecorderState::default())
        .invoke_handler(tauri::generate_handler![
            start_recording,
            stop_recording,
            get_recording_status
        ])
        .setup(|app| {
            if let Ok(matches) = app.get_cli_matches() {
                handle_cli(app, &matches)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
