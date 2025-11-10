import { useState } from "react";
import WelcomeScreen from "./components/screens/WelcomeScreen";
import ProjectSetupModal, { ProjectData } from "./components/screens/ProjectSetupModal";
import RecordingInstructions from "./components/screens/RecordingInstructions";
import LiveRecording from "./components/screens/LiveRecording";
import ProcessingScreen from "./components/screens/ProcessingScreen";
import PreviewScreen from "./components/screens/PreviewScreen";
import DebugConsole from "./components/ui/DebugConsole";

type Screen = "welcome" | "setup" | "instructions" | "recording" | "processing" | "preview" | "export";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("recording");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const handleSetupComplete = (data: ProjectData) => {
    console.log("Project setup:", data);
    setIsSetupModalOpen(false);
    setCurrentScreen("instructions");
  };

  const handleNavigate = (screen: Screen) => {
    if (screen === "setup") {
      setIsSetupModalOpen(true);
    } else {
      setCurrentScreen(screen);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onNavigate={handleNavigate} />;
      case "instructions":
        return (
          <RecordingInstructions
            onBack={() => {
              setIsSetupModalOpen(true);
              setCurrentScreen("welcome");
            }}
            onStartRecording={() => setCurrentScreen("recording")}
          />
        );
      case "recording":
        return <LiveRecording onStopRecording={() => setCurrentScreen("processing")} />;
      case "processing":
        return (
          <ProcessingScreen
            onComplete={() => setCurrentScreen("preview")}
            onCancel={() => setCurrentScreen("welcome")}
          />
        );
      case "preview":
        return (
          <PreviewScreen
            onExport={() => {
              console.log("Export track");
              // TODO: Implement export functionality
            }}
            onReprocess={() => setCurrentScreen("processing")}
          />
        );
      default:
        return <WelcomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-row bg-background-dark font-display text-text-light antialiased">
      {/* Global Debug Console - Always Present */}
      <DebugConsole />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {renderScreen()}
        <ProjectSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          onNext={handleSetupComplete}
        />
      </div>
    </div>
  );
}

export default App;
