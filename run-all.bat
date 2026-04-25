@echo off
REM KrishiAI — one-click launcher
REM Opens backend (FastAPI) and frontend (Next.js) in two separate windows,
REM then opens the site in your browser.

echo.
echo ==========================================
echo   KrishiAI — starting backend + frontend
echo ==========================================
echo.

REM --- Backend in its own window ---
start "KrishiAI Backend" cmd /k "cd /d %~dp0 && powershell -NoProfile -ExecutionPolicy Bypass -File run-backend.ps1"

REM --- Give backend a few seconds to boot before frontend/browser ---
echo Waiting 6 seconds for backend to boot...
timeout /t 6 /nobreak >nul

REM --- Frontend in its own window ---
start "KrishiAI Frontend" cmd /k "cd /d %~dp0 && powershell -NoProfile -ExecutionPolicy Bypass -File run-frontend.ps1"

REM --- Give frontend a few seconds, then open browser ---
echo Waiting 8 seconds for frontend to compile...
timeout /t 8 /nobreak >nul

echo.
echo Opening http://localhost:3000 ...
start "" "http://localhost:3000"

echo.
echo Both servers running in separate windows.
echo   Backend  : http://localhost:8000/docs
echo   Frontend : http://localhost:3000
echo   Weather  : http://localhost:3000/weather
echo.
echo Close this window whenever — the two server windows will keep running.
echo To stop the servers, just close their windows.
echo.
pause
