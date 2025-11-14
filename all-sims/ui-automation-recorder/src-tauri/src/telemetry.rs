use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Utc};
use serde::Serialize;
use std::{
    fs::File,
    io::{self, BufWriter, Write},
    path::Path,
    sync::{
        atomic::{AtomicBool, Ordering},
        mpsc::{self, Sender},
        Arc,
    },
    thread,
    time::Duration,
};
use windows::Win32::{
    Foundation::POINT,
    UI::{
        Input::KeyboardAndMouse::{
            GetAsyncKeyState, VK_LCONTROL, VK_LSHIFT, VK_RCONTROL, VK_RSHIFT, VK_SHIFT,
        },
        WindowsAndMessaging::GetCursorPos,
    },
};

#[derive(Serialize)]
struct TelemetryEvent {
    event: String,
    timestamp: DateTime<Utc>,
    cursor: Option<CursorPoint>,
    note: Option<String>,
}

#[derive(Serialize)]
struct CursorPoint {
    x: i32,
    y: i32,
}

enum TelemetryMessage {
    Event(TelemetryEvent),
    Stop,
}

pub struct TelemetryHandle {
    stop_flag: Arc<AtomicBool>,
    sender: Sender<TelemetryMessage>,
    writer_handle: Option<thread::JoinHandle<()>>,
    poll_handle: Option<thread::JoinHandle<()>>,
}

impl TelemetryHandle {
    pub fn start(
        log_path: &Path,
        bookmark_hotkey: &BookmarkHotkey,
        note_mode: BookmarkNoteMode,
    ) -> Result<Self> {
        let stop_flag = Arc::new(AtomicBool::new(true));
        let (tx, rx) = mpsc::channel::<TelemetryMessage>();
        let log_path = log_path.to_path_buf();
        let writer_handle = {
            let stop_clone = stop_flag.clone();
            thread::spawn(move || {
                if let Err(err) = Self::writer_loop(stop_clone, rx, &log_path) {
                    eprintln!("Telemetry writer error: {err:?}");
                }
            })
        };

        let poll_handle = {
            let stop_clone = stop_flag.clone();
            let tx_clone = tx.clone();
            let bookmark = bookmark_hotkey.clone();
            let note_clone = note_mode.clone();
            thread::spawn(move || Self::poll_loop(stop_clone, tx_clone, bookmark, note_clone))
        };

        Ok(Self {
            stop_flag,
            sender: tx,
            writer_handle: Some(writer_handle),
            poll_handle: Some(poll_handle),
        })
    }

    fn writer_loop(
        stop_flag: Arc<AtomicBool>,
        receiver: mpsc::Receiver<TelemetryMessage>,
        path: &Path,
    ) -> Result<()> {
        let file = File::create(path).with_context(|| {
            format!(
                "Failed to create telemetry log at {}",
                path.to_string_lossy()
            )
        })?;
        let mut writer = BufWriter::new(file);
        loop {
            match receiver.recv() {
                Ok(TelemetryMessage::Event(event)) => {
                    let line = serde_json::to_string(&event)
                        .context("Failed to serialize telemetry event")?;
                    writer
                        .write_all(line.as_bytes())
                        .context("Failed writing telemetry event")?;
                    writer
                        .write_all(b"\n")
                        .context("Failed writing telemetry newline")?;
                    writer.flush().ok();
                }
                Ok(TelemetryMessage::Stop) | Err(_) => break,
            }
            if !stop_flag.load(Ordering::SeqCst) {
                break;
            }
        }
        Ok(())
    }

    fn poll_loop(
        stop_flag: Arc<AtomicBool>,
        sender: Sender<TelemetryMessage>,
        bookmark_hotkey: BookmarkHotkey,
        note_mode: BookmarkNoteMode,
    ) {
        let mut bookmark_detector = BookmarkEdgeDetector::default();
        while stop_flag.load(Ordering::SeqCst) {
            if let Ok(point) = current_cursor_point() {
                let _ = sender.send(TelemetryMessage::Event(TelemetryEvent {
                    event: "cursor".into(),
                    timestamp: Utc::now(),
                    cursor: Some(point),
                    note: None,
                }));
            }

            if bookmark_detector.update(bookmark_hotkey.is_pressed()) {
                if let Ok(point) = current_cursor_point() {
                    let note = note_mode.capture_note();
                    let _ = sender.send(TelemetryMessage::Event(TelemetryEvent {
                        event: "bookmark".into(),
                        timestamp: Utc::now(),
                        cursor: Some(point),
                        note,
                    }));
                }
            }

            thread::sleep(Duration::from_millis(100));
        }
        let _ = sender.send(TelemetryMessage::Stop);
    }

    pub fn stop(mut self) {
        self.stop_flag.store(false, Ordering::SeqCst);
        let _ = self.sender.send(TelemetryMessage::Stop);
        if let Some(handle) = self.poll_handle.take() {
            handle.join().ok();
        }
        if let Some(handle) = self.writer_handle.take() {
            handle.join().ok();
        }
    }
}

#[derive(Clone)]
pub struct BookmarkHotkey {
    pub modifier_ctrl: bool,
    pub modifier_shift: bool,
    pub key_code: i32,
}

impl BookmarkHotkey {
    pub fn from_parts(ctrl: bool, shift: bool, key: Option<&str>) -> Self {
        let key_code = key.and_then(Self::parse_virtual_key).unwrap_or('L' as i32);
        Self {
            modifier_ctrl: ctrl,
            modifier_shift: shift,
            key_code,
        }
    }

    fn parse_virtual_key(value: &str) -> Option<i32> {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            return None;
        }

        if trimmed.len() == 1 {
            return trimmed
                .chars()
                .next()
                .map(|c| c.to_ascii_uppercase() as i32);
        }

        let upper = trimmed.to_ascii_uppercase();
        if let Some(num) = upper.strip_prefix('F') {
            if let Ok(idx) = num.parse::<i32>() {
                if (1..=24).contains(&idx) {
                    return Some(0x70 + idx - 1);
                }
            }
        }
        None
    }

    fn is_pressed(&self) -> bool {
        let ctrl_down =
            !self.modifier_ctrl || key_down(VK_LCONTROL.0 as i32) || key_down(VK_RCONTROL.0 as i32);
        let shift_down = !self.modifier_shift
            || key_down(VK_LSHIFT.0 as i32)
            || key_down(VK_RSHIFT.0 as i32)
            || key_down(VK_SHIFT.0 as i32);
        let key_down_state = key_down(self.key_code);
        ctrl_down && shift_down && key_down_state
    }
}

#[derive(Clone)]
pub enum BookmarkNoteMode {
    Disabled,
    StdinPrompt,
}

impl BookmarkNoteMode {
    pub fn from_cli_str(value: &str) -> Option<Self> {
        match value.to_ascii_lowercase().as_str() {
            "none" | "off" => Some(Self::Disabled),
            "stdin" | "prompt" | "console" => Some(Self::StdinPrompt),
            _ => None,
        }
    }

    fn capture_note(&self) -> Option<String> {
        match self {
            BookmarkNoteMode::Disabled => None,
            BookmarkNoteMode::StdinPrompt => {
                println!("\nBookmark captured. Enter note (leave blank to skip): ");
                let _ = io::stdout().flush();
                let mut buffer = String::new();
                if io::stdin().read_line(&mut buffer).is_ok() {
                    let note = buffer.trim().to_string();
                    if note.is_empty() {
                        None
                    } else {
                        Some(note)
                    }
                } else {
                    None
                }
            }
        }
    }
}

impl Default for BookmarkNoteMode {
    fn default() -> Self {
        Self::Disabled
    }
}

#[derive(Default)]
struct BookmarkEdgeDetector {
    last_state: bool,
}

impl BookmarkEdgeDetector {
    fn update(&mut self, pressed: bool) -> bool {
        let triggered = pressed && !self.last_state;
        self.last_state = pressed;
        triggered
    }
}

fn current_cursor_point() -> Result<CursorPoint> {
    unsafe {
        let mut point = POINT::default();
        if GetCursorPos(&mut point).as_bool() {
            Ok(CursorPoint {
                x: point.x,
                y: point.y,
            })
        } else {
            Err(anyhow!("GetCursorPos failed"))
        }
    }
}

fn key_down(vk: i32) -> bool {
    unsafe { (GetAsyncKeyState(vk) as u16) & 0x8000 != 0 }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{DateTime, Utc};

    #[test]
    fn telemetry_event_serializes_with_note() {
        let timestamp = DateTime::<Utc>::from_timestamp(0, 0).unwrap();
        let event = TelemetryEvent {
            event: "bookmark".into(),
            timestamp,
            cursor: Some(CursorPoint { x: 10, y: 20 }),
            note: Some("Pit exit".into()),
        };
        let json = serde_json::to_string(&event).unwrap();
        assert!(json.contains("\"event\":\"bookmark\""));
        assert!(json.contains("\"note\":\"Pit exit\""));
        assert!(json.contains("\"cursor\":{\"x\":10,\"y\":20}"));
    }

    #[test]
    fn bookmark_edge_detector_only_triggers_on_rising_edge() {
        let mut detector = BookmarkEdgeDetector::default();
        assert!(!detector.update(false));
        assert!(detector.update(true));
        assert!(!detector.update(true));
        assert!(!detector.update(false));
        assert!(detector.update(true));
    }

    #[test]
    fn bookmark_hotkey_parses_char_key() {
        let hotkey = BookmarkHotkey::from_parts(true, false, Some("k"));
        assert_eq!(hotkey.key_code, 'K' as i32);
    }

    #[test]
    fn bookmark_hotkey_handles_function_key() {
        let hotkey = BookmarkHotkey::from_parts(false, false, Some("F5"));
        assert_eq!(hotkey.key_code, 0x74);
    }
}
