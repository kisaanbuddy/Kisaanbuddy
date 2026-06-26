# KisaanBuddy — backend launcher (PowerShell)
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File "C:\Users\Aditya\Downloads\KisaanBuddy\run-backend.ps1"
# Or double-click run-backend.bat (which just wraps this).

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
$backend     = Join-Path $projectRoot "backend"
$venvPy      = Join-Path $backend "venv\Scripts\python.exe"
$reqs        = Join-Path $backend "requirements.txt"

Write-Host "==> KisaanBuddy backend" -ForegroundColor Cyan
Write-Host "    project : $projectRoot"
Write-Host "    backend : $backend"

if (-not (Test-Path $venvPy)) {
    Write-Host "!! venv not found at $venvPy" -ForegroundColor Yellow
    Write-Host "   Creating a fresh venv..." -ForegroundColor Yellow
    Push-Location $backend
    python -m venv venv
    Pop-Location
}

Set-Location $backend

# Activate venv for the rest of the commands
& "$backend\venv\Scripts\Activate.ps1"

# Install / refresh deps (idempotent, fast if already installed)
Write-Host "==> Installing/updating dependencies..." -ForegroundColor Cyan
& "$backend\venv\Scripts\python.exe" -m pip install --quiet --disable-pip-version-check -r $reqs

Write-Host "==> Starting uvicorn on http://localhost:8000" -ForegroundColor Green
Write-Host "    Swagger docs : http://localhost:8000/docs"
Write-Host "    Weather test : http://localhost:8000/api/weather/current?q=Delhi"
Write-Host ""

& "$backend\venv\Scripts\uvicorn.exe" main:app --reload --host 0.0.0.0 --port 8000
