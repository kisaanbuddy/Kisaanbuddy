@echo off
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Fix Build + Analytics Push
echo ============================================
echo.

echo [1] Removing git lock...
attrib -r -s -h ".git\index.lock" 2>nul
del /f /q ".git\index.lock" 2>nul

echo [2] Installing Vercel Analytics...
cd frontend-next
call npm i @vercel/analytics
cd ..

echo [3] Staging changes...
git add frontend-next/src/lib/translations.ts
git add frontend-next/src/app/layout.tsx
git add frontend-next/package.json
git add frontend-next/package-lock.json

echo [4] Committing...
git commit -m "fix: add translations.ts + Vercel Analytics integration"

echo [5] Pushing to GitHub...
git push

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo   SUCCESS! Vercel redeploys in ~2-3 min
    echo   https://kisaanbuddy.com
    echo ============================================
) else (
    echo Push failed. Run FIX-GIT-AUTH.bat first.
)
echo.
pause
