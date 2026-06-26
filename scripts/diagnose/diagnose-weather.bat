@echo off
REM Double-clickable diagnostic — runs all 6 checks and writes diagnose-weather.log
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0diagnose-weather.ps1"
