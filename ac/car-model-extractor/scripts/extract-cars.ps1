# Assetto Corsa Car Model Extraction Script
# Converts .kn5 → FBX → GLTF/GLB with Draco compression
#
# Usage:
#   .\scripts\extract-cars.ps1 -Cars "ks_ferrari_488_gt3,ks_porsche_911_gt3_r_2016"
#   .\scripts\extract-cars.ps1 -All
#   .\scripts\extract-cars.ps1 -Test (extracts 5 cars)

param(
    [string]$ACPath = "C:\Program Files (x86)\Steam\steamapps\common\assettocorsa",
    [string[]]$Cars = @(),
    [switch]$All,
    [switch]$Test,
    [string]$OutputDir = ".\output",
    [int]$DracoLevel = 7,
    [switch]$SkipExisting
)

# Configuration
$KN5_CONVERTER = ".\tools\kn5-converter\kn5conv.exe"
$FBX2GLTF = ".\tools\FBX2glTF\FBX2glTF.exe"
$CARS_DIR = Join-Path $ACPath "content\cars"

# Colors
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorWarn = "Yellow"

# Header
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host " Assetto Corsa Car Model Extractor" -ForegroundColor $ColorInfo
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host ""

# Verify tools
Write-Host "Verifying tools..." -ForegroundColor $ColorInfo

if (-not (Test-Path $KN5_CONVERTER)) {
    Write-Host "✖ kn5-converter not found: $KN5_CONVERTER" -ForegroundColor $ColorError
    Write-Host "  Download from: https://github.com/RaduMC/kn5-converter/releases" -ForegroundColor $ColorWarn
    exit 1
}
Write-Host "✓ kn5-converter: $KN5_CONVERTER" -ForegroundColor $ColorSuccess

if (-not (Test-Path $FBX2GLTF)) {
    Write-Host "✖ FBX2glTF not found: $FBX2GLTF" -ForegroundColor $ColorError
    Write-Host "  Download from: https://github.com/facebookincubator/FBX2glTF/releases" -ForegroundColor $ColorWarn
    exit 1
}
Write-Host "✓ FBX2glTF: $FBX2GLTF" -ForegroundColor $ColorSuccess

if (-not (Test-Path $CARS_DIR)) {
    Write-Host "✖ AC cars directory not found: $CARS_DIR" -ForegroundColor $ColorError
    Write-Host "  Check AC_INSTALL_PATH in .env" -ForegroundColor $ColorWarn
    exit 1
}
Write-Host "✓ AC installation: $ACPath" -ForegroundColor $ColorSuccess
Write-Host ""

# Determine cars to extract
$carList = @()

if ($Test) {
    Write-Host "TEST MODE: Extracting 5 sample cars" -ForegroundColor $ColorWarn
    $carList = @(
        "ks_ferrari_488_gt3",
        "ks_porsche_911_gt3_r_2016",
        "ks_lamborghini_huracan_gt3",
        "ks_mercedes_amg_gt3",
        "ks_audi_r8_lms_2016"
    )
} elseif ($All) {
    Write-Host "Scanning for all cars..." -ForegroundColor $ColorInfo
    $carDirs = Get-ChildItem -Path $CARS_DIR -Directory
    foreach ($dir in $carDirs) {
        $kn5File = Join-Path $dir.FullName "$($dir.Name).kn5"
        if (Test-Path $kn5File) {
            $carList += $dir.Name
        }
    }
    Write-Host "Found $($carList.Count) cars" -ForegroundColor $ColorSuccess
} elseif ($Cars.Count -gt 0) {
    $carList = $Cars
} else {
    Write-Host "Error: Specify -Cars, -All, or -Test" -ForegroundColor $ColorError
    Write-Host "Examples:" -ForegroundColor $ColorWarn
    Write-Host "  .\scripts\extract-cars.ps1 -Cars `"ks_ferrari_488_gt3`"" -ForegroundColor $ColorWarn
    Write-Host "  .\scripts\extract-cars.ps1 -All" -ForegroundColor $ColorWarn
    Write-Host "  .\scripts\extract-cars.ps1 -Test" -ForegroundColor $ColorWarn
    exit 1
}

# Create output directories
$fbxDir = Join-Path $OutputDir "fbx"
$gltfDir = Join-Path $OutputDir "gltf"
New-Item -ItemType Directory -Force -Path $fbxDir | Out-Null
New-Item -ItemType Directory -Force -Path $gltfDir | Out-Null

# Statistics
$stats = @{
    Total = $carList.Count
    Successful = 0
    Failed = 0
    Skipped = 0
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host " Phase 1/2: Converting .kn5 → FBX" -ForegroundColor $ColorInfo
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host ""

$current = 0
foreach ($carId in $carList) {
    $current++
    $percent = [math]::Round(($current / $stats.Total) * 100)

    Write-Host "[$current/$($stats.Total)] ($percent%) $carId" -ForegroundColor $ColorInfo

    $carDir = Join-Path $CARS_DIR $carId
    $kn5File = Join-Path $carDir "$carId.kn5"
    $fbxFile = Join-Path $fbxDir "$carId.fbx"

    if (-not (Test-Path $kn5File)) {
        Write-Host "  ✖ .kn5 file not found: $kn5File" -ForegroundColor $ColorError
        $stats.Failed++
        continue
    }

    if ($SkipExisting -and (Test-Path $fbxFile)) {
        Write-Host "  ⊙ Skipped (FBX exists)" -ForegroundColor $ColorWarn
        $stats.Skipped++
        continue
    }

    # Run kn5-converter
    try {
        $output = & $KN5_CONVERTER -fbx $kn5File 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Move FBX to output directory (kn5-converter outputs to same dir as .kn5)
            $generatedFbx = Join-Path $carDir "$carId.fbx"
            if (Test-Path $generatedFbx) {
                Move-Item -Path $generatedFbx -Destination $fbxFile -Force
                Write-Host "  ✓ Converted to FBX" -ForegroundColor $ColorSuccess
            } else {
                throw "FBX file not generated"
            }
        } else {
            throw "kn5-converter exited with code $LASTEXITCODE"
        }
    } catch {
        Write-Host "  ✖ kn5-converter failed: $_" -ForegroundColor $ColorError
        $stats.Failed++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host " Phase 2/2: Converting FBX → GLTF" -ForegroundColor $ColorInfo
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host ""

$current = 0
$fbxFiles = Get-ChildItem -Path $fbxDir -Filter "*.fbx"

foreach ($fbxFile in $fbxFiles) {
    $current++
    $carId = $fbxFile.BaseName
    $percent = [math]::Round(($current / $fbxFiles.Count) * 100)

    Write-Host "[$current/$($fbxFiles.Count)] ($percent%) $carId" -ForegroundColor $ColorInfo

    $gltfFile = Join-Path $gltfDir "$carId.glb"

    if ($SkipExisting -and (Test-Path $gltfFile)) {
        Write-Host "  ⊙ Skipped (GLTF exists)" -ForegroundColor $ColorWarn
        continue
    }

    # Run FBX2glTF with Draco compression
    try {
        $args = @(
            "--binary",
            "--draco",
            "--draco-compression-level", $DracoLevel,
            "--draco-bits-for-position", "14",
            "--draco-bits-for-uv", "10",
            "--draco-bits-for-normals", "10",
            "--pbr-metallic-roughness",
            "--input", $fbxFile.FullName,
            "--output", $gltfFile
        )

        $output = & $FBX2GLTF @args 2>&1

        if ($LASTEXITCODE -eq 0 -and (Test-Path $gltfFile)) {
            $sizeKB = [math]::Round((Get-Item $gltfFile).Length / 1KB, 1)
            Write-Host "  ✓ Converted to GLTF ($sizeKB KB)" -ForegroundColor $ColorSuccess
            $stats.Successful++
        } else {
            throw "FBX2glTF exited with code $LASTEXITCODE"
        }
    } catch {
        Write-Host "  ✖ FBX2glTF failed: $_" -ForegroundColor $ColorError
        $stats.Failed++
    }
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host " Extraction Complete" -ForegroundColor $ColorInfo
Write-Host "═══════════════════════════════════════════" -ForegroundColor $ColorInfo
Write-Host ""
Write-Host "Total:      $($stats.Total)" -ForegroundColor $ColorInfo
Write-Host "Successful: $($stats.Successful)" -ForegroundColor $ColorSuccess
Write-Host "Failed:     $($stats.Failed)" -ForegroundColor $ColorError
Write-Host "Skipped:    $($stats.Skipped)" -ForegroundColor $ColorWarn
Write-Host ""
Write-Host "Output directory: $OutputDir" -ForegroundColor $ColorInfo
Write-Host "GLTF files: $gltfDir" -ForegroundColor $ColorInfo
Write-Host ""
