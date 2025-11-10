import TitleBar from "../ui/TitleBar";
import ActionCard from "../ui/ActionCard";
import RecentProjectItem from "../ui/RecentProjectItem";

type Screen = "welcome" | "setup" | "instructions" | "recording" | "processing" | "preview" | "export";

interface WelcomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const recentProjects = [
    {
      name: "Nurburgring-GP-Optimal",
      path: "/Users/You/Documents/GridVox/Nurburgring-GP-Optimal.gvct",
      modified: "2 days ago",
    },
    {
      name: "Silverstone-Hotlap",
      path: "/Users/You/Documents/GridVox/Silverstone-Hotlap.gvct",
      modified: "1 week ago",
    },
    {
      name: "Laguna-Seca-Analysis",
      path: "/Users/You/Documents/GridVox/Laguna-Seca-Analysis.gvct",
      modified: "3 weeks ago",
    },
  ];

  const handleNewTrack = () => {
    onNavigate("setup");
  };

  const handleLoadFiles = () => {
    // TODO: Open file dialog
    console.log("Load files clicked");
  };

  const handleProjectClick = (projectName: string) => {
    // TODO: Load project
    console.log("Load project:", projectName);
  };

  return (
    <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden">
      <TitleBar />

      {/* Main Content Area */}
      <div className="flex h-full grow flex-col items-center justify-start pt-4 pb-20 px-4 md:px-8">
        <div className="flex w-full max-w-4xl flex-col items-center">
          {/* Hero Section */}
          <div className="text-center py-8">
            <div className="mb-4 inline-block">
              <span className="material-symbols-outlined text-6xl text-primary">emoji_transportation</span>
            </div>
            <h1 className="text-text-light tracking-tight text-5xl font-bold leading-tight">GridVox Circuit Tracing</h1>
            <p className="text-text-muted text-lg font-normal leading-normal pt-2">Visualize Your Perfect Lap</p>
          </div>

          {/* Action Cards */}
          <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 mt-4">
            <ActionCard
              icon="add_road"
              title="New Track"
              description="Start a new project from scratch"
              onClick={handleNewTrack}
            />
            <ActionCard
              icon="upload_file"
              title="Load Files"
              description="Import telemetry data or an existing project"
              onClick={handleLoadFiles}
            />
          </div>

          {/* Recent Projects Section */}
          <div className="w-full max-w-4xl mt-12 px-4">
            <div className="flex items-center justify-between border-b border-border-dark pb-3">
              <h2 className="text-text-light text-xl font-bold leading-tight tracking-[-0.015em]">Recent Projects</h2>
              <a className="text-sm text-text-muted hover:text-primary transition-colors cursor-pointer" onClick={() => console.log("View all")}>
                View All
              </a>
            </div>

            {/* Recent Projects List */}
            <ul className="mt-4 space-y-2">
              {recentProjects.map((project) => (
                <RecentProjectItem
                  key={project.name}
                  name={project.name}
                  path={project.path}
                  modified={project.modified}
                  onClick={() => handleProjectClick(project.name)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Icons */}
      <div className="absolute bottom-4 right-6 flex gap-3">
        <button className="p-2 text-text-muted rounded-full transition-colors hover:bg-card-dark hover:text-primary">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button className="p-2 text-text-muted rounded-full transition-colors hover:bg-card-dark hover:text-primary">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </div>
  );
}
