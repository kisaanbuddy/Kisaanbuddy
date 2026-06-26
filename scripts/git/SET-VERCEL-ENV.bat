@echo off
cd /d "%~dp0\frontend-next"

echo ============================================
echo   Setting DATA_GOV_API_KEY on Vercel
echo ============================================
echo.

set /p DATA_GOV_KEY="Enter your DATA_GOV_API_KEY: "
if "%DATA_GOV_KEY%"=="" (
    echo [ERROR] No key entered. Exiting.
    pause
    exit /b 1
)

echo Setting environment variable...
echo %DATA_GOV_KEY% | npx vercel env add DATA_GOV_API_KEY production

echo.
echo Done! Now redeploy:
npx vercel --prod

echo.
pause
