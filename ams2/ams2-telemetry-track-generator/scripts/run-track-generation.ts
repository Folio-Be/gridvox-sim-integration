#!/usr/bin/env node
/// <reference types="node" />
import * as fs from "fs/promises";
import * as path from "path";
import * as THREE from "three";
import { alignRuns, type AlignRunsResult, type RunDictionary } from "../src/lib/alignment";
import { createTrackSurface, createRacingLine, createRacingLineTube } from "../src/lib/geometry";
import { exportToGLTF, generateMetadata, type TrackInfo } from "../src/lib/export";
import { loadRunsFromFiles } from "../src/lib/generateTrack";

interface CliArgs {
    outside: string;
    inside: string;
    racing: string;
    trackKey: string;
    trackLocation: string;
    trackVariation?: string;
    outputDir?: string;
    resampleCount?: number;
    useRacingLineTube?: boolean;
}

type ProgressPhase = "alignment" | "geometry" | "export" | "metadata";

interface ProgressEvent {
    type: "progress";
    phase: ProgressPhase;
    phaseIndex: number;
    totalPhases: number;
    message: string;
    percent: number;
}

interface LogEvent {
    type: "log";
    level: "info" | "warn" | "error" | "debug";
    message: string;
    context?: Record<string, unknown>;
}

interface ResultEvent {
    type: "result";
    glbPath: string;
    metadataPath: string;
    outputDir: string;
    track: {
        key: string;
        location: string;
        variation?: string;
        length: number;
    };
    alignment: {
        alignmentScore: number;
        maxStartPositionDelta: number;
        resampleCount: number;
        confidence: number;
    };
}

interface ErrorEvent {
    type: "error";
    message: string;
}

const TOTAL_PHASES = 4;

function emit(event: ProgressEvent | LogEvent | ResultEvent | ErrorEvent) {
    process.stdout.write(`${JSON.stringify(event)}\n`);
}

function parseArgs(argv: string[]): CliArgs {
    const args: Record<string, string | boolean | undefined> = {};

    for (let i = 2; i < argv.length; i += 1) {
        const arg = argv[i];
        if (!arg.startsWith("--")) {
            continue;
        }
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith("--")) {
            args[key] = true;
            i -= 1;
        } else {
            args[key] = next;
        }
    }

    const required = ["outside", "inside", "racing", "trackKey", "trackLocation"] as const;
    for (const key of required) {
        if (!args[key]) {
            throw new Error(`Missing required argument --${key}`);
        }
    }

    return {
        outside: String(args.outside),
        inside: String(args.inside),
        racing: String(args.racing),
        trackKey: String(args.trackKey),
        trackLocation: String(args.trackLocation),
        trackVariation: args.trackVariation ? String(args.trackVariation) : undefined,
        outputDir: args.outputDir ? String(args.outputDir) : undefined,
        resampleCount: args.resampleCount ? Number(args.resampleCount) : undefined,
        useRacingLineTube: args.useRacingLineTube ? Boolean(args.useRacingLineTube) : undefined,
    };
}

function emitProgress(phase: ProgressPhase, phaseIndex: number, percent: number, message: string) {
    emit({
        type: "progress",
        phase,
        phaseIndex,
        totalPhases: TOTAL_PHASES,
        message,
        percent,
    });
}

function emitLog(level: "info" | "warn" | "error" | "debug", message: string, context?: Record<string, unknown>) {
    emit({
        type: "log",
        level,
        message,
        context,
    });
}

function calculateTrackLength(points: Array<{ position: [number, number, number] }>): number {
    if (points.length < 2) {
        return 0;
    }

    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
        const prev = points[i - 1];
        const curr = points[i];
        const dx = curr.position[0] - prev.position[0];
        const dy = curr.position[1] - prev.position[1];
        const dz = curr.position[2] - prev.position[2];
        total += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    return total;
}

function averageConfidence(result: AlignRunsResult): number {
    const confidences = Object.values(result.startFinish).map((summary) => summary.confidence);
    if (confidences.length === 0) {
        return 0;
    }
    return confidences.reduce((sum, value) => sum + value, 0) / confidences.length;
}

async function ensureDirectory(dir: string) {
    await fs.mkdir(dir, { recursive: true });
}

function resolveOutputBase(args: CliArgs): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseName = `${args.trackKey}-${timestamp}`;
    const targetDir = args.outputDir ?? path.join(process.cwd(), "output");
    return path.join(targetDir, baseName);
}

async function loadTelemetry(args: CliArgs): Promise<RunDictionary> {
    emitProgress("alignment", 0, 5, "Loading telemetry files");
    const runs = await loadRunsFromFiles(args.outside, args.inside, args.racing);
    emitProgress("alignment", 0, 15, "Telemetry files loaded");
    emitLog("info", "Telemetry files loaded", {
        outsidePoints: runs.outside.length,
        insidePoints: runs.inside.length,
        racingPoints: runs.racing.length,
    });
    return runs;
}

async function runAlignment(runs: RunDictionary, resampleCount?: number): Promise<AlignRunsResult> {
    emitProgress("alignment", 0, 25, "Aligning runs");
    const result = alignRuns(runs, {
        resampleCount,
        logger: (level, message, context) => emitLog(level, message, context ?? undefined),
    });
    emitProgress("alignment", 0, 100, "Alignment complete");
    emitLog("info", "Alignment diagnostics", {
        alignmentScore: result.diagnostics.alignmentScore,
        maxStartPositionDelta: result.diagnostics.maxStartPositionDelta,
        resampleCount: result.resampled.outside.length,
    });
    return result;
}

async function generateScene(alignment: AlignRunsResult, useTube: boolean): Promise<THREE.Scene> {
    emitProgress("geometry", 1, 20, "Building Three.js scene");
    const scene = new THREE.Scene();
    scene.name = "track-scene";

    emitProgress("geometry", 1, 40, "Creating track surface");
    const trackSurface = createTrackSurface(alignment.resampled.inside, alignment.resampled.outside, {
        segments: 500,
        closed: true,
    });
    scene.add(trackSurface);

    emitProgress("geometry", 1, 70, "Creating racing line");
    const racingLine = useTube
        ? createRacingLineTube(alignment.resampled.racing, {
            color: 0x00ff00,
            heightOffset: 0.1,
            radius: 0.07,
        })
        : createRacingLine(alignment.resampled.racing, {
            color: 0x00ff00,
            heightOffset: 0.1,
        });
    scene.add(racingLine);

    emitProgress("geometry", 1, 85, "Adding scene lighting");
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(150, 250, 100);
    scene.add(keyLight);

    emitProgress("geometry", 1, 100, "Geometry complete");
    return scene;
}

async function exportScene(scene: THREE.Scene, outputBasePath: string) {
    emitProgress("export", 2, 10, "Exporting glTF");
    await ensureDirectory(path.dirname(outputBasePath));
    const glbPath = await exportToGLTF(scene, {
        outputPath: outputBasePath,
        exportMetadata: false,
        optimize: true,
    });
    emitProgress("export", 2, 100, "glTF export complete");
    return glbPath;
}

async function writeMetadata(alignment: AlignRunsResult, trackInfo: TrackInfo, outputBasePath: string) {
    emitProgress("metadata", 3, 25, "Writing metadata JSON");
    const metadataPath = await generateMetadata(alignment, trackInfo, outputBasePath);
    emitProgress("metadata", 3, 100, "Metadata export complete");
    return metadataPath;
}

async function main() {
    try {
        const args = parseArgs(process.argv);
        const runs = await loadTelemetry(args);
        const alignment = await runAlignment(runs, args.resampleCount);

        const referenceRun = alignment.resampled.racing.length > 1
            ? alignment.resampled.racing
            : alignment.resampled.outside;
        const estimatedLength = calculateTrackLength(referenceRun);

        const trackInfo: TrackInfo = {
            key: args.trackKey,
            location: args.trackLocation,
            name: args.trackLocation,
            variation: args.trackVariation || undefined,
            length: Math.round(estimatedLength),
        };

        const scene = await generateScene(alignment, Boolean(args.useRacingLineTube ?? true));
        const outputBasePath = resolveOutputBase(args);
        const glbPath = await exportScene(scene, outputBasePath);
        const metadataPath = await writeMetadata(alignment, trackInfo, outputBasePath);

        emit({
            type: "result",
            glbPath,
            metadataPath,
            outputDir: path.dirname(glbPath),
            track: {
                key: trackInfo.key,
                location: trackInfo.location,
                variation: trackInfo.variation,
                length: trackInfo.length,
            },
            alignment: {
                alignmentScore: alignment.diagnostics.alignmentScore,
                maxStartPositionDelta: alignment.diagnostics.maxStartPositionDelta,
                resampleCount: alignment.resampled.outside.length,
                confidence: averageConfidence(alignment),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        emit({
            type: "error",
            message,
        });
        process.exitCode = 1;
    }
}

void main();
