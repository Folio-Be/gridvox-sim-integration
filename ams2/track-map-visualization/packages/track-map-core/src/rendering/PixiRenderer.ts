/**
 * Pixi.js Track Map Renderer
 * 
 * WebGL-accelerated rendering for 60+ FPS with 64 cars
 * Based on proven patterns from RaceVision (iRacing overlay)
 */

import * as PIXI from 'pixi.js';
import type { TrackDefinition, CarPosition } from '../types/index.js';

export class PixiTrackRenderer {
    private app: PIXI.Application;
    private trackContainer: PIXI.Container;
    private carContainer: PIXI.Container;
    private cornerContainer: PIXI.Container;

    private trackGraphics: PIXI.Graphics;
    private carSprites: Map<number, PIXI.Container> = new Map();

    constructor(canvas: HTMLCanvasElement, width = 1920, height = 1080) {
        // Initialize Pixi.js Application with WebGL
        this.app = new PIXI.Application();

        // Initialize will be called separately since it's async
        this.initializeApp(canvas, width, height);

        // Create layered containers (render order matters)
        this.trackContainer = new PIXI.Container();
        this.carContainer = new PIXI.Container();
        this.cornerContainer = new PIXI.Container();

        this.trackGraphics = new PIXI.Graphics();
        this.trackContainer.addChild(this.trackGraphics);
    }

    /**
     * Async initialization of Pixi.js
     */
    private async initializeApp(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
        await this.app.init({
            canvas,
            width,
            height,
            backgroundColor: 0x1a1a1a, // Dark gray background
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // Add containers to stage in correct order
        this.app.stage.addChild(this.trackContainer);
        this.app.stage.addChild(this.carContainer);
        this.app.stage.addChild(this.cornerContainer);
    }

    /**
     * Draw track path (called once, cached by GPU)
     * Uses sector colors: Red (S1), Green (S2), Blue (S3)
     */
    drawTrack(track: TrackDefinition): void {
        this.trackGraphics.clear();

        console.log('Drawing track:', track.name, 'Points:', track.points.length);

        if (track.points.length === 0) {
            console.error('No track points to draw!');
            return;
        }

        // Draw the entire track as one continuous white path first
        this.trackGraphics.moveTo(track.points[0].x, track.points[0].y);

        for (let i = 1; i < track.points.length; i++) {
            this.trackGraphics.lineTo(track.points[i].x, track.points[i].y);
        }

        // Close the loop
        this.trackGraphics.lineTo(track.points[0].x, track.points[0].y);
        this.trackGraphics.stroke({ width: 60, color: 0x888888, alpha: 1 });

        console.log('Track drawn successfully');

        // Draw start/finish line
        const startPoint = track.startFinish.canvasPosition;
        this.trackGraphics.moveTo(startPoint.x - 60, startPoint.y);
        this.trackGraphics.lineTo(startPoint.x + 60, startPoint.y);
        this.trackGraphics.stroke({ width: 20, color: 0xffffff, alpha: 1 });

        // Draw corner labels
        this.drawCornerLabels(track.corners);
    }

    /**
     * Draw corner name labels
     */
    private drawCornerLabels(corners: TrackDefinition['corners']): void {
        // Clear existing labels
        this.cornerContainer.removeChildren();

        corners.forEach(corner => {
            const text = new PIXI.Text({
                text: corner.name,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 24,
                    fill: 0xffffff,
                    stroke: { color: 0x000000, width: 4 },
                },
            });

            text.x = corner.labelPosition.x;
            text.y = corner.labelPosition.y;
            text.anchor.set(0.5);

            this.cornerContainer.addChild(text);
        });
    }

    /**
     * Update car positions (called every frame)
     * This is the performance-critical path - optimized for 64 cars @ 60 FPS
     */
    updateCars(cars: CarPosition[], track: TrackDefinition): void {
        // Remove cars no longer in the race
        const activeCarIds = new Set(cars.map(c => c.carId));
        this.carSprites.forEach((sprite, carId) => {
            if (!activeCarIds.has(carId)) {
                this.carContainer.removeChild(sprite);
                this.carSprites.delete(carId);
            }
        });

        // Update or create car sprites
        cars.forEach(car => {
            const position = this.getTrackPosition(car.lapPercentage, track);

            let carContainer = this.carSprites.get(car.carId);

            if (!carContainer) {
                // Create new car sprite
                carContainer = this.createCarSprite(car);
                this.carSprites.set(car.carId, carContainer);
                this.carContainer.addChild(carContainer);
            }

            // Update sprite appearance and position
            this.updateCarSprite(carContainer, car, position);
        });
    }

    /**
     * Create a new car sprite (circle + position number)
     */
    private createCarSprite(car: CarPosition): PIXI.Container {
        const container = new PIXI.Container();

        // Car circle (will be styled in updateCarSprite)
        const circle = new PIXI.Graphics();
        circle.name = 'circle';
        container.addChild(circle);

        // Position number text
        const text = new PIXI.Text({
            text: car.racePosition.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: car.isPlayer ? 32 : 28,
                fill: 0x000000,
                fontWeight: 'bold',
            },
        });
        text.anchor.set(0.5);
        text.name = 'text';
        container.addChild(text);

        return container;
    }

    /**
     * Update existing car sprite
     */
    private updateCarSprite(
        container: PIXI.Container,
        car: CarPosition,
        position: { x: number; y: number }
    ): void {
        // Update circle
        const circle = container.getChildByName('circle') as PIXI.Graphics;
        circle.clear();

        const color = car.isPlayer
            ? 0xffd700 // Gold for player
            : parseInt(car.classColor.replace('#', ''), 16);

        const radius = car.isPlayer ? 50 : 40;

        circle.circle(0, 0, radius);
        circle.fill({ color });
        circle.stroke({ width: 3, color: 0x000000 });

        // Update text
        const text = container.getChildByName('text') as PIXI.Text;
        text.text = car.racePosition.toString();

        // Update container position
        container.x = position.x;
        container.y = position.y;
    }

    /**
     * Map lap percentage to canvas coordinates
     * This is where lap distance % becomes 2D position
     */
    private getTrackPosition(
        lapPercentage: number,
        track: TrackDefinition
    ): { x: number; y: number } {
        // Find the nearest track point
        const index = Math.floor(lapPercentage * track.points.length);
        const point = track.points[index % track.points.length];

        // TODO: Add interpolation between points for smoother movement
        // For now, nearest neighbor is sufficient
        return { x: point.x, y: point.y };
    }

    /**
     * Resize canvas (e.g., window resize)
     */
    resize(width: number, height: number): void {
        this.app.renderer.resize(width, height);
    }

    /**
     * Clean up Pixi.js resources
     */
    destroy(): void {
        this.app.destroy(true, { children: true });
    }
}
