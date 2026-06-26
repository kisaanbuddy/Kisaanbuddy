@echo off
cd /d "%~dp0"

echo ============================================
echo   KisaanBuddy - Fix Build Error + Push
echo ============================================
echo.

echo [1] Removing git lock...
attrib -r -s -h ".git\index.lock" 2>nul
del /f /q ".git\index.lock" 2>nul

echo [2] Staging translations fix...
git add frontend-next/src/lib/translations.ts

echo [3] Committing...
git commit -m "fix: add missing translations.ts to fix Vercel build failure"

echo [4] Pushing...
git push

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo   DONE! Vercel will redeploy in ~2-3 min
    echo   https://kisaanbuddy.com
    echo ============================================
) else (
    echo Push failed. Check if you are logged in.
    echo Run FIX-GIT-AUTH.bat if needed.
)
echo.
pause
