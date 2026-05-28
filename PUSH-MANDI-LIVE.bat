@echo off
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - AGMARKNET Live Mandi Push
echo ============================================
echo.

echo [1] Removing git lock...
attrib -r -s -h ".git\index.lock" 2>nul
del /f /q ".git\index.lock" 2>nul

echo [2] Staging files...
git add backend/api/mandi.py

echo [3] Committing...
git commit -m "feat(mandi): connect AGMARKNET real API with mock fallback"

echo [4] Pushing...
git push

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo   PUSHED! One last step for live data:
    echo ============================================
    echo.
    echo Go to Vercel manually:
    echo  1. vercel.com - your krishiai project
    echo  2. Settings - Environment Variables
    echo  3. Add New:
    echo     Name:  DATA_GOV_API_KEY
    echo     Value: [DATA_GOV_API_KEY]
    echo  4. Save and Redeploy
    echo.
    echo OR run SET-VERCEL-ENV.bat if Vercel CLI is installed
) else (
    echo Push failed. Run FIX-GIT-AUTH.bat first.
)
echo.
pause
