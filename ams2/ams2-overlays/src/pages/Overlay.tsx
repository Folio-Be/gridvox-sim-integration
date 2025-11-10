import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
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

  if (!videoSrc) {
    // Fully transparent when no video
    return null;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.3)", // Subtle dark overlay
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
          maxWidth: "90vw",
          maxHeight: "90vh",
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
