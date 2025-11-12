import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { convertFileSrc } from "@tauri-apps/api/core";

export interface LayerVisibility {
    racingLine: boolean;
    centerline: boolean;
    edges: boolean;
    sectors: boolean;
    startFinish: boolean;
    apex: boolean;
}

interface TrackViewer3DProps {
    glbPath: string | null | undefined;
    layers: LayerVisibility;
    className?: string;
}

const DEFAULT_BACKGROUND = 0x050505;
const LAYER_TARGETS: Record<keyof LayerVisibility, string[]> = {
    racingLine: ["racingLine", "racingLineTube"],
    centerline: ["trackCenterline", "centerline"],
    edges: ["trackEdges", "insideBorder", "outsideBorder"],
    sectors: ["sectorMarkers", "sectors"],
    startFinish: ["startFinishLine", "startFinishMarker"],
    apex: ["apexMarkers", "apexPoints"],
};

export default function TrackViewer3D({ glbPath, layers, className }: TrackViewer3DProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const originalVisibilityRef = useRef<Map<string, boolean>>(new Map());
    const animationFrameRef = useRef<number | null>(null);

    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const container = containerRef.current;
        const initialWidth = container.clientWidth || 800;
        const initialHeight = container.clientHeight || 600;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(initialWidth, initialHeight);
        renderer.setClearColor(DEFAULT_BACKGROUND, 1);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(DEFAULT_BACKGROUND);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 5000);
        camera.position.set(0, 150, 280);
        scene.add(camera);
        cameraRef.current = camera;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.target.set(0, 0, 0);
        controlsRef.current = controls;

        const ambient = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambient);
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.65);
        keyLight.position.set(150, 300, 200);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
        fillLight.position.set(-200, 150, -200);
        scene.add(fillLight);

        const animate = () => {
            if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
                return;
            }
            controlsRef.current?.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) {
                return;
            }
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            if (width === 0 || height === 0) {
                return;
            }
            rendererRef.current.setSize(width, height);
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        resizeObserverRef.current = resizeObserver;

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            resizeObserver.disconnect();
            controls.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
            scene.clear();
            rendererRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
            controlsRef.current = null;
            modelRef.current = null;
            originalVisibilityRef.current.clear();
        };
    }, []);

    useEffect(() => {
        if (!glbPath) {
            if (modelRef.current && sceneRef.current) {
                sceneRef.current.remove(modelRef.current);
                modelRef.current = null;
                originalVisibilityRef.current.clear();
            }
            setStatus("idle");
            setErrorMessage(null);
            return;
        }

        let cancelled = false;

        const loadModel = async () => {
            if (!sceneRef.current) {
                return;
            }

            setStatus("loading");
            setErrorMessage(null);

            try {
                const loader = new GLTFLoader();
                const resourceUrl = convertFileSrc(glbPath);
                const gltf = await loader.loadAsync(resourceUrl);
                if (cancelled) {
                    return;
                }

                if (modelRef.current) {
                    sceneRef.current.remove(modelRef.current);
                    modelRef.current = null;
                }

                modelRef.current = gltf.scene;
                sceneRef.current.add(gltf.scene);
                originalVisibilityRef.current.clear();
                gltf.scene.traverse((child) => {
                    originalVisibilityRef.current.set(child.uuid, child.visible);
                });
                applyLayerVisibility(gltf.scene, layers, originalVisibilityRef.current);
                frameCameraToModel(gltf.scene, cameraRef.current, controlsRef.current);
                setStatus("ready");
            } catch (error) {
                if (cancelled) {
                    return;
                }
                setStatus("error");
                setErrorMessage(error instanceof Error ? error.message : String(error));
            }
        };

        void loadModel();

        return () => {
            cancelled = true;
        };
    }, [glbPath]);

    useEffect(() => {
        if (!modelRef.current) {
            return;
        }
        applyLayerVisibility(modelRef.current, layers, originalVisibilityRef.current);
    }, [layers]);

    return (
        <div ref={containerRef} className={className}>
            {status === "idle" && (
                <OverlayMessage label="Awaiting track generation" />
            )}
            {status === "loading" && (
                <OverlayMessage label="Loading track model..." />
            )}
            {status === "error" && (
                <OverlayMessage label={errorMessage ?? "Failed to load track model"} intent="error" />
            )}
        </div>
    );
}

function applyLayerVisibility(
    root: THREE.Object3D,
    layers: LayerVisibility,
    cacheRef: Map<string, boolean>
) {
    root.traverse((child) => {
        const defaultVisible = cacheRef.get(child.uuid);
        let nextVisible = defaultVisible ?? child.visible;
        let matched = false;

        (Object.keys(LAYER_TARGETS) as Array<keyof LayerVisibility>).forEach((layerKey) => {
            if (LAYER_TARGETS[layerKey].includes(child.name)) {
                matched = true;
                const base = defaultVisible ?? child.visible;
                nextVisible = base && layers[layerKey];
            }
        });

        if (!matched) {
            nextVisible = defaultVisible ?? child.visible;
        }

        child.visible = nextVisible;
    });
}

function frameCameraToModel(
    object: THREE.Object3D,
    camera: THREE.PerspectiveCamera | null,
    controls: OrbitControls | null
) {
    if (!camera || !controls) {
        return;
    }

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fitOffset = 1.6;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    let distance = maxDim / (2 * Math.tan(fov / 2));
    distance *= fitOffset;

    const direction = new THREE.Vector3(1, 0.8, 1).normalize();
    const position = direction.clone().multiplyScalar(distance).add(center);

    camera.position.copy(position);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
}

interface OverlayMessageProps {
    label: string;
    intent?: "default" | "error";
}

function OverlayMessage({ label, intent = "default" }: OverlayMessageProps) {
    const isError = intent === "error";
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div
                className={`rounded-lg px-4 py-2 text-sm font-medium ${isError ? "bg-red-600/20 text-red-200 border border-red-400/50" : "bg-black/40 text-white/80 border border-white/10"
                    }`}
            >
                {label}
            </div>
        </div>
    );
}
