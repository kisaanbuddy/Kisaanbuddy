# KrishiAI - all-in-one launcher (PowerShell)
#   1. Kills any stale process on ports 8000 / 3000
#   2. Starts backend with a log file
#   3. Polls /health until backend is live
#   4. If backend dies, shows the log so user can see why
#   5. Starts frontend
#   6. Opens browser

$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend     = Join-Path $projectRoot "backend"
$frontend    = Join-Path $projectRoot "frontend-next"
$backendLog  = Join-Path $projectRoot "backend.log"
$frontendLog = Join-Path $projectRoot "frontend.log"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  KrishiAI - one-click launcher" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

function Stop-PortOwner {
    param([int]$port)
    $owners = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
              Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $owners) {
        try {
            $p = Get-Process -Id $procId -ErrorAction Stop
            Write-Host "  Killing $($p.ProcessName) (PID $procId) on port $port" -ForegroundColor Yellow
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        } catch {}
    }
}

Write-Host "[1/5] Clearing stale processes on ports 8000 and 3000..." -ForegroundColor Cyan
Stop-PortOwner -port 8000
Stop-PortOwner -port 3000
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "[2/5] Checking backend venv..." -ForegroundColor Cyan
$venvPy = Join-Path $backend "venv\Scripts\python.exe"
$uvicorn = Join-Path $backend "venv\Scripts\uvicorn.exe"
if (-not (Test-Path $venvPy)) {
    Write-Host "  venv missing - creating..." -ForegroundColor Yellow
    Push-Location $backend
    python -m venv venv
    & $venvPy -m pip install --quiet --disable-pip-version-check -r requirements.txt
    Pop-Location
}
if (-not (Test-Path $uvicorn)) {
    Write-Host "  Installing deps..." -ForegroundColor Yellow
    & $venvPy -m pip install --quiet --disable-pip-version-check -r (Join-Path $backend "requirements.txt")
}
Write-Host "  OK" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Starting backend on http://localhost:8000..." -ForegroundColor Cyan
if (Test-Path $backendLog) { Remove-Item $backendLog -Force }

$backendProc = Start-Process -FilePath $uvicorn `
    -ArgumentList "main:app","--host","127.0.0.1","--port","8000" `
    -WorkingDirectory $backend `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError "$backendLog.err" `
    -WindowStyle Hidden `
    -PassThru

$healthy = $false
for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $healthy = $true; break }
    } catch {}
    Write-Host "  waiting... ($($i+1)s)" -ForegroundColor Gray
}

if (-not $healthy) {
    Write-Host ""
    Write-Host "  !! Backend failed to start within 25s" -ForegroundColor Red
    Write-Host "  Showing last 60 lines of backend.log:" -ForegroundColor Yellow
    Write-Host ""
    if (Test-Path $backendLog)       { Get-Content $backendLog       | Select-Object -Last 60 }
    if (Test-Path "$backendLog.err") { Get-Content "$backendLog.err" | Select-Object -Last 60 }
    Write-Host ""
    Write-Host "  Full log saved at: $backendLog" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  Backend is LIVE" -ForegroundColor Green

try {
    $h = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/weather/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "  Weather health: $($h.Content)" -ForegroundColor Gray
} catch {}

Write-Host ""
Write-Host "[4/5] Starting frontend on http://localhost:3000..." -ForegroundColor Cyan
if (Test-Path $frontendLog) { Remove-Item $frontendLog -Force }

$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (-not $npmCmd) { $npmCmd = "npm" }

$frontendProc = Start-Process -FilePath $npmCmd `
    -ArgumentList "run","dev" `
    -WorkingDirectory $frontend `
    -RedirectStandardOutput $frontendLog `
    -RedirectStandardError "$frontendLog.err" `
    -WindowStyle Hidden `
    -PassThru

$frontendUp = $false
for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $frontendUp = $true; break }
    } catch {}
    if (($i % 5) -eq 4) {
        Write-Host "  compiling... ($($i+1)s)" -ForegroundColor Gray
    }
}
if (-not $frontendUp) {
    Write-Host ""
    Write-Host "  !! Frontend not ready after 40s - may still be compiling" -ForegroundColor Yellow
    Write-Host "  Check: $frontendLog" -ForegroundColor Yellow
} else {
    Write-Host "  Frontend is LIVE" -ForegroundColor Green
}

Write-Host ""
Write-Host "[5/5] Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  KrishiAI is running!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend : http://localhost:3000"          -ForegroundColor White
Write-Host "  Weather  : http://localhost:3000/weather"  -ForegroundColor White
Write-Host "  Backend  : http://localhost:8000/docs"     -ForegroundColor White
Write-Host ""
Write-Host "  Backend PID  : $($backendProc.Id)"
Write-Host "  Frontend PID : $($frontendProc.Id)"
Write-Host ""
Write-Host "  Backend log  : $backendLog"  -ForegroundColor Gray
Write-Host "  Frontend log : $frontendLog" -ForegroundColor Gray
Write-Host ""
Write-Host "  TO STOP : close this window or run stop.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C or close this window to stop both servers." -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 5
        if (-not (Get-Process -Id $backendProc.Id -ErrorAction SilentlyContinue)) {
            Write-Host ""
            Write-Host "!! Backend process died - check $backendLog" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped." -ForegroundColor Green
    Write-Host ""
}
