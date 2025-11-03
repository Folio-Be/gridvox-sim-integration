; Simple Coordinate Capture Tool
; Press F9 to capture mouse position
; Press F10 to save all coordinates
; Press F11 to quit

#Requires AutoHotkey v2.0
#SingleInstance Force

global coords := []
global outputFile := A_ScriptDir . "\..\config\captured-coordinates.txt"

; Show startup message
TrayTip("Coordinate Capture Ready", "F9 = Capture | F10 = Save | F11 = Quit", 1)

; F9 - Capture coordinate
F9:: {
    MouseGetPos(&x, &y)
    winTitle := WinGetTitle("A")

    ; Show input box
    IB := InputBox("Enter description:`n`nX: " . x . " Y: " . y, "Capture Coordinate")

    if (IB.Result = "OK" && IB.Value != "") {
        coords.Push({x: x, y: y, desc: IB.Value, win: winTitle})
        TrayTip("Captured!", IB.Value . " (" . x . ", " . y . ")", 1)
        SoundBeep(1000, 100)
    }
}

; F10 - Save all
F10:: {
    if (coords.Length = 0) {
        MsgBox("No coordinates captured yet!")
        return
    }

    output := "=== AMS2 Coordinates ===`n"
    output .= "Total: " . coords.Length . "`n`n"

    for idx, c in coords {
        output .= "[" . idx . "] " . c.desc . "`n"
        output .= "    X: " . c.x . " Y: " . c.y . "`n"
        output .= "    Window: " . c.win . "`n`n"
    }

    output .= "`n=== AutoHotkey Code ===`n`n"
    for idx, c in coords {
        clean := RegExReplace(c.desc, "[^a-zA-Z0-9]", "_")
        output .= "; " . c.desc . "`n"
        output .= "Click(" . c.x . ", " . c.y . ")  `; " . c.desc . "`n`n"
    }

    try {
        ; Ensure directory exists
        dir := SubStr(outputFile, 1, InStr(outputFile, "\",, -1) - 1)
        if (!DirExist(dir)) {
            DirCreate(dir)
        }

        ; Delete old file if it exists
        if (FileExist(outputFile)) {
            FileDelete(outputFile)
        }

        FileAppend(output, outputFile)

        MsgBox("✓ Saved " . coords.Length . " coordinates!`n`n" . outputFile)
        Run("notepad.exe " . outputFile)
    } catch as err {
        MsgBox("Error saving: " . err.Message, "Error", 16)
    }
}

; F11 - Quit
F11:: {
    ExitApp()
}

; Show help on startup
MsgBox("Coordinate Capture Tool`n`nF9 - Capture position`nF10 - Save all`nF11 - Quit`n`nLeave this running in background!", "Ready", 64)
