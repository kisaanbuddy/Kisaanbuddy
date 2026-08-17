@echo off
REM Double-clickable wrapper for start.ps1
REM Keeps the window open so you can see backend/frontend status + logs.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
pause
