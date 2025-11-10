use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use tauri::Emitter;

#[cfg(target_os = "windows")]
use winapi::shared::minwindef::{FALSE, LPVOID};
#[cfg(target_os = "windows")]
use winapi::um::handleapi::CloseHandle;
#[cfg(target_os = "windows")]
use winapi::um::memoryapi::{MapViewOfFile, OpenFileMappingW, UnmapViewOfFile, FILE_MAP_READ};
#[cfg(target_os = "windows")]
use winapi::um::winnt::HANDLE;

const STRING_LENGTH_MAX: usize = 64;
const STORED_PARTICIPANTS_MAX: usize = 64;
const VEC_MAX: usize = 3;

#[repr(C)]
#[derive(Debug, Clone, Copy)]
struct ParticipantInfo {
    is_active: bool,
    name: [u8; STRING_LENGTH_MAX],
    world_position: [f32; VEC_MAX],
    current_lap_distance: f32,
    race_position: u32,
    laps_completed: u32,
    current_lap: u32,
    current_sector: i32,
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
struct SharedMemoryData {
    // Header - MUST match exact order from shared_memory_struct.py
    version: u32,
    build_version_number: u32,  // CRITICAL: was missing, causing misalignment

    // Session & Race State
    game_state: u32,
    session_state: u32,
    race_state: u32,
    viewed_participant_index: i32,
    num_participants: i32,

    // Participants array
    participant_info: [ParticipantInfo; STORED_PARTICIPANTS_MAX],

    // Car controls (unfiltered)
    unfiltered_throttle: f32,
    unfiltered_brake: f32,
    unfiltered_steering: f32,
    unfiltered_clutch: f32,

    // Car & Track info
    car_name: [u8; STRING_LENGTH_MAX],
    car_class_name: [u8; STRING_LENGTH_MAX],
    laps_in_event: u32,
    track_location: [u8; STRING_LENGTH_MAX],
    track_variation: [u8; STRING_LENGTH_MAX],
    track_length: f32,

    // Lap data
    num_sectors: i32,
    lap_invalidated: bool,
    best_lap_time: f32,
    last_lap_time: f32,
    current_time: f32,
    split_time_ahead: f32,
    split_time_behind: f32,
    split_time: f32,
    event_time_remaining: f32,
    personal_fastest_lap_time: f32,
    world_fastest_lap_time: f32,
    current_sector1_time: f32,
    current_sector2_time: f32,
    current_sector3_time: f32,
    fastest_sector1_time: f32,
    fastest_sector2_time: f32,
    fastest_sector3_time: f32,
    personal_fastest_sector1_time: f32,
    personal_fastest_sector2_time: f32,
    personal_fastest_sector3_time: f32,
    world_fastest_sector1_time: f32,
    world_fastest_sector2_time: f32,
    world_fastest_sector3_time: f32,

    // Flags
    highest_flag_colour: u32,
    highest_flag_reason: u32,

    // Pit Info
    pit_mode: u32,
    pit_schedule: u32,

    // Car state
    car_flags: u32,
    oil_temp_celsius: f32,
    oil_pressure_kpa: f32,
    water_temp_celsius: f32,
    water_pressure_kpa: f32,
    fuel_pressure_kpa: f32,
    fuel_level: f32,
    fuel_capacity: f32,
    speed: f32,
    rpm: f32,
    max_rpm: f32,
    brake: f32,
    throttle: f32,
    clutch: f32,
    steering: f32,
    gear: i32,
    num_gears: i32,
    odometer_km: f32,
    anti_lock_active: bool,
    last_opponent_collision_index: i32,
    last_opponent_collision_magnitude: f32,
    boost_active: bool,
    boost_amount: f32,

    // Motion & Physics (3-component vectors)
    orientation: [f32; VEC_MAX],
    local_velocity: [f32; VEC_MAX],
    world_velocity: [f32; VEC_MAX],
    angular_velocity: [f32; VEC_MAX],
    local_acceleration: [f32; VEC_MAX],
    world_acceleration: [f32; VEC_MAX],
    extents_centre: [f32; VEC_MAX],

    // Tyres (4-wheel arrays)
    tyre_flags: [u32; 4],
    terrain: [u32; 4],
    tyre_y: [f32; 4],
    tyre_rps: [f32; 4],
    tyre_slip_speed: [f32; 4],
    tyre_temp: [f32; 4],
    tyre_height_above_ground: [f32; 4],
    tyre_wear: [f32; 4],
    brake_damage: [f32; 4],
    suspension_damage: [f32; 4],
    brake_temp_celsius: [f32; 4],
    tyre_tread_temp: [f32; 4],
    tyre_layer_temp: [f32; 4],
    tyre_carcass_temp: [f32; 4],
    tyre_rim_temp: [f32; 4],
    tyre_internal_air_temp: [f32; 4],

    // Damage
    crash_state: u32,
    aero_damage: f32,
    engine_damage: f32,

    // Weather
    ambient_temperature: f32,
    track_temperature: f32,
    rain_density: f32,
    wind_speed: f32,
    wind_direction_x: f32,
    wind_direction_y: f32,
    cloud_brightness: f32,
    sequence_number: u32,

    // Additional arrays (note: field order matters for C struct alignment!)
    // NOTE: The Python struct has MANY more fields here (wheel positions, suspension, participant arrays, etc.)
    // We only define fields up to what we actually need to read
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Participant {
    pub index: usize,
    pub is_active: bool,
    pub name: String,
    pub world_position: [f32; 3],
    pub current_lap_distance: f32,
    pub race_position: u32,
    pub current_lap: u32,
    pub laps_completed: u32,
    pub speed: f32,
    pub pit_mode: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryData {
    pub game_state: u32,
    pub session_state: u32,
    pub race_state: u32,
    pub viewed_participant_index: i32,
    pub num_participants: i32,
    pub participants: Vec<Participant>,

    pub speed: f32,
    pub rpm: f32,
    pub max_rpm: f32,
    pub gear: i32,
    pub num_gears: i32,

    pub throttle: f32,
    pub brake: f32,
    pub clutch: f32,
    pub steering: f32,

    pub track_location: String,
    pub track_variation: String,
    pub track_length: f32,

    pub current_time: f32,
    pub event_time_remaining: f32,

    pub split_time_ahead: f32,
    pub split_time_behind: f32,

    pub highest_flag_color: u32,
    pub highest_flag_reason: u32,

    pub fuel_level: f32,
    pub fuel_capacity: f32,

    pub rain_density: f32,

    pub sequence_number: u32,
    pub timestamp: u64,
}

#[cfg(target_os = "windows")]
struct SharedMemoryReader {
    handle: HANDLE,
    buffer: LPVOID,
}

#[cfg(target_os = "windows")]
impl SharedMemoryReader {
    fn new() -> Result<Self, String> {
        unsafe {
            // Convert "$pcars2$" to wide string (UTF-16)
            let name: Vec<u16> = "$pcars2$\0".encode_utf16().collect();
            eprintln!("Attempting to open shared memory: $pcars2$");
            let handle = OpenFileMappingW(FILE_MAP_READ, FALSE, name.as_ptr());

            if handle.is_null() {
                return Err(format!("Failed to open shared memory '$pcars2$'. Is AMS2 running with shared memory enabled?"));
            }

            eprintln!("Shared memory handle obtained, mapping view...");
            let buffer = MapViewOfFile(
                handle,
                FILE_MAP_READ,
                0,
                0,
                std::mem::size_of::<SharedMemoryData>(),
            );

            if buffer.is_null() {
                CloseHandle(handle);
                return Err(format!("Failed to map shared memory view"));
            }

            // Validate that AMS2 is actually running by checking shared memory content
            let data = &*(buffer as *const SharedMemoryData);

            // Check if version is valid (should be non-zero when game is running)
            if data.version == 0 {
                UnmapViewOfFile(buffer);
                CloseHandle(handle);
                return Err(format!("AMS2 shared memory exists but version is 0 (game not running or not in session)"));
            }

            eprintln!("Shared memory mapped successfully - Version: {}, Build: {}", data.version, data.build_version_number);
            Ok(Self { handle, buffer })
        }
    }

    fn read(&self) -> Result<TelemetryData, String> {
        unsafe {
            let data = &*(self.buffer as *const SharedMemoryData);

            let mut participants = Vec::new();
            for i in 0..data.num_participants.min(STORED_PARTICIPANTS_MAX as i32) {
                let p = &data.participant_info[i as usize];

                let name = std::str::from_utf8(&p.name)
                    .unwrap_or("Unknown")
                    .trim_end_matches('\0')
                    .to_string();

                participants.push(Participant {
                    index: i as usize,
                    is_active: p.is_active,
                    name,
                    world_position: p.world_position,
                    current_lap_distance: p.current_lap_distance,
                    race_position: p.race_position,
                    current_lap: p.current_lap,
                    laps_completed: p.laps_completed,
                    // NOTE: For now use player's speed/pit_mode for all participants
                    // The actual mSpeeds and mPitModes arrays come much later in the struct
                    speed: if i == data.viewed_participant_index { data.speed } else { 0.0 },
                    pit_mode: if i == data.viewed_participant_index { data.pit_mode } else { 0 },
                });
            }

            let track_location = std::str::from_utf8(&data.track_location)
                .unwrap_or("Unknown")
                .trim_end_matches('\0')
                .to_string();

            let track_variation = std::str::from_utf8(&data.track_variation)
                .unwrap_or("Unknown")
                .trim_end_matches('\0')
                .to_string();

            Ok(TelemetryData {
                game_state: data.game_state,
                session_state: data.session_state,
                race_state: data.race_state,
                viewed_participant_index: data.viewed_participant_index,
                num_participants: data.num_participants,
                participants,
                speed: data.speed,
                rpm: data.rpm,
                max_rpm: data.max_rpm,
                gear: data.gear,
                num_gears: data.num_gears,
                throttle: data.throttle,
                brake: data.brake,
                clutch: data.clutch,
                steering: data.steering,
                track_location,
                track_variation,
                track_length: data.track_length,
                current_time: data.current_time,
                event_time_remaining: data.event_time_remaining,
                split_time_ahead: data.split_time_ahead,
                split_time_behind: data.split_time_behind,
                highest_flag_color: data.highest_flag_colour,
                highest_flag_reason: data.highest_flag_reason,
                fuel_level: data.fuel_level,
                fuel_capacity: data.fuel_capacity,
                rain_density: data.rain_density,
                sequence_number: data.sequence_number,
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
            })
        }
    }
}

#[cfg(target_os = "windows")]
impl Drop for SharedMemoryReader {
    fn drop(&mut self) {
        unsafe {
            if !self.buffer.is_null() {
                UnmapViewOfFile(self.buffer);
            }
            if !self.handle.is_null() {
                CloseHandle(self.handle);
            }
        }
    }
}

// Global state
static TELEMETRY_RUNNING: Mutex<bool> = Mutex::new(false);

#[tauri::command]
pub async fn start_telemetry<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    interval_ms: u64,
) -> Result<String, String> {
    let mut running = TELEMETRY_RUNNING.lock().unwrap();

    if *running {
        return Ok("Telemetry already running".to_string());
    }

    *running = true;
    drop(running);

    thread::spawn(move || {
        #[cfg(target_os = "windows")]
        {
            let mut reader: Option<SharedMemoryReader> = None;
            let mut retry_count = 0;
            let max_retries_before_log = 10; // Log every 10 attempts

            while *TELEMETRY_RUNNING.lock().unwrap() {
                // Try to create reader if we don't have one
                if reader.is_none() {
                    match SharedMemoryReader::new() {
                        Ok(r) => {
                            let _ = app.emit("telemetry-connected", "Connected to AMS2");
                            eprintln!("Successfully connected to AMS2 shared memory");
                            reader = Some(r);
                            retry_count = 0;
                        }
                        Err(e) => {
                            retry_count += 1;
                            // Only log once at the start, not every 10 attempts
                            if retry_count == 1 {
                                let msg = "Waiting for AMS2 shared memory...".to_string();
                                let _ = app.emit("telemetry-error", &msg);
                                eprintln!("{}", msg);
                            }
                            thread::sleep(Duration::from_millis(interval_ms));
                            continue;
                        }
                    }
                }

                // Read telemetry if we have a reader
                if let Some(ref r) = reader {
                    match r.read() {
                        Ok(data) => {
                            // Debug: log first few telemetry updates
                            static mut DEBUG_COUNT: u32 = 0;
                            unsafe {
                                DEBUG_COUNT += 1;
                                if DEBUG_COUNT <= 3 {
                                    eprintln!("📊 Telemetry #{}: Speed={:.1} km/h, RPM={:.0}, Gear={}, Track={}",
                                        DEBUG_COUNT, data.speed, data.rpm, data.gear, data.track_location);
                                }
                            }
                            let _ = app.emit("telemetry-update", data);
                        }
                        Err(e) => {
                            let msg = format!("Failed to read telemetry: {}", e);
                            let _ = app.emit("telemetry-error", &msg);
                            eprintln!("{}", msg);
                        }
                    }
                }

                thread::sleep(Duration::from_millis(interval_ms));
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            let msg = "Shared memory reading is only supported on Windows";
            let _ = app.emit("telemetry-error", msg);
            eprintln!("{}", msg);
            *TELEMETRY_RUNNING.lock().unwrap() = false;
        }
    });

    Ok("Telemetry started".to_string())
}

#[tauri::command]
pub async fn stop_telemetry() -> Result<String, String> {
    let mut running = TELEMETRY_RUNNING.lock().unwrap();
    *running = false;
    Ok("Telemetry stopped".to_string())
}

#[tauri::command]
pub async fn is_telemetry_running() -> Result<bool, String> {
    Ok(*TELEMETRY_RUNNING.lock().unwrap())
}
