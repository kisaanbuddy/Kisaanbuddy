@echo off
cd /d "%~dp0\frontend-next"

echo ============================================
echo   Setting DATA_GOV_API_KEY on Vercel
echo ============================================
echo.

echo Setting environment variable...
echo 579b464db66ec23bdd000001cdd3946e44ce4aad72 | npx vercel env add DATA_GOV_API_KEY production

echo.
echo Done! Now redeploy:
npx vercel --prod

echo.
pause
