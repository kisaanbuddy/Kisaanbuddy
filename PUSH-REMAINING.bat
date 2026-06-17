@echo off
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Push Remaining Changes
echo ============================================
echo.

echo [1] Removing git lock...
attrib -r -s -h ".git\index.lock" 2>nul
del /f /q ".git\index.lock" 2>nul
attrib -r -s -h ".git\HEAD.lock" 2>nul
del /f /q ".git\HEAD.lock" 2>nul

echo [2] Staging files...
git add frontend-next/next-env.d.ts
git add frontend-next/src/app/chatbot/page.tsx
git add hardware/krishiai_sensor_node/krishiai_sensor_node.ino
git add KRISHIAI_MASTER_PROMPT.md
git add FIX-GIT-AUTH.bat
git add PUSH-UI-UPGRADE.bat
git add PUSH-NOW.bat
git add SHOPPING_LIST.md
git add push-gemini-fix.bat
git add push-mobile-fix.bat

echo [3] Committing...
git commit -m "chore: add master prompt, bat scripts, sensor firmware update, chatbot fix"

echo [4] Pushing to GitHub...
git push

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo   SUCCESS! All changes pushed.
    echo ============================================
    echo   Vercel auto-deploys in ~2-3 minutes.
    echo   https://kisaanbuddy.com
) else (
    echo Push failed. Try running FIX-GIT-AUTH.bat first.
)
echo.
pause
