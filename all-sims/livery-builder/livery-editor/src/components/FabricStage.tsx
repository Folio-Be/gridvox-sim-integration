import { useEffect, useRef } from 'react';
import * as fabricModule from 'fabric';
import type { Layer, LiveryTexture } from '../types';

const fabric = (fabricModule as any).fabric ?? fabricModule;

interface FabricStageProps {
    texture: LiveryTexture;
    activeTool: string;
    selectedLayerId: string | null;
    onSelectLayer: (layerId: string | null) => void;
    onLayerCreate: (layer: Partial<Layer>) => Promise<Layer | null> | Layer | null;
}

export function FabricStage({ texture, activeTool, selectedLayerId, onSelectLayer, onLayerCreate }: FabricStageProps) {
    const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const fabricRef = useRef<any>(null);
    const layerMapRef = useRef<Map<string, any>>(new Map());
    const drawingRef = useRef<{ isDrawing: boolean; rect: any | null; origin: { x: number; y: number } | null }>({
        isDrawing: false,
        rect: null,
        origin: null,
    });
    const scaleRef = useRef(0.12);
    const controllerRef = useRef({
        activeTool,
        onSelectLayer,
        onLayerCreate,
    });

    useEffect(() => {
        controllerRef.current = {
            activeTool,
            onSelectLayer,
            onLayerCreate,
        };
    }, [activeTool, onSelectLayer, onLayerCreate]);

    useEffect(() => {
        if (!canvasElementRef.current) return;
        const canvas = new fabric.Canvas(canvasElementRef.current, {
            backgroundColor: '#0B0F14',
            selection: true,
            preserveObjectStacking: true,
        });
        fabricRef.current = canvas;

        const getPointer = (event: any) => {
            const pointer = canvas.getPointer(event.e);
            const zoom = canvas.getZoom() || 1;
            return {
                x: pointer.x / zoom,
                y: pointer.y / zoom,
            };
        };

        const handleMouseDown = (event: any) => {
            const { activeTool, onSelectLayer } = controllerRef.current;
            if (activeTool === 'shapes') {
                const pointer = getPointer(event);
                const rect = new fabric.Rect({
                    left: pointer.x,
                    top: pointer.y,
                    width: 0,
                    height: 0,
                    fill: '#22D2EE44',
                    strokeDashArray: [4, 2],
                    stroke: '#22D3EE',
                    strokeWidth: 1,
                });
                canvas.add(rect);
                drawingRef.current = { isDrawing: true, rect, origin: pointer };
                return;
            }
            const target = event?.target as any;
            if (target?.layerId) {
                onSelectLayer(target.layerId);
            } else {
                onSelectLayer(null);
            }
        };

        const handleMouseMove = (event: any) => {
            if (!drawingRef.current.isDrawing || !drawingRef.current.rect || !drawingRef.current.origin) {
                return;
            }
            const pointer = getPointer(event);
            const origin = drawingRef.current.origin;
            const rect = drawingRef.current.rect;
            const width = pointer.x - origin.x;
            const height = pointer.y - origin.y;
            rect.set({
                width: Math.abs(width),
                height: Math.abs(height),
                left: width < 0 ? pointer.x : origin.x,
                top: height < 0 ? pointer.y : origin.y,
            });
            rect.setCoords();
            canvas.renderAll();
        };

        const finalizeShape = () => {
            if (!drawingRef.current.isDrawing || !drawingRef.current.rect) {
                return;
            }
            const rect = drawingRef.current.rect;
            drawingRef.current = { isDrawing: false, rect: null, origin: null };
            if (rect.width * rect.height < 4) {
                canvas.remove(rect);
                canvas.renderAll();
                return;
            }
            const scale = scaleRef.current || 1;
            const payload: Partial<Layer> = {
                type: 'shape',
                x: rect.left / scale,
                y: rect.top / scale,
                width: rect.getScaledWidth() / scale,
                height: rect.getScaledHeight() / scale,
                data: {
                    shapeType: 'rectangle',
                    fill: rect.fill ?? '#22D3EE44',
                },
            };
            Promise.resolve(controllerRef.current.onLayerCreate(payload)).then((created) => {
                if (created) {
                    // let React-driven re-render draw the final object
                    canvas.remove(rect);
                } else {
                    canvas.remove(rect);
                }
                canvas.renderAll();
            });
        };

        const handleMouseUp = () => {
            if (drawingRef.current.isDrawing) {
                finalizeShape();
            }
        };

        const handlePathCreated = (opt: any) => {
            const { activeTool, onLayerCreate } = controllerRef.current;
            const path = opt.path;
            if (activeTool !== 'pencil') {
                canvas.remove(path);
                return;
            }
            const bounds = path.getBoundingRect();
            const scale = scaleRef.current || 1;
            const payload: Partial<Layer> = {
                type: 'shape',
                x: bounds.left / scale,
                y: bounds.top / scale,
                width: bounds.width / scale,
                height: bounds.height / scale,
                data: {
                    shapeType: 'custom',
                },
            };
            Promise.resolve(onLayerCreate(payload)).then((created) => {
                if (created) {
                    path.set('layerId', created.id);
                    layerMapRef.current.set(created.id, path);
                } else {
                    canvas.remove(path);
                }
                canvas.renderAll();
            });
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('path:created', handlePathCreated);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('path:created', handlePathCreated);
            canvas.dispose();
            fabricRef.current = null;
            layerMapRef.current.clear();
        };
    }, []);

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const isPencil = activeTool === 'pencil';
        canvas.isDrawingMode = isPencil;
        if (isPencil) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = '#22D3EE';
            canvas.freeDrawingBrush.width = 2;
        }
    }, [activeTool]);

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas || !canvasElementRef.current) return;
        canvas.getObjects().forEach((obj: any) => canvas.remove(obj));
        layerMapRef.current.clear();

        const parentElement = canvasElementRef.current.parentElement;
        const availableWidth = parentElement?.clientWidth ?? canvasElementRef.current.clientWidth ?? 800;
        const availableHeight = parentElement?.clientHeight ?? canvasElementRef.current.clientHeight ?? 600;
        const textureWidth = texture.width ?? 4096;
        const textureHeight = texture.height ?? 4096;
        const scaleX = availableWidth / textureWidth;
        const scaleY = availableHeight / textureHeight;
        const stageScale = Math.max(scaleX, scaleY);
        scaleRef.current = stageScale;

        const canvasWidth = textureWidth * stageScale;
        const canvasHeight = textureHeight * stageScale;
        const deviceRatio = window.devicePixelRatio || 1;

        canvas.setDimensions(
            { width: canvasWidth * deviceRatio, height: canvasHeight * deviceRatio },
            { backstoreOnly: true },
        );
        canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
        const canvasElement = canvas.getElement() as HTMLCanvasElement;
        canvasElement.width = canvasWidth * deviceRatio;
        canvasElement.height = canvasHeight * deviceRatio;
        canvasElement.style.width = `${canvasWidth}px`;
        canvasElement.style.height = `${canvasHeight}px`;
        canvasElement.style.backgroundColor = '#0B0F14';
        canvasElement.style.borderRadius = '0';
        const wrapper = canvasElement.parentElement as HTMLElement | null;
        if (wrapper) {
            wrapper.style.width = `${canvasWidth}px`;
            wrapper.style.height = `${canvasHeight}px`;
        }
        canvas.setZoom(deviceRatio);

        texture.layers
            ?.filter((layer) => layer.visible !== false)
            .forEach((layer) => {
                const fabricObject = buildFabricObject(layer, stageScale);
                fabricObject.left = (layer.x ?? 0) * stageScale;
                fabricObject.top = (layer.y ?? 0) * stageScale;
                fabricObject.set('layerId', layer.id);
                canvas.add(fabricObject);
                layerMapRef.current.set(layer.id, fabricObject);
            });

        canvas.renderAll();
    }, [texture]);

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        layerMapRef.current.forEach((object, layerId) => {
            if (layerId === selectedLayerId) {
                object.set('stroke', '#22D2EE');
                object.set('strokeWidth', 2);
            } else {
                object.set('stroke', undefined);
                object.set('strokeWidth', 0);
            }
        });
        canvas.renderAll();
    }, [selectedLayerId]);

    return <canvas ref={canvasElementRef} />;
}

const buildFabricObject = (layer: Layer, scale: number): any => {
    const fill =
        layer.data?.fill ??
        ({
            image: '#7dd3fc',
            shape: '#818cf8',
            text: '#f87171',
            gradient: '#fde047',
            fill: '#22d3ee',
            group: '#a78bfa',
        }[layer.type ?? 'shape'] ?? '#475569');
    const width = Math.max((layer.width ?? 200) * scale, 1);
    const height = Math.max((layer.height ?? 200) * scale, 1);
    return new fabric.Rect({
        width,
        height,
        fill,
        opacity: Math.max(layer.opacity ?? 80, 25) / 100,
        rx: 4,
        ry: 4,
    });
};
