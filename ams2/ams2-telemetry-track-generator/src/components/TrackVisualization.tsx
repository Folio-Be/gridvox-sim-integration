import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TelemetryPoint {
  position: [number, number, number]; // [x, y, z]
  timestamp: number;
  speed?: number;
  throttle?: number;
  brake?: number;
  gear?: number;
  rpm?: number;
  lapDistance?: number;
}

interface TrackVisualizationProps {
  telemetryPoints: any[]; // Accept any telemetry data structure
  currentRunType: 'outside' | 'inside' | 'racing' | null;
  className?: string;
}

export default function TrackVisualization({
  telemetryPoints,
  currentRunType,
  className = ''
}: TrackVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pathLineRef = useRef<THREE.Line | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f0a); // Dark green-black background
    sceneRef.current = scene;

    // Camera setup (bird's eye view)
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 500, 0); // Start high above looking down
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grid will be added dynamically based on track size
    // (initially no grid to prevent overflow issues)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update track path when telemetry points change
  useEffect(() => {
    if (!sceneRef.current || telemetryPoints.length === 0) return;

    console.log('TrackVisualization: updating with', telemetryPoints.length, 'points');
    console.log('First point:', telemetryPoints[0]);

    // Remove old path
    if (pathLineRef.current) {
      sceneRef.current.remove(pathLineRef.current);
      pathLineRef.current.geometry.dispose();
      if (Array.isArray(pathLineRef.current.material)) {
        pathLineRef.current.material.forEach(m => m.dispose());
      } else {
        pathLineRef.current.material.dispose();
      }
    }

    // Create path geometry from telemetry points
    const points: THREE.Vector3[] = telemetryPoints.map(point =>
      new THREE.Vector3(point.position[0], point.position[1], point.position[2])
    );

    console.log('Created', points.length, 'Vector3 points');

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Color based on run type
    const color = currentRunType === 'outside' ? 0x4a9eff : // Blue
                  currentRunType === 'inside' ? 0xffca28 :  // Yellow
                  currentRunType === 'racing' ? 0xff5252 :  // Red
                  0x4ade80; // Default green

    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 3,
      opacity: 0.9,
      transparent: true
    });

    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
    pathLineRef.current = line;

    console.log('Line added to scene:', line);
    console.log('Scene children count:', sceneRef.current.children.length);
    console.log('First 3 points:', points.slice(0, 3));

    // Auto-frame camera to track bounds
    if (points.length > 10) {
      updateCameraFraming(points);
      console.log('Camera framed. Position:', cameraRef.current?.position);
    }
  }, [telemetryPoints, currentRunType]);

  // Auto-frame camera based on track bounds
  const updateCameraFraming = (points: THREE.Vector3[]) => {
    if (!cameraRef.current || !containerRef.current || !sceneRef.current) return;

    // Calculate bounding box
    const bounds = new THREE.Box3().setFromPoints(points);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());

    // Calculate required camera height to fit track with proper margins
    const maxDim = Math.max(size.x, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);

    // Add 3.5x padding for comfortable margins
    const cameraHeight = maxDim / (2 * Math.tan(fov / 2)) * 3.5;

    // Position camera directly above center (perfect top-down view)
    cameraRef.current.position.set(
      center.x,
      Math.max(cameraHeight, 200), // Minimum height 200m
      center.z
    );

    // Look straight down at center point
    cameraRef.current.lookAt(center.x, 0, center.z);

    // Update grid size based on track bounds
    if (gridRef.current) {
      sceneRef.current.remove(gridRef.current);
      gridRef.current.geometry.dispose();
      (gridRef.current.material as THREE.Material).dispose();
    }

    // Create grid sized to track with padding
    const gridSize = Math.ceil(maxDim * 1.2); // 20% padding around track
    const gridDivisions = Math.min(Math.ceil(gridSize / 20), 100); // ~20m per division, max 100
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x1a3d1a, 0x0d1f0d);
    grid.position.set(center.x, -0.1, center.z);
    sceneRef.current.add(grid);
    gridRef.current = grid;
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: '100%', maxHeight: '600px' }}
    >
      {telemetryPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/40 text-sm">
            Waiting for telemetry data...
          </div>
        </div>
      )}
      {telemetryPoints.length > 0 && (
        <div className="absolute top-4 right-4 bg-green-bg/80 px-3 py-2 rounded border border-green-border">
          <div className="text-white/60 text-xs">Telemetry Points</div>
          <div className="text-white font-mono text-lg">{telemetryPoints.length}</div>
        </div>
      )}
    </div>
  );
}
