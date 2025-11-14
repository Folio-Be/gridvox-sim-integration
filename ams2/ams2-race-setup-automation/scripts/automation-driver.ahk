; ============================================================
; SimVox AMS2 Race Setup Automation Driver (placeholder)
; ============================================================
; This script will evolve into the deterministic action executor.
; Keep it self-contained: no references to other repositories or scripts.

#Requires AutoHotkey v2.0

global g_IsDryRun := true

FocusAMS2() {
    if WinExist("Automobilista 2") {
        WinActivate
        Sleep 250
        return true
    }
    return false
}

ClickBoundingBox(x, y) {
    if (g_IsDryRun) {
        OutputDebug "DRYRUN_CLICK," x "," y
        return
    }
    MouseMove x, y, 0
    Sleep 30
    Click "Left"
    Sleep 60
}

TypeText(value) {
    if (g_IsDryRun) {
        OutputDebug "DRYRUN_TYPE," value
        return
    }
    SendText value
    Sleep 100
}

; Entry point for CLI usage: AutoHotkey64.exe automation-driver.ahk Action payload.json
Main() {
    if A_Args.Length < 2 {
        MsgBox "Usage: AutoHotkey64.exe automation-driver.ahk <ActionName> <PayloadPath>"
        ExitApp 1
    }

    action := A_Args[1]
    payloadPath := A_Args[2]

    if !FocusAMS2() {
        MsgBox "AMS2 window not found. Ensure the sim is running."
        ExitApp 2
    }

    ; TODO: Parse payload JSON and route to specific routines.
    OutputDebug "ACTION_START," action "," payloadPath
    Sleep 100
    OutputDebug "ACTION_DONE," action
}

Main()
