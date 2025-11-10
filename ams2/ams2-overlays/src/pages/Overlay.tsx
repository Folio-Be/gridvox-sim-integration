import { useState, useEffect, useRef } from "react";
import { listen, emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export const OverlayPage = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Listen for video playback commands from main window
    const unlisten = listen<{ src: string }>("play-overlay-video", (event) => {
      console.log("Received play-overlay-video event:", event.payload);
      setVideoSrc(event.payload.src);
    });

    // ESC key to skip/hide overlay
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && videoSrc) {
        console.log("ESC pressed - hiding overlay");
        handleVideoEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlisten.then((fn) => fn());
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoSrc]);

  const handleVideoEnd = async () => {
    console.log("Video ended - hiding overlay");
    setVideoSrc(null);
    try {
      await invoke("hide_overlay");
    } catch (error) {
      console.error("Failed to hide overlay:", error);
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video playback error:", e);
    handleVideoEnd();
  };

  const handleButtonClick = async () => {
    console.log("Button clicked in overlay - sending message to main window");
    try {
      await emit("overlay-button-clicked", {
        message: "Hello from overlay!",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to emit event:", error);
    }
  };

  if (!videoSrc) {
    // Show test button when no video is playing
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <button
          onClick={handleButtonClick}
          style={{
            padding: "20px 40px",
            fontSize: "18px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          Click to Send Message to Main Window
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        style={{
          width: "90%",
          height: "90%",
          objectFit: "contain",
          borderRadius: "10px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
        }}
      />

      {/* Skip instruction overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "40px",
          padding: "10px 20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "8px",
          color: "white",
          fontSize: "14px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Press ESC to skip
      </div>
    </div>
  );
};
