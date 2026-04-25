# KrishiAI — weather diagnostic
# Runs end-to-end checks and writes a log to diagnose-weather.log
# Run with: powershell -ExecutionPolicy Bypass -File diagnose-weather.ps1

$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $projectRoot "backend"
$logFile = Join-Path $projectRoot "diagnose-weather.log"

# Clear old log
"=== KrishiAI weather diagnostic — $(Get-Date) ===" | Out-File $logFile

function Log($msg, $color = "White") {
    Write-Host $msg -ForegroundColor $color
    $msg | Out-File $logFile -Append
}

Log "`n[1/6] Checking venv..." "Cyan"
$venvPy = Join-Path $backend "venv\Scripts\python.exe"
if (Test-Path $venvPy) {
    $ver = & $venvPy --version 2>&1
    Log "  OK  venv Python: $ver" "Green"
} else {
    Log "  !! venv missing at $venvPy" "Red"
    Log "     Fix: run run-backend.bat once to create venv" "Yellow"
    pause; exit
}

Log "`n[2/6] Checking .env..." "Cyan"
$envFile = Join-Path $backend ".env"
if (Test-Path $envFile) {
    $owmLine = Get-Content $envFile | Where-Object { $_ -match "^OPENWEATHERMAP_API_KEY=" }
    if ($owmLine) {
        $key = ($owmLine -split "=", 2)[1].Trim('"').Trim("'").Trim()
        if ($key.Length -eq 32) {
            Log "  OK  OWM key present (length 32)" "Green"
            $owmKey = $key
        } else {
            Log "  !! OWM key wrong length: $($key.Length) (expected 32)" "Red"
        }
    } else {
        Log "  !! OPENWEATHERMAP_API_KEY missing from .env" "Red"
    }
} else {
    Log "  !! backend\.env missing" "Red"
}

Log "`n[3/6] Testing OWM directly (confirms key is activated)..." "Cyan"
if ($owmKey) {
    try {
        $resp = Invoke-WebRequest -Uri "https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=$owmKey" -UseBasicParsing -TimeoutSec 10
        if ($resp.StatusCode -eq 200) {
            Log "  OK  OWM returned 200 — key is VALID and ACTIVATED" "Green"
        } else {
            Log "  !! OWM returned $($resp.StatusCode)" "Red"
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 401) {
            Log "  !! OWM returned 401 — key invalid OR not yet activated (new keys take ~10 min)" "Red"
        } else {
            Log "  !! OWM call failed: $($_.Exception.Message)" "Red"
        }
    }
}

Log "`n[4/6] Checking if port 8000 is already in use..." "Cyan"
$conn = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($conn) {
    $procId = $conn[0].OwningProcess
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    Log "  Port 8000 in use by: $($proc.ProcessName) (PID $procId)" "Yellow"
} else {
    Log "  OK  Port 8000 is free" "Green"
}

Log "`n[5/6] Importing backend Python modules..." "Cyan"
Push-Location $backend
$importCheck = & $venvPy -c @"
import sys, traceback
try:
    from main import app
    from services.weather_service import orchestrator
    print('OK  main.py imports cleanly')
    print('OK  orchestrator instance created')
    # Check settings
    from core.config import settings
    print(f'  OPENWEATHERMAP_API_KEY set: {bool(settings.OPENWEATHERMAP_API_KEY)}')
    print(f'  API_TIMEOUT: {settings.API_TIMEOUT}')
    print(f'  RATE_LIMIT_PER_MINUTE: {settings.RATE_LIMIT_PER_MINUTE}')
except Exception as e:
    print('!! IMPORT ERROR:', type(e).__name__, str(e))
    traceback.print_exc()
    sys.exit(1)
"@ 2>&1
Pop-Location
$importCheck | ForEach-Object { Log "  $_" }

Log "`n[6/6] Starting backend and hitting /api/weather/current..." "Cyan"
# Start uvicorn in background
Push-Location $backend
$uviJob = Start-Job -ScriptBlock {
    param($backendPath)
    Set-Location $backendPath
    & "$backendPath\venv\Scripts\uvicorn.exe" main:app --host 127.0.0.1 --port 8000 --log-level debug 2>&1
} -ArgumentList $backend

Log "  Waiting 8s for backend to start..." "Gray"
Start-Sleep -Seconds 8

# Hit health first
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/weather/health" -UseBasicParsing -TimeoutSec 5
    Log "  OK  /health returned $($r.StatusCode)" "Green"
    Log "      body: $($r.Content)" "Gray"
} catch {
    Log "  !! /health failed: $($_.Exception.Message)" "Red"
}

# Hit current with Delhi coords
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/weather/current?lat=28.6139&lon=77.2090" -UseBasicParsing -TimeoutSec 10
    Log "  OK  /current returned $($r.StatusCode)" "Green"
    Log "      body (first 400 chars): $($r.Content.Substring(0, [Math]::Min(400, $r.Content.Length)))" "Gray"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Log "  !! /current returned HTTP $status" "Red"
    try {
        $errStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errStream)
        $body = $reader.ReadToEnd()
        Log "      body: $body" "Red"
    } catch {}
}

# Pull backend stdout/stderr
Log "`n=== Backend stdout (last 60 lines) ===" "Cyan"
$output = Receive-Job $uviJob
$output | Select-Object -Last 60 | ForEach-Object { Log "  $_" "Gray" }

Stop-Job $uviJob
Remove-Job $uviJob -Force
Pop-Location

Log "`n=== DONE ===" "Green"
Log "Full log saved to: $logFile" "Green"
Write-Host "`nPress Enter to exit..."
Read-Host | Out-Null
