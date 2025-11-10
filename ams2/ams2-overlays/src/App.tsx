import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

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
<<<<<<< HEAD

      // Emit event to play video (replace with actual video path)
      await emit("play-overlay-video", {
        src: "/videos/stories/test-cutscene.mp4"
      });

=======
      
      // Emit event to play video (replace with actual video path)
      await emit("play-overlay-video", { 
        src: "/videos/stories/test-cutscene.mp4" 
      });
      
>>>>>>> 1761a8852d46747e3d9163f45ed89c3c4dc15e71
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

      <div className="info">
        <h2>Instructions:</h2>
        <ul>
          <li>Click "Show Overlay" to display transparent overlay window</li>
          <li>Click "Hide Overlay" to dismiss it</li>
          <li>Click "Play Test Video" to test video playback</li>
          <li>Press ESC while video is playing to skip</li>
          <li>The overlay will appear as a transparent window over AMS2</li>
        </ul>
<<<<<<< HEAD

=======
        
>>>>>>> 1761a8852d46747e3d9163f45ed89c3c4dc15e71
        <h3>Test Video Setup:</h3>
        <p>Place test videos in: <code>public/videos/stories/</code></p>
        <p>Example: <code>test-cutscene.mp4</code></p>
      </div>
    </div>
  );
}

export default App;
