from pathlib import Path

path = Path("ams2/ams2-telemetry-track-generator/src/components/screens/LiveRecording.tsx")
text = path.read_text()

old_import = '  RunTypeAssignmentPayload,\n  RunTypeName,\n} from "../../lib/run-type-storage";'
new_import = '  RunTypeAssignmentPayload,\n  RunTypeName,\n  exportRunTypeRecordings,\n  ExportRunTypeRecordingResult,\n} from "../../lib/run-type-storage";'
if old_import not in text:
    raise SystemExit("import block not found")
text = text.replace(old_import, new_import, 1)

old_state = (
    '  const trackInfoRef = useRef(trackInfo);\n'
    '  const curbDetectionPrevRef = useRef(false);\n'
    '  const [showAssignmentWarning, setShowAssignmentWarning] = useState(false);\n\n'
    '  const allRunTypesAssigned'
)
new_state = (
    '  const trackInfoRef = useRef(trackInfo);\n'
    '  const curbDetectionPrevRef = useRef(false);\n'
    '  const [showAssignmentWarning, setShowAssignmentWarning] = useState(false);\n'
    '  const [isExportingRecordings, setIsExportingRecordings] = useState(false);\n\n'
    '  const allRunTypesAssigned'
)
if old_state not in text:
    raise SystemExit("state block not found")
text = text.replace(old_state, new_state, 1)

handle_lap_block = (
    '  const handleLapClick = (lap: LapRecord) => {\n'
    '    selectedLapIdRef.current = lap.id;\n'
    '    setSelectedLapId(lap.id);\n'
    '    const assignedRunType = RUN_TYPES.find((runType) => runTypeAssignmentsRef.current[runType]?.lapId === lap.id) ?? null;\n'
    '    if (assignedRunType) {\n'
    '      setSelectedRunType(assignedRunType);\n'
    '      const telemetryPoints = runTypeTelemetryRef.current[assignedRunType];\n'
    '      setOverlayRunType(assignedRunType);\n'
    '      setOverlayTelemetry(telemetryPoints.map((point) => ({ ...point })));\n'
    '      return;\n'
    '    }\n\n'
    '    setSelectedRunType(null);\n'
    '    const lapVisualizerPoints = lapVisualizerTelemetryRef.current[lap.id]\n'
    '      ?? toVisualizerTelemetryArray(lapTelemetryRef.current[lap.id] || []);\n'
    '    lapVisualizerTelemetryRef.current[lap.id] = lapVisualizerPoints.map((point) => ({ ...point, runType: point.runType ?? null }));\n'
    '    setOverlayRunType(null);\n'
    '    setOverlayTelemetry(lapVisualizerTelemetryRef.current[lap.id].map((point) => ({ ...point, runType: null })));\n'
    '  };'
)
if handle_lap_block not in text:
    raise SystemExit("handleLapClick block not found")
new_handler = (
    '\n\n  const handleStopAndSave = async () => {\n'
    '    if (isExportingRecordings) {\n'
    '      return;\n'
    '    }\n\n'
    '    if (!allRunTypesAssigned) {\n'
    '      setShowAssignmentWarning(true);\n'
    '      debugConsole.warn("Assign Outside, Inside, and Racing laps before exporting recordings.");\n'
    '      return;\n'
    '    }\n\n'
    '    const trackKey = trackKeyRef.current;\n'
    '    const { location, variation } = trackInfoRef.current;\n'
    '    if (!trackKey || !location) {\n'
    '      debugConsole.error("Track information is unavailable; cannot export telemetry recordings.");\n'
    '      return;\n'
    '    }\n\n'
    '    const exportAssignments: Partial<Record<RunType, RunTypeAssignmentPayload>> = {};\n\n'
    '    for (const runType of RUN_TYPES) {\n'
    '      const assignment = runTypeAssignmentsRef.current[runType];\n'
    '      const telemetryPoints = runTypeTelemetryRef.current[runType] ?? [];\n\n'
    '      if (!assignment) {\n'
    '        debugConsole.error(`Missing ${RUN_TYPE_LABELS[runType]} assignment; aborting export.`);\n'
    '        setShowAssignmentWarning(true);\n'
    '        return;\n'
    '      }\n\n'
    '      if (telemetryPoints.length === 0) {\n'
    '        debugConsole.error(`No telemetry captured for the ${RUN_TYPE_LABELS[runType]} line; aborting export.`);\n'
    '        return;\n'
    '      }\n\n'
    '      exportAssignments[runType] = {\n'
    '        lapId: assignment.lapId,\n'
    '        lapNumber: assignment.lapNumber,\n'
    '        assignedAt: assignment.assignedAt,\n'
    '        validity: assignment.validity,\n'
    '        timeSeconds: assignment.timeSeconds,\n'
    '        distanceMeters: assignment.distanceMeters,\n'
    '        telemetryPoints: toStorageTelemetryArray(telemetryPoints),\n'
    '      };\n'
    '    }\n\n'
    '    setIsExportingRecordings(true);\n'
    '    setShowAssignmentWarning(false);\n\n'
    '    try {\n'
    '      const exportResults = await exportRunTypeRecordings({\n'
    '        trackKey,\n'
    '        trackLocation: location,\n'
    '        trackVariation: variation ?? "",\n'
    '        assignments: exportAssignments as Record<RunType, RunTypeAssignmentPayload>,\n'
    '      });\n\n'
    '      if (exportResults.length === 0) {\n'
    '        debugConsole.warn("No recordings were exported. Verify your run assignments and try again.");\n'
    '        setIsExportingRecordings(false);\n'
    '        return;\n'
    '      }\n\n'
    '      exportResults.forEach(({ runType, filePath }: ExportRunTypeRecordingResult) => {\n'
    '        const label = RUN_TYPE_LABELS[runType];\n'
    '        debugConsole.success(`${label} telemetry saved to ${filePath}`);\n'
    '      });\n\n'
    '      onStopRecording();\n'
    '    } catch (error) {\n'
    '      debugConsole.error(`Failed to export telemetry recordings: ${String(error)}`);\n'
    '    } finally {\n'
    '      setIsExportingRecordings(false);\n'
    '    }\n'
    '  };'
)
text = text.replace(handle_lap_block, handle_lap_block + new_handler, 1)

old_stop_block = (
    '              <button\n'
    '                type="button"\n'
    '                className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] gap-2 transition-colors ${\n'
    '                  allRunTypesAssigned\n'
    '                    ? "cursor-pointer bg-red-600 hover:bg-red-700 text-white"\n'
    '                    : "cursor-not-allowed bg-red-600/30 text-white/40"\n'
    '                }`}\n'
    '                disabled={!allRunTypesAssigned}\n'
    '                onClick={() => {\n'
    '                  if (!allRunTypesAssigned) {\n'
    '                    setShowAssignmentWarning(true);\n'
    '                    return;\n'
    '                  }\n'
    '                  onStopRecording();\n'
    '                }}\n'
    '              >\n'
    '                <span className="material-symbols-outlined">stop_circle</span>\n'
    '                <span className="truncate">Stop & Save Recording</span>\n'
    '              </button>'
)
new_stop_block = (
    '              <button\n'
    '                type="button"\n'
    '                className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${\n'
    '                  allRunTypesAssigned\n'
    '                    ? "cursor-pointer bg-red-600 hover:bg-red-700 text-white"\n'
    '                    : "bg-red-600/30 text-white/40"\n'
    '                }`}\n'
    '                disabled={!allRunTypesAssigned || isExportingRecordings}\n'
    '                onClick={handleStopAndSave}\n'
    '              >\n'
    '                <span className="material-symbols-outlined">\n'
    '                  {isExportingRecordings ? "hourglass_bottom" : "stop_circle"}\n'
    '                </span>\n'
    '                <span className="truncate">\n'
    '                  {isExportingRecordings ? "Saving Recording..." : "Stop & Save Recording"}\n'
    '                </span>\n'
    '              </button>'
)
if old_stop_block not in text:
    raise SystemExit("stop button block not found")
text = text.replace(old_stop_block, new_stop_block, 1)

path.write_text(text)
