# KrishiAI — frontend launcher (PowerShell)
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File "C:\Users\Aditya\Downloads\KrishiAI\run-frontend.ps1"
# Or double-click run-frontend.bat.

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend    = Join-Path $projectRoot "frontend-next"

Write-Host "==> KrishiAI frontend" -ForegroundColor Cyan
Write-Host "    project  : $projectRoot"
Write-Host "    frontend : $frontend"

if (-not (Test-Path (Join-Path $frontend "package.json"))) {
    Write-Host "!! package.json not found in $frontend" -ForegroundColor Red
    exit 1
}

Set-Location $frontend

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "==> Installing npm dependencies (first run)..." -ForegroundColor Cyan
    npm install
}

Write-Host "==> Starting Next.js dev server on http://localhost:3000" -ForegroundColor Green
Write-Host "    Open: http://localhost:3000"
Write-Host "    Weather page: http://localhost:3000/weather"
Write-Host "    (Backend should already be running on :8000)"
Write-Host ""

npm run dev
