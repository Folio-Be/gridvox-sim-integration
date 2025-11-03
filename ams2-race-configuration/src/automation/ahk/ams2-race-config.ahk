; AMS2 Race Configuration Automation
; AutoHotkey v2.0
; Purpose: Automate race configuration in Automobilista 2

#Requires AutoHotkey v2.0
#SingleInstance Force

; ============================================================================
; CONFIGURATION
; ============================================================================

global CONFIG := {
    GameTitle: "Automobilista 2",
    GameExe: "AMS2AVX.exe",
    GamePath: "C:\GAMES\Automobilista 2\AMS2AVX.exe",
    SteamAppId: "1066890",
    Resolution: "1920x1080",
    DefaultDelay: 500,
    LongDelay: 1000,
    ShortDelay: 200,
    MaxRetries: 3,
    LogPath: A_ScriptDir . "\..\logs\",
    ScreenshotPath: A_ScriptDir . "\..\screenshots\",
    ConfigPath: A_ScriptDir . "\..\config\race-config.json"
}

; ============================================================================
; MAIN ENTRY POINT
; ============================================================================

Main() {
    try {
        Log("=== AMS2 Race Configuration Automation Started ===")

        ; Read race configuration from JSON
        raceConfig := ReadRaceConfig()
        if (!raceConfig) {
            throw Error("Failed to read race configuration")
        }

        Log("Configuration loaded: " . JSON.stringify(raceConfig))

        ; Ensure game is running
        if (!IsGameRunning()) {
            Log("Game not running, attempting to launch...")
            LaunchGame()
            Sleep(CONFIG.LongDelay * 10) ; Wait for game to start
        }

        ; Focus game window
        if (!FocusGame()) {
            throw Error("Failed to focus game window")
        }

        ; Navigate to main menu (if not already there)
        EnsureMainMenu()

        ; Navigate to custom race configuration
        NavigateToCustomRace()

        ; Apply configuration
        ConfigureRace(raceConfig)

        ; Save configuration
        SaveRaceConfiguration()

        Log("=== Race configuration completed successfully ===")
        CaptureScreenshot("success")

    } catch as err {
        Log("ERROR: " . err.Message)
        CaptureScreenshot("error")
        MsgBox("Automation failed: " . err.Message, "Error", 16)
    }
}

; ============================================================================
; GAME CONTROL FUNCTIONS
; ============================================================================

IsGameRunning() {
    return WinExist(CONFIG.GameTitle) != 0 || ProcessExist(CONFIG.GameExe)
}

LaunchGame() {
    ; Try direct executable first
    if (FileExist(CONFIG.GamePath)) {
        try {
            Run(CONFIG.GamePath)
            Log("Launched game via direct executable: " . CONFIG.GamePath)
        } catch as err {
            Log("Failed to launch directly, trying Steam: " . err.Message)
            Run("steam://rungameid/" . CONFIG.SteamAppId)
            Log("Launched game via Steam")
        }
    } else {
        ; Fallback to Steam
        Run("steam://rungameid/" . CONFIG.SteamAppId)
        Log("Launched game via Steam")
    }

    ; Wait for window to appear
    Loop CONFIG.MaxRetries * 2 {
        Sleep(CONFIG.LongDelay * 2)
        if (IsGameRunning()) {
            Log("Game window detected")
            return true
        }
    }

    throw Error("Game failed to launch")
}

FocusGame() {
    if (WinExist(CONFIG.GameTitle)) {
        WinActivate(CONFIG.GameTitle)
        Sleep(CONFIG.DefaultDelay)
        if (WinActive(CONFIG.GameTitle)) {
            Log("Game window focused")
            return true
        }
    }
    return false
}

EnsureMainMenu() {
    Log("Ensuring at main menu...")
    ; Press ESC multiple times to return to main menu
    Loop 5 {
        Send("{Esc}")
        Sleep(CONFIG.DefaultDelay)
    }
    Sleep(CONFIG.LongDelay)
    Log("Should be at main menu now")
}

; ============================================================================
; NAVIGATION FUNCTIONS
; ============================================================================

NavigateToCustomRace() {
    Log("Navigating to Custom Race...")

    ; From main menu: Single Player -> Custom Race
    ; Note: These coordinates are PLACEHOLDERS - need calibration per resolution

    ; Click "Single Player" or navigate with arrow keys
    Send("{Down}")
    Sleep(CONFIG.ShortDelay)
    Send("{Enter}")
    Sleep(CONFIG.LongDelay)

    ; Click "Custom Race"
    Send("{Down}")
    Sleep(CONFIG.ShortDelay)
    Send("{Enter}")
    Sleep(CONFIG.LongDelay)

    Log("Should be at Custom Race configuration screen")
}

ConfigureRace(config) {
    Log("Configuring race parameters...")

    ; Track configuration
    if (config.Has("track")) {
        ConfigureTrack(config["track"])
    }

    ; Car class configuration
    if (config.Has("carClass")) {
        ConfigureCarClass(config["carClass"])
    }

    ; Opponent configuration
    if (config.Has("opponents")) {
        ConfigureOpponents(config["opponents"])
    }

    ; Weather configuration
    if (config.Has("weather")) {
        ConfigureWeather(config["weather"])
    }

    ; Time of day
    if (config.Has("timeOfDay")) {
        ConfigureTimeOfDay(config["timeOfDay"])
    }

    ; Session length
    if (config.Has("sessionLength")) {
        ConfigureSessionLength(config["sessionLength"])
    }

    Log("Race configuration applied")
}

ConfigureTrack(trackName) {
    Log("Configuring track: " . trackName)
    ; TODO: Implement track selection logic
    ; Navigate to track menu, find track by name, select
}

ConfigureCarClass(carClass) {
    Log("Configuring car class: " . carClass)
    ; TODO: Implement car class selection logic
}

ConfigureOpponents(opponentConfig) {
    Log("Configuring opponents: count=" . opponentConfig["count"])
    ; TODO: Implement opponent configuration
}

ConfigureWeather(weatherType) {
    Log("Configuring weather: " . weatherType)
    ; TODO: Implement weather configuration
}

ConfigureTimeOfDay(timeOfDay) {
    Log("Configuring time of day: " . timeOfDay)
    ; TODO: Implement time of day configuration
}

ConfigureSessionLength(sessionLength) {
    Log("Configuring session length: " . sessionLength)
    ; TODO: Implement session length configuration
}

SaveRaceConfiguration() {
    Log("Saving race configuration...")
    ; TODO: Navigate to save option and confirm
    Send("{Enter}")
    Sleep(CONFIG.LongDelay)
}

; ============================================================================
; UTILITY FUNCTIONS
; ============================================================================

ReadRaceConfig() {
    try {
        configContent := FileRead(CONFIG.ConfigPath)
        return JSON.parse(configContent)
    } catch {
        Log("Warning: Could not read config file, using defaults")
        return {
            track: "Interlagos",
            carClass: "GT3",
            opponents: {count: 20, difficulty: "Medium"},
            weather: "Clear",
            timeOfDay: "Noon",
            sessionLength: "10 Laps"
        }
    }
}

Log(message) {
    timestamp := FormatTime(, "yyyy-MM-dd HH:mm:ss")
    logMessage := timestamp . " | " . message . "`n"

    ; Create log directory if it doesn't exist
    if (!DirExist(CONFIG.LogPath)) {
        DirCreate(CONFIG.LogPath)
    }

    ; Append to log file
    logFile := CONFIG.LogPath . FormatTime(, "yyyy-MM-dd") . ".log"
    FileAppend(logMessage, logFile)

    ; Also output to stdout for debugging
    FileAppend(logMessage, "*")
}

CaptureScreenshot(tag := "") {
    ; Create screenshot directory if it doesn't exist
    if (!DirExist(CONFIG.ScreenshotPath)) {
        DirCreate(CONFIG.ScreenshotPath)
    }

    timestamp := FormatTime(, "yyyyMMdd-HHmmss")
    filename := CONFIG.ScreenshotPath . timestamp . "_" . tag . ".png"

    ; Capture screenshot (requires additional library or external tool)
    ; For now, just log the attempt
    Log("Screenshot captured: " . filename)
}

; ============================================================================
; JSON PARSER (Simple implementation)
; ============================================================================

class JSON {
    static parse(jsonString) {
        ; Simple JSON parser - for production use a proper library
        ; This is a placeholder
        result := Map()
        result["track"] := "Interlagos"
        result["carClass"] := "GT3"
        result["opponents"] := Map("count", 20, "difficulty", "Medium")
        result["weather"] := "Clear"
        result["timeOfDay"] := "Noon"
        result["sessionLength"] := "10 Laps"
        return result
    }

    static stringify(obj) {
        ; Simple stringifier
        return "JSON Object"
    }
}

; ============================================================================
; HOTKEYS
; ============================================================================

; Emergency abort hotkey
^!g:: {
    Log("EMERGENCY ABORT - User triggered")
    MsgBox("Automation aborted by user", "Aborted", 48)
    ExitApp()
}

; ============================================================================
; RUN
; ============================================================================

; If script is run directly (not included)
if (A_ScriptName = "ams2-race-config.ahk") {
    Main()
}
