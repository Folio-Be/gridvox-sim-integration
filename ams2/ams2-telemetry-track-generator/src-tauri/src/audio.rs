///! Native audio recording module using cpal (WASAPI on Windows)
///! Captures microphone input, resamples to 16kHz, and sends raw PCM to Python backend
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use rubato::{
    Resampler, SincFixedIn, SincInterpolationParameters, SincInterpolationType, WindowFunction,
};
use std::sync::{Arc, Mutex};
use std::thread;

/// Global state for audio recording
static AUDIO_STATE: Mutex<Option<AudioRecorder>> = Mutex::new(None);

struct AudioRecorder {
    stream: Option<cpal::Stream>,
    samples: Arc<Mutex<Vec<f32>>>,
    input_sample_rate: u32,
}

/// Start native audio recording
/// Returns success message or error
pub fn start_recording() -> Result<String, String> {
    println!("🎤 Starting native audio recording (WASAPI)...");

    // Get default audio host (WASAPI on Windows)
    let host = cpal::default_host();
    println!("📡 Audio host: {:?}", host.id());

    // Get default input device (microphone)
    let device = host
        .default_input_device()
        .ok_or("No input device available. Please connect a microphone.")?;

    let device_name = device.name().unwrap_or("Unknown".to_string());
    println!("🎙️ Using device: {}", device_name);

    // Get device config
    let config = device
        .default_input_config()
        .map_err(|e| format!("Failed to get input config: {}", e))?;

    let sample_rate = config.sample_rate().0;
    let channels = config.channels();
    println!(
        "📊 Input: {}Hz, {} channel(s), {:?}",
        sample_rate,
        channels,
        config.sample_format()
    );

    // Shared buffer for audio samples
    let samples = Arc::new(Mutex::new(Vec::new()));
    let samples_clone = samples.clone();

    // Build input stream
    let stream = match config.sample_format() {
        cpal::SampleFormat::F32 => {
            build_stream::<f32>(&device, &config.into(), samples_clone, channels)?
        }
        cpal::SampleFormat::I16 => {
            build_stream::<i16>(&device, &config.into(), samples_clone, channels)?
        }
        cpal::SampleFormat::U16 => {
            build_stream::<u16>(&device, &config.into(), samples_clone, channels)?
        }
        _ => {
            return Err(format!(
                "Unsupported sample format: {:?}",
                config.sample_format()
            ))
        }
    };

    // Start the stream
    stream
        .play()
        .map_err(|e| format!("Failed to start stream: {}", e))?;

    // Store in global state
    let mut state = AUDIO_STATE.lock().unwrap();
    *state = Some(AudioRecorder {
        stream: Some(stream),
        samples,
        input_sample_rate: sample_rate,
    });

    println!("✅ Recording started successfully");
    Ok(format!(
        "Recording started: {} ({}Hz)",
        device_name, sample_rate
    ))
}

/// Build audio input stream for a specific sample format
fn build_stream<T>(
    device: &cpal::Device,
    config: &cpal::StreamConfig,
    samples: Arc<Mutex<Vec<f32>>>,
    channels: u16,
) -> Result<cpal::Stream, String>
where
    T: cpal::Sample + cpal::SizedSample,
    f32: cpal::FromSample<T>,
{
    let err_fn = |err| eprintln!("❌ Audio stream error: {}", err);

    let stream = device
        .build_input_stream(
            config,
            move |data: &[T], _: &cpal::InputCallbackInfo| {
                // Convert to f32 and handle multi-channel by averaging (mono)
                let mut mono_data = Vec::new();

                if channels == 1 {
                    // Already mono
                    for &sample in data.iter() {
                        mono_data.push(sample.to_sample::<f32>());
                    }
                } else {
                    // Convert stereo/multi-channel to mono by averaging
                    for chunk in data.chunks(channels as usize) {
                        let avg: f32 = chunk.iter().map(|&s| s.to_sample::<f32>()).sum::<f32>()
                            / channels as f32;
                        mono_data.push(avg);
                    }
                }

                // Append to buffer
                let mut buffer = samples.lock().unwrap();
                buffer.extend_from_slice(&mono_data);
            },
            err_fn,
            None,
        )
        .map_err(|e| format!("Failed to build stream: {}", e))?;

    Ok(stream)
}

/// Stop recording and send audio to Python backend for transcription
/// Returns JSON response from Python or error
pub fn stop_recording() -> Result<String, String> {
    println!("⏹️ Stopping recording...");

    // Take audio state
    let mut state_guard = AUDIO_STATE.lock().unwrap();
    let state = state_guard.take().ok_or("No active recording")?;

    // Stop stream
    drop(state.stream);

    // Get recorded samples
    let samples = state.samples.lock().unwrap().clone();
    let input_sample_rate = state.input_sample_rate;

    println!(
        "📦 Recorded {} samples at {}Hz",
        samples.len(),
        input_sample_rate
    );

    if samples.is_empty() {
        return Err("No audio recorded. Please speak into the microphone.".to_string());
    }

    // Resample to 16kHz if needed (Whisper expects 16kHz)
    let target_sample_rate = 16000;
    let resampled = if input_sample_rate != target_sample_rate {
        println!(
            "🔄 Resampling from {}Hz to {}Hz...",
            input_sample_rate, target_sample_rate
        );
        resample_audio(&samples, input_sample_rate, target_sample_rate)?
    } else {
        samples
    };

    println!(
        "✅ Resampled to {} samples at {}Hz",
        resampled.len(),
        target_sample_rate
    );

    // Send to Python backend in a separate thread
    let result = thread::spawn(move || send_to_python(&resampled))
        .join()
        .map_err(|_| "Thread panicked while sending to Python".to_string())??;

    println!("📝 Transcription received from Python");
    Ok(result)
}

/// Resample audio from input_rate to output_rate using rubato
fn resample_audio(samples: &[f32], input_rate: u32, output_rate: u32) -> Result<Vec<f32>, String> {
    let params = SincInterpolationParameters {
        sinc_len: 256,
        f_cutoff: 0.95,
        interpolation: SincInterpolationType::Linear,
        oversampling_factor: 256,
        window: WindowFunction::BlackmanHarris2,
    };

    let mut resampler = SincFixedIn::<f32>::new(
        output_rate as f64 / input_rate as f64,
        2.0, // max_relative_ratio
        params,
        samples.len(),
        1, // 1 channel (mono)
    )
    .map_err(|e| format!("Failed to create resampler: {}", e))?;

    let waves_in = vec![samples.to_vec()];
    let mut waves_out = resampler
        .process(&waves_in, None)
        .map_err(|e| format!("Resampling failed: {}", e))?;

    Ok(waves_out.remove(0))
}

/// Send raw PCM audio to Python FastAPI backend
fn send_to_python(samples: &[f32]) -> Result<String, String> {
    println!("📤 Sending {} samples to Python backend...", samples.len());

    // Convert f32 samples to bytes (little-endian)
    let bytes: Vec<u8> = samples.iter().flat_map(|&f| f.to_le_bytes()).collect();

    println!("📦 Audio data size: {} bytes", bytes.len());

    // Send HTTP POST to Python
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(30)) // 30s timeout for inference
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .post("http://localhost:8000/stt/transcribe-raw")
        .header("Content-Type", "application/octet-stream")
        .body(bytes)
        .send()
        .map_err(|e| {
            format!(
                "Failed to send to Python backend: {}. Is the backend running?",
                e
            )
        })?;

    let status = response.status();
    println!("📥 Response status: {}", status);

    if !status.is_success() {
        let error_text = response
            .text()
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Backend error ({}): {}", status, error_text));
    }

    let json = response
        .text()
        .map_err(|e| format!("Failed to read response: {}", e))?;

    println!("✅ Received response from Python: {} bytes", json.len());
    Ok(json)
}
