; Coordinate Finder Tool for AMS2 Automation
; AutoHotkey v2.0
; Press Ctrl+Shift+C to capture mouse position

#Requires AutoHotkey v2.0
#SingleInstance Force

; Global storage for captured coordinates
global coordinates := []
global outputFile := A_ScriptDir . "\..\config\captured-coordinates.txt"

; Create tooltip and instructions
ShowInstructions() {
    instructions := "
    (
    === AMS2 Coordinate Finder ===

    1. Position your mouse over a button/menu item
    2. Press Ctrl+Shift+C to capture coordinates
    3. Type a name/description in the popup
    4. Repeat for all UI elements
    5. Press Ctrl+Shift+S to save all coordinates
    6. Press Ctrl+Shift+Q to quit

    Coordinates will be saved to:
    " . outputFile . "
    )"

    MsgBox(instructions, "Coordinate Finder", 64)
}

; Capture coordinate at current mouse position
^+c:: {  ; Ctrl+Shift+C
    MouseGetPos(&x, &y)

    ; Get window information
    activeWindow := WinGetTitle("A")

    ; Prompt user for description
    description := InputBox("Enter description for this coordinate`n`nPosition: " . x . ", " . y . "`nWindow: " . activeWindow, "Capture Coordinate").Value

    if (description != "") {
        coord := {
            x: x,
            y: y,
            description: description,
            window: activeWindow,
            timestamp: FormatTime(, "yyyy-MM-dd HH:mm:ss")
        }

        coordinates.Push(coord)

        ToolTip("✓ Captured: " . description . "`n(" . x . ", " . y . ")")
        SetTimer(() => ToolTip(), -2000)  ; Clear after 2 seconds

        ; Play success sound
        SoundBeep(1000, 100)
    }
}

; Save all captured coordinates
^+s:: {  ; Ctrl+Shift+S
    if (coordinates.Length == 0) {
        MsgBox("No coordinates captured yet!", "Warning", 48)
        return
    }

    ; Create output content
    output := "=== AMS2 UI Coordinates ===`n"
    output .= "Captured: " . FormatTime(, "yyyy-MM-dd HH:mm:ss") . "`n"
    output .= "Total: " . coordinates.Length . " coordinates`n`n"

    ; Add each coordinate
    for index, coord in coordinates {
        output .= "---`n"
        output .= "[" . index . "] " . coord.description . "`n"
        output .= "    Position: x=" . coord.x . ", y=" . coord.y . "`n"
        output .= "    Window: " . coord.window . "`n"
        output .= "    Time: " . coord.timestamp . "`n"
    }

    ; Add AutoHotkey code snippet
    output .= "`n`n=== AutoHotkey Code Snippet ===`n`n"
    for index, coord in coordinates {
        sanitized := RegExReplace(coord.description, "[^a-zA-Z0-9]", "_")
        output .= "; " . coord.description . "`n"
        output .= "global " . sanitized . "_X := " . coord.x . "`n"
        output .= "global " . sanitized . "_Y := " . coord.y . "`n`n"
    }

    ; Save to file
    try {
        ; Create directory if doesn't exist
        dir := SubStr(outputFile, 1, InStr(outputFile, "\",, -1) - 1)
        if (!DirExist(dir)) {
            DirCreate(dir)
        }

        FileDelete(outputFile)  ; Delete old file
        FileAppend(output, outputFile)

        MsgBox("✓ Saved " . coordinates.Length . " coordinates to:`n" . outputFile, "Success", 64)

        ; Ask if user wants to open the file
        result := MsgBox("Open the coordinate file?", "Open File", 4)
        if (result = "Yes") {
            Run("notepad.exe " . outputFile)
        }
    } catch as err {
        MsgBox("Error saving file: " . err.Message, "Error", 16)
    }
}

; Show current mouse position continuously
^+m:: {  ; Ctrl+Shift+M - Toggle mouse position display
    global positionDisplayActive := !IsSet(positionDisplayActive) ? true : !positionDisplayActive

    if (positionDisplayActive) {
        SetTimer(UpdateMousePosition, 100)
        ToolTip("Mouse position display ACTIVE")
        SetTimer(() => ToolTip(), -2000)
    } else {
        SetTimer(UpdateMousePosition, 0)
        ToolTip()
    }
}

UpdateMousePosition() {
    MouseGetPos(&x, &y)
    ToolTip("X: " . x . " Y: " . y . "`n(Ctrl+Shift+C to capture)")
}

; Clear all captured coordinates
^+d:: {  ; Ctrl+Shift+D - Delete all
    result := MsgBox("Clear all " . coordinates.Length . " captured coordinates?", "Confirm Clear", 4 + 48)
    if (result = "Yes") {
        coordinates := []
        ToolTip("✓ All coordinates cleared")
        SetTimer(() => ToolTip(), -2000)
    }
}

; Quit
^+q:: {  ; Ctrl+Shift+Q
    result := MsgBox("Quit coordinate finder?", "Confirm Quit", 4)
    if (result = "Yes") {
        ExitApp()
    }
}

; Show help
^+h:: {  ; Ctrl+Shift+H
    ShowInstructions()
}

; Startup
ShowInstructions()

; Keep script running
return
