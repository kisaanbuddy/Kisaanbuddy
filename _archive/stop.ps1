# KrishiAI — clean shutdown of both servers
# Kills anything listening on ports 8000 / 3000.

$ErrorActionPreference = "Continue"

function Stop-PortOwner($port, $label) {
    $owners = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
              Select-Object -ExpandProperty OwningProcess -Unique
    if (-not $owners) {
        Write-Host "  Port $port ($label) already free" -ForegroundColor Gray
        return
    }
    foreach ($procId in $owners) {
        try {
            $p = Get-Process -Id $procId -ErrorAction Stop
            Write-Host "  Killing $($p.ProcessName) (PID $procId) on port $port ($label)" -ForegroundColor Yellow
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        } catch {}
    }
}

Write-Host "Stopping KrishiAI..." -ForegroundColor Cyan
Stop-PortOwner 8000 "backend"
Stop-PortOwner 3000 "frontend"
Write-Host "Done." -ForegroundColor Green
