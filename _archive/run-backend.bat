@echo off
REM Double-clickable wrapper for run-backend.ps1 (bypasses PS execution policy)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-backend.ps1"
pause
