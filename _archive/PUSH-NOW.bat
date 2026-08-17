@echo off
REM Adds YouTube video integration to Government Schemes cards.
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Schemes YouTube Integration
echo ============================================
echo.

echo Clearing stuck git locks...
for %%L in (index.lock HEAD.lock MERGE_HEAD.lock) do (
    if exist ".git\%%L" (
        attrib -r -s -h ".git\%%L" 2>nul
        del /f /q ".git\%%L" 2>nul
    )
)
taskkill /F /IM git.exe 2>nul
taskkill /F /IM git-credential-manager.exe 2>nul
taskkill /F /IM git-credential-manager-core.exe 2>nul
timeout /t 1 /nobreak >nul
for %%L in (index.lock HEAD.lock MERGE_HEAD.lock) do (
    if exist ".git\%%L" del /f /q ".git\%%L" 2>nul
)
echo.

git config user.email "pragatipranu2006@gmail.com"
git config user.name "Pragati"

echo [1/3] Files changed:
git status --short
echo.

echo [2/3] Staging and committing...
git add backend/api/schemes.py
git add frontend-next/src/components/SchemeVideo.tsx
git add frontend-next/src/app/schemes/page.tsx
git add frontend-next/src/app/founders/page.tsx
git commit -m "feat(schemes): embed YouTube tutorial per scheme; lazy-loaded responsive iframe"
echo.

echo [3/3] Pushing to GitHub...
git push
echo.

echo ============================================
echo   Done!
echo ============================================
echo.
echo Render + Vercel auto-redeploy in ~2-3 min.
echo Then HARD-REFRESH (Ctrl+F5) and visit:
echo   https://kisaanbuddy.com/schemes
echo.
echo Each scheme card now shows an embedded video below the description.
echo To replace a video, edit "youtubeLink" in backend/api/schemes.py.
echo.
pause
