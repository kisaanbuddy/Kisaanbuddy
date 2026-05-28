@echo off
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Fix GitHub Auth (403 Error)
echo ============================================
echo.
echo Problem: Wrong GitHub account saved in Windows.
echo          Saved: irfandarvan07-del
echo          Needed: adityaoutlier5-dotcom
echo.

echo [Step 1] Removing saved GitHub credentials from Windows...
cmdkey /delete:git:https://github.com 2>nul
cmdkey /delete:https://github.com 2>nul

echo [Step 2] Clearing git credential cache...
git credential reject https://github.com 2>nul
git config --global --unset credential.helper 2>nul

echo [Step 3] Setting credential helper back to manager...
git config --global credential.helper manager

echo [Step 4] Setting correct user in this repo...
git config user.email "utkarsh.sinha.dev@gmail.com"
git config user.name "KrishiAI"

echo [Step 5] Clearing git lock files...
for %%L in (index.lock HEAD.lock MERGE_HEAD.lock) do (
    if exist ".git\%%L" (
        attrib -r -s -h ".git\%%L" 2>nul
        del /f /q ".git\%%L" 2>nul
    )
)

echo.
echo ============================================
echo   NOW PUSHING...
echo ============================================
echo.
echo A browser window OR a login popup will open.
echo LOGIN WITH: adityaoutlier5-dotcom
echo (NOT irfandarvan07-del)
echo.
echo If it asks for password: use a GitHub Personal
echo Access Token (NOT your GitHub password).
echo Get one at: https://github.com/settings/tokens
echo Scopes needed: repo (full control)
echo.
pause

git push

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo   SUCCESS! Push complete.
    echo ============================================
    echo.
    echo Vercel auto-redeploys in ~2-3 minutes.
    echo Then hard-refresh: https://krishiai-steel.vercel.app
) else (
    echo ============================================
    echo   PUSH FAILED - Try manual fix below
    echo ============================================
    echo.
    echo MANUAL FIX OPTIONS:
    echo.
    echo Option A - Use Token in URL ^(most reliable^):
    echo   git remote set-url origin https://YOUR_TOKEN@github.com/adityaoutlier5-dotcom/krishiai.git
    echo   git push
    echo.
    echo Option B - Windows Credential Manager:
    echo   1. Open: Control Panel -^> Credential Manager
    echo   2. Click "Windows Credentials"
    echo   3. Find "git:https://github.com" -^> Delete it
    echo   4. Run this bat file again
    echo.
    echo Option C - GitHub CLI:
    echo   gh auth login
    echo   git push
)
echo.
pause
