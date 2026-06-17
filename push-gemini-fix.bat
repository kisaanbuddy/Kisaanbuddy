@echo off
REM KrishiAI - Push Gemini direct-key routing fix to GitHub
REM Render will auto-redeploy in ~2 min after push.

setlocal
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Gemini API Routing Fix
echo ============================================
echo.

git config user.email "pragatipranu2006@gmail.com"
git config user.name "Pragati"

echo [1/3] Files changed:
git status --short
echo.

echo [2/3] Staging and committing...
git add backend/services/chat/chat_service.py
git commit -m "fix(chat): auto-route Google Gemini direct keys to native endpoint"
echo.

echo [3/3] Pushing to GitHub (Render will auto-deploy)...
git push
echo.

echo ============================================
echo   Done. Render rebuilds in ~2 min.
echo ============================================
echo.
echo What was fixed:
echo   - Gemini API keys starting with "AIza" now route directly to
echo     Google's OpenAI-compatible endpoint instead of OpenRouter.
echo   - Model name auto-corrected to "gemini-2.0-flash".
echo.
echo After Render redeploys, test the chatbot at:
echo   https://kisaanbuddy.com/chatbot
echo.
pause
