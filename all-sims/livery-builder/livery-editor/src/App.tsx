import { LiveryEditor } from './components/LiveryEditor'
import type { LiveryProject } from './types'

function App() {
  const handleSave = (project: LiveryProject) => {
    console.log('Saving project:', project);
    // TODO: Implement save to local storage or backend
  };

  const handleExport = (blob: Blob, filename: string) => {
    console.log('Exporting:', filename);
    // TODO: Implement file download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChange = (project: LiveryProject) => {
    console.log('Project changed:', project.name);
    // TODO: Implement auto-save
  };

  return (
    <LiveryEditor
      onSave={handleSave}
      onExport={handleExport}
      onChange={handleChange}
      height="100vh"
    />
  );
}

export default App
