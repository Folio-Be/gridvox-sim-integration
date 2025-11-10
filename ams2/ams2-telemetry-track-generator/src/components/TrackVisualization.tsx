import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TrackVisualizationProps {
  telemetryPoints: any[];
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
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pathLineRef = useRef<THREE.Line | null>(null);
  const pointsCloudRef = useRef<THREE.Points | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing canvas elements from previous mounts
    const existingCanvases = containerRef.current.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => canvas.remove());

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    if (width === 0 || height === 0) {
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f0a);
    sceneRef.current = scene;

    // Use orthographic camera for perfect top-down 2D view
    const aspect = width / height;
    const frustumSize = 100;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const asp = w / h;
      cameraRef.current.left = -frustumSize * asp / 2;
      cameraRef.current.right = frustumSize * asp / 2;
      cameraRef.current.top = frustumSize / 2;
      cameraRef.current.bottom = -frustumSize / 2;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update track path when telemetry points change
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || telemetryPoints.length === 0) {
      return;
    }

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

    // Remove old points cloud
    if (pointsCloudRef.current) {
      sceneRef.current.remove(pointsCloudRef.current);
      pointsCloudRef.current.geometry.dispose();
      (pointsCloudRef.current.material as THREE.Material).dispose();
    }

    // Remove old grid
    if (gridRef.current) {
      sceneRef.current.remove(gridRef.current);
      gridRef.current.geometry.dispose();
      (gridRef.current.material as THREE.Material).dispose();
    }

    // Calculate bounds first (in world coordinates)
    const worldXs = telemetryPoints.map(p => p.position[0]);
    const worldZs = telemetryPoints.map(p => p.position[2]);
    const minX = Math.min(...worldXs);
    const maxX = Math.max(...worldXs);
    const minZ = Math.min(...worldZs);
    const maxZ = Math.max(...worldZs);
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const rangeX = maxX - minX;
    const rangeZ = maxZ - minZ;
    const maxRange = Math.max(rangeX, rangeZ);

    // Translate points to origin (subtract center) for easier camera framing
    // Negate X to fix horizontal flip
    const points: THREE.Vector3[] = telemetryPoints.map(point =>
      new THREE.Vector3(
        -(point.position[0] - centerX),  // Negate X to fix horizontal flip
        0,
        point.position[2] - centerZ      // Translate to origin
      )
    );

    // Create line geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Color based on run type
    const color = currentRunType === 'outside' ? 0x4a9eff :
                  currentRunType === 'inside' ? 0xffca28 :
                  currentRunType === 'racing' ? 0xff5252 :
                  0x4ade80;

    // Use LineBasicMaterial
    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 1
    });

    // Use LineLoop to close the path and make it more visible
    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;
    line.renderOrder = 999;
    sceneRef.current.add(line);
    pathLineRef.current = line;

    // Add point markers for debugging visibility
    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const pointsMaterial = new THREE.PointsMaterial({ color, size: 5, sizeAttenuation: false });
    const pointsCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    sceneRef.current.add(pointsCloud);
    pointsCloudRef.current = pointsCloud;

    // Update camera to frame track (now centered at origin)
    if (points.length > 10 && maxRange > 0) {
      const padding = 10; // 10m padding on each side
      const aspect = containerRef.current!.clientWidth / containerRef.current!.clientHeight;

      // Calculate frustum size from actual track range plus padding
      const frustumWidth = (rangeX + padding * 2) / 2;
      const frustumHeight = (rangeZ + padding * 2) / 2;

      // Use the larger dimension to ensure everything fits
      const frustumSize = Math.max(frustumWidth, frustumHeight);

      cameraRef.current.left = -frustumSize * aspect;
      cameraRef.current.right = frustumSize * aspect;
      cameraRef.current.top = frustumSize;
      cameraRef.current.bottom = -frustumSize;
      cameraRef.current.position.set(0, 100, 0); // Camera stays at origin
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }

    // Add dynamic grid sized to track (now at origin)
    const gridSize = Math.ceil(maxRange * 1.2);
    const gridDivisions = Math.min(Math.ceil(gridSize / 20), 50);
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x1a3d1a, 0x0d1f0d);
    grid.position.set(0, -0.5, 0); // Grid at origin
    sceneRef.current.add(grid);
    gridRef.current = grid;
  }, [telemetryPoints, currentRunType]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: '100%', minHeight: '400px', maxHeight: '600px' }}
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
