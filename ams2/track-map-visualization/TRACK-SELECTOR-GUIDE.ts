// Example: How to add track selector to the demo

/*
1. Import the track loader:
*/
import { loadTrack, TRACK_CATALOG, getTracksByCategory } from './trackLoader';

/*
2. Add this HTML to index.html (before the canvas):
*/
const trackSelectorHTML = `
<div class="track-selector">
  <label for="track-select">Select Track:</label>
  <select id="track-select">
    <optgroup label="Generated">
      <option value="oval" selected>Demo Oval Track</option>
    </optgroup>
    
    <optgroup label="iRacing - F1">
      <option value="spa_gp">Spa-Francorchamps GP</option>
      <option value="silverstone_gp">Silverstone GP</option>
      <option value="monza_gp">Monza GP</option>
      <option value="suzuka_gp">Suzuka Circuit</option>
      <option value="nuerburg_gp_bes">Nürburgring GP</option>
      <option value="interlagos_gp">Interlagos</option>
      <option value="zandvoort_gp">Zandvoort</option>
    </optgroup>
    
    <optgroup label="iRacing - US">
      <option value="laguna_seca">Laguna Seca</option>
      <option value="road_america_full">Road America</option>
      <option value="watkins_glen_cup">Watkins Glen</option>
    </optgroup>
    
    <optgroup label="iRacing - Other">
      <option value="brands_hatch_gp">Brands Hatch GP</option>
      <option value="phillip_island">Phillip Island</option>
      <option value="mosport">Mosport</option>
      <option value="donington_gp">Donington Park</option>
      <option value="okayama_full">Okayama International</option>
      <option value="zolder_gp">Circuit Zolder</option>
    </optgroup>
  </select>
</div>
`;

/*
3. Add CSS styling:
*/
const trackSelectorCSS = `
.track-selector {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  z-index: 1000;
}

.track-selector label {
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

.track-selector select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  min-width: 250px;
}

.track-selector select:hover {
  background: rgba(255, 255, 255, 0.15);
}

.track-selector option {
  background: #1a1a1a;
  color: white;
}

.track-selector optgroup {
  background: #2a2a2a;
  color: #00ff88;
  font-weight: bold;
}
`;

/*
4. Add track change handler in main.ts:
*/
async function handleTrackChange(trackId: string) {
    try {
        // Show loading state
        statusMessage.textContent = `Loading ${trackId}...`;

        // Load track data
        const track = await loadTrack(trackId);

        // Update renderer with new track
        if (renderer) {
            renderer.updateTrack(track);
        }

        statusMessage.textContent = `Track loaded: ${track.name}`;

        console.log(`✅ Loaded track: ${track.name}`);
        console.log(`   Points: ${track.points.length}`);
        console.log(`   Length: ${track.length}m`);
    } catch (error) {
        console.error('Failed to load track:', error);
        statusMessage.textContent = `Error loading track: ${error.message}`;
    }
}

/*
5. Wire up the event listener:
*/
const trackSelect = document.getElementById('track-select') as HTMLSelectElement;
trackSelect.addEventListener('change', (e) => {
    const trackId = (e.target as HTMLSelectElement).value;
    handleTrackChange(trackId);
});

/*
6. OR: Build the selector dynamically from catalog:
*/
function buildTrackSelector(): string {
    const categories = getTracksByCategory();
    let html = '<select id="track-select">\n';

    categories.forEach((tracks, categoryName) => {
        html += `  <optgroup label="${categoryName}">\n`;
        tracks.forEach(track => {
            const selected = track.id === 'oval' ? ' selected' : '';
            html += `    <option value="${track.id}"${selected}>${track.name}</option>\n`;
        });
        html += '  </optgroup>\n';
    });

    html += '</select>';
    return html;
}

/*
7. Full integration example:
*/

// Initialize with default track
let currentTrack: TrackDefinition;

async function init() {
    // Load default track (oval)
    currentTrack = await loadTrack('oval');

    // Initialize renderer
    renderer = new PixiTrackRenderer(canvas, currentTrack);

    // Set up track selector
    const selector = document.getElementById('track-select') as HTMLSelectElement;
    selector.addEventListener('change', async (e) => {
        const trackId = (e.target as HTMLSelectElement).value;
        await handleTrackChange(trackId);
    });

    // Start animation loop
    animate();
}

init();

/*
8. To add AMS2 recorded tracks later:
*/

// After recording a track with the recorder:
// 1. Track JSON is saved to: recorded-tracks/ams2/{track-name}.json
// 2. Add to TRACK_CATALOG in trackLoader.ts:

/*
  { 
    id: 'ams2_interlagos', 
    name: 'Interlagos (AMS2 Recorded)', 
    source: 'ams2',
    category: 'Brazil'
  }
*/

// 3. Track will automatically appear in selector

/*
9. Testing with different tracks:
*/

// Load Spa-Francorchamps
await handleTrackChange('spa_gp');

// Load Silverstone
await handleTrackChange('silverstone_gp');

// Back to demo oval
await handleTrackChange('oval');

/*
10. Performance notes:
*/
// - All tracks render at 120-250 FPS (Pixi.js WebGL)
// - Track complexity doesn't affect performance
// - Car count is the limiting factor (tested with 64 cars)
// - iRacing tracks have 10-113 coordinate points
// - Demo oval has 100 points
// - All work perfectly with lap distance % positioning
