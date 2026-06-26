# KisaanBuddy - remove auto-start task and shortcuts.

$ErrorActionPreference = "Continue"
$taskName = "KisaanBuddy"

Write-Host ""
Write-Host "Removing KisaanBuddy auto-start..." -ForegroundColor Cyan

# Scheduled task
$t = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($t) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "  Scheduled task removed" -ForegroundColor Green
} else {
    Write-Host "  No scheduled task found" -ForegroundColor Gray
}

# Shortcuts
$desktop   = [Environment]::GetFolderPath("Desktop")
$startMenu = [Environment]::GetFolderPath("StartMenu")
foreach ($link in @(
    (Join-Path $desktop   "KisaanBuddy.lnk"),
    (Join-Path $startMenu "Programs\KisaanBuddy.lnk")
)) {
    if (Test-Path $link) {
        Remove-Item $link -Force
        Write-Host "  Removed shortcut: $link" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
