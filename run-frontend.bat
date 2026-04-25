@echo off
REM Double-clickable wrapper for run-frontend.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-frontend.ps1"
pause
