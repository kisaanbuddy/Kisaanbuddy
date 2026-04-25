# KrishiAI - remove auto-start task and shortcuts.

$ErrorActionPreference = "Continue"
$taskName = "KrishiAI"

Write-Host ""
Write-Host "Removing KrishiAI auto-start..." -ForegroundColor Cyan

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
    (Join-Path $desktop   "KrishiAI.lnk"),
    (Join-Path $startMenu "Programs\KrishiAI.lnk")
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
