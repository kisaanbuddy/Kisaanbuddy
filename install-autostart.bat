@echo off
REM One-click installer: auto-start at Windows logon + desktop shortcut.
REM You only need to run this ONCE.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-autostart.ps1"
pause
