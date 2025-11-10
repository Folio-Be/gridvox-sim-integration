import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [overlayMessages, setOverlayMessages] = useState<string[]>([]);

  useEffect(() => {
    // Listen for messages from overlay window
    const unlisten = listen<{ message: string; timestamp: string }>(
      "overlay-button-clicked",
      (event) => {
        console.log("Received message from overlay:", event.payload);
        const msg = `${event.payload.message} (at ${new Date(event.payload.timestamp).toLocaleTimeString()})`;
        setOverlayMessages((prev) => [...prev, msg]);
        setMessage("Received message from overlay!");
      }
    );

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  async function testOverlay() {
    try {
      await invoke("show_overlay");
      setMessage("Overlay shown!");
    } catch (error) {
      setMessage(`Error: ${error}`);
    }
  }

  async function hideOverlay() {
    try {
      await invoke("hide_overlay");
      setMessage("Overlay hidden!");
    } catch (error) {
      setMessage(`Error: ${error}`);
    }
  }

  async function playTestVideo() {
    try {
      // Show overlay first
      await invoke("show_overlay");

      // Emit event to play video (replace with actual video path)
      await emit("play-overlay-video", {
        src: "/videos/stories/test-cutscene.mp4"
      });

      setMessage("Playing test video...");
    } catch (error) {
      setMessage(`Error: ${error}`);
    }
  }

  return (
    <div className="container">
      <h1>GridVox AMS2 Overlay POC</h1>
      <p>Main Control Window</p>

      <div className="controls">
        <button onClick={testOverlay}>Show Overlay</button>
        <button onClick={hideOverlay}>Hide Overlay</button>
        <button onClick={playTestVideo} style={{ backgroundColor: "#28a745" }}>
          ▶ Play Test Video
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      {overlayMessages.length > 0 && (
        <div className="overlay-messages">
          <h3>Messages from Overlay:</h3>
          <ul>
            {overlayMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="info">
        <h2>Instructions:</h2>
        <ul>
          <li>Click "Show Overlay" to display transparent overlay window</li>
          <li>Click "Hide Overlay" to dismiss it</li>
          <li>Click "Play Test Video" to test video playback</li>
          <li>Press ESC while video is playing to skip</li>
          <li>The overlay will appear as a transparent window over AMS2</li>
        </ul>

        <h3>Test Video Setup:</h3>
        <p>Place test videos in: <code>public/videos/stories/</code></p>
        <p>Example: <code>test-cutscene.mp4</code></p>
      </div>
    </div>
  );
}

export default App;
