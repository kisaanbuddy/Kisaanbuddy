# KrishiAI - install auto-start
#   1. Creates a Scheduled Task that runs start.ps1 every time the user logs in.
#   2. Creates a KrishiAI shortcut on the Desktop (and Start Menu).
#
# Run as a normal user (NOT admin). You only need to run this ONCE.

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startPs1    = Join-Path $projectRoot "start.ps1"
$startBat    = Join-Path $projectRoot "start.bat"
$iconPath    = Join-Path $projectRoot "frontend-next\public\favicon.ico"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  KrishiAI - install auto-start" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $startPs1)) {
    Write-Host "ERROR: start.ps1 not found at $startPs1" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ------------------------------------------------------------------
# 1. Scheduled Task - runs start.ps1 at user logon (silent)
# ------------------------------------------------------------------
$taskName = "KrishiAI"

Write-Host "[1/2] Creating Scheduled Task '$taskName'..." -ForegroundColor Cyan

# Remove old task if it exists
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "  Old task found - removing..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Action: run start.ps1 in a HIDDEN window (no flashing CMD at every login)
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$startPs1`"" `
    -WorkingDirectory $projectRoot

# Trigger: at logon of CURRENT user only
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Settings: don't kill on battery, don't stop if idle ends, allow restart
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0)   # 0 = unlimited

# Principal: run as the current user, highest-privileges NOT required
$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Auto-starts KrishiAI backend + frontend at user login." | Out-Null

Write-Host "  OK - will now run on every login" -ForegroundColor Green

# ------------------------------------------------------------------
# 2. Desktop + Start Menu shortcut
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[2/2] Creating Desktop shortcut..." -ForegroundColor Cyan

$desktop   = [Environment]::GetFolderPath("Desktop")
$startMenu = [Environment]::GetFolderPath("StartMenu")
$linkPath1 = Join-Path $desktop   "KrishiAI.lnk"
$linkPath2 = Join-Path $startMenu "Programs\KrishiAI.lnk"

$wsh = New-Object -ComObject WScript.Shell

foreach ($link in @($linkPath1, $linkPath2)) {
    $dir = Split-Path -Parent $link
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $s = $wsh.CreateShortcut($link)
    $s.TargetPath       = $startBat
    $s.WorkingDirectory = $projectRoot
    $s.Description      = "Start KrishiAI (backend + frontend, opens browser)"
    if (Test-Path $iconPath) { $s.IconLocation = $iconPath }
    $s.Save()
    Write-Host "  Created: $link" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Done!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  KrishiAI will now:" -ForegroundColor White
Write-Host "   - Auto-start every time you log into Windows" -ForegroundColor White
Write-Host "   - Be available as 'KrishiAI' shortcut on your Desktop" -ForegroundColor White
Write-Host ""
Write-Host "  To start it RIGHT NOW (without reboot):" -ForegroundColor Yellow
Write-Host "   double-click KrishiAI on your Desktop" -ForegroundColor Yellow
Write-Host ""
Write-Host "  To disable auto-start later:" -ForegroundColor Gray
Write-Host "   double-click uninstall-autostart.bat" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
