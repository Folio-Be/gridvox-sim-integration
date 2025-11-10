import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TelemetryPoint {
  position: [number, number, number];
  runType: 'outside' | 'inside' | 'racing' | null;
  [key: string]: any;
}

interface TrackVisualizationProps {
  telemetryPoints: TelemetryPoint[];
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
  const lineSegmentsRef = useRef<THREE.Line[]>([]);
  const pointsCloudsRef = useRef<THREE.Points[]>([]);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

    const scene = sceneRef.current!;
    const camera = cameraRef.current!;

    // Remove old line segments
    lineSegmentsRef.current.forEach(line => {
      scene.remove(line);
      line.geometry.dispose();
      if (Array.isArray(line.material)) {
        line.material.forEach(m => m.dispose());
      } else {
        line.material.dispose();
      }
    });
    lineSegmentsRef.current = [];

    // Remove old points clouds
    pointsCloudsRef.current.forEach(pointsCloud => {
      scene.remove(pointsCloud);
      pointsCloud.geometry.dispose();
      (pointsCloud.material as THREE.Material).dispose();
    });
    pointsCloudsRef.current = [];

    // Remove old grid
    if (gridRef.current) {
      scene.remove(gridRef.current);
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

    // Helper function to get color for run type
    const getColorForRunType = (runType: 'outside' | 'inside' | 'racing' | null, inPit?: boolean): number => {
      if (inPit) return 0xffca28; // Yellow for pit entry
      switch (runType) {
        case 'outside': return 0x4a9eff;  // Blue
        case 'inside': return 0x10b981;   // Green
        case 'racing': return 0xff5252;   // Red
        default: return 0xffffff;         // White (null = not recording yet)
      }
    };

    // Translate points to origin and group by run type
    // Group consecutive points with the same runType and inPit status to create colored segments
    interface PointSegment {
      runType: 'outside' | 'inside' | 'racing' | null;
      inPit: boolean;
      points: THREE.Vector3[];
    }

    const segments: PointSegment[] = [];
    let currentSegment: PointSegment | null = null;

    telemetryPoints.forEach((point) => {
      const vector = new THREE.Vector3(
        -(point.position[0] - centerX),  // Negate X to fix horizontal flip
        0,
        point.position[2] - centerZ      // Translate to origin
      );

      const pointInPit = point.inPit || false;

      // Start new segment if runType or inPit status changes
      if (!currentSegment || currentSegment.runType !== point.runType || currentSegment.inPit !== pointInPit) {
        // If there's a previous segment, add the current point to it for continuity
        if (currentSegment && currentSegment.points.length > 0) {
          currentSegment.points.push(vector);
        }

        currentSegment = {
          runType: point.runType,
          inPit: pointInPit,
          points: [vector]
        };
        segments.push(currentSegment);
      } else {
        currentSegment.points.push(vector);
      }
    });

    // Create line segments for each group
    const allPoints: THREE.Vector3[] = [];
    segments.forEach(segment => {
      if (segment.points.length < 2) return; // Need at least 2 points for a line

      const geometry = new THREE.BufferGeometry().setFromPoints(segment.points);
      const color = getColorForRunType(segment.runType, segment.inPit);
      const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 0.4
      });

      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      line.renderOrder = 999;
      scene.add(line);
      lineSegmentsRef.current.push(line);

      // Collect all points for point cloud
      allPoints.push(...segment.points);
    });

    // Add point markers for all points (colored by segment)
    segments.forEach(segment => {
      if (segment.points.length === 0) return;

      const pointsGeometry = new THREE.BufferGeometry().setFromPoints(segment.points);
      const color = getColorForRunType(segment.runType, segment.inPit);
      const pointsMaterial = new THREE.PointsMaterial({ color, size: 2, sizeAttenuation: false });
      const pointsCloud = new THREE.Points(pointsGeometry, pointsMaterial);
      scene.add(pointsCloud);
      pointsCloudsRef.current.push(pointsCloud);
    });

    // Update camera to frame track (now centered at origin)
    if (allPoints.length > 10 && maxRange > 0) {
      const padding = 10; // 10m padding on each side
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const aspect = container.clientWidth / container.clientHeight;

      // Calculate frustum size from actual track range plus padding
      const frustumWidth = (rangeX + padding * 2) / 2;
      const frustumHeight = (rangeZ + padding * 2) / 2;

      // Use the larger dimension to ensure everything fits
      const frustumSize = Math.max(frustumWidth, frustumHeight);

      camera.left = -frustumSize * aspect;
      camera.right = frustumSize * aspect;
      camera.top = frustumSize;
      camera.bottom = -frustumSize;
      camera.position.set(0, 100, 0); // Camera stays at origin
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }

    // Add dynamic grid sized to track (now at origin)
    const gridSize = Math.ceil(maxRange * 1.2);
    const gridDivisions = Math.min(Math.ceil(gridSize / 20), 50);
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x1a3d1a, 0x0d1f0d);
    grid.position.set(0, -0.5, 0); // Grid at origin
    scene.add(grid);
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
