@echo off
REM KrishiAI deployment prep — runs git init, add, commit locally.
REM After this finishes, follow the on-screen instructions to push to GitHub.

setlocal
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Deployment Prep
echo ============================================
echo.

REM Check git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] git is not installed or not in PATH.
    echo Install from https://git-scm.com/download/win and re-run this script.
    pause
    exit /b 1
)

echo [1/5] Checking for existing git repo...
if exist .git (
    echo   .git folder exists - reusing it
) else (
    echo   Initialising new git repo...
    git init
    git branch -M main
)
echo.

echo [2/5] Configuring git identity for this repo...
git config user.email "pragatipranu2006@gmail.com"
git config user.name "Pragati"
echo   identity set: Pragati ^<pragatipranu2006@gmail.com^>
echo.

echo [3/5] Sanity check - these files should NOT be in the commit:
echo.
git status --short | findstr /R "\.env$" >nul && (
    echo   [WARN] .env file detected in staging - .gitignore may be missing
) || (
    echo   .env files: ignored OK
)
git status --short | findstr "venv/" >nul && (
    echo   [WARN] venv/ detected in staging - .gitignore may be missing
) || (
    echo   venv: ignored OK
)
git status --short | findstr "node_modules/" >nul && (
    echo   [WARN] node_modules detected - .gitignore may be missing
) || (
    echo   node_modules: ignored OK
)
echo.

echo [4/5] Staging all tracked files...
git add .
echo   files staged:
git diff --cached --name-only | find /c /v "" > "%TEMP%\krishi_count.txt"
set /p FILECOUNT=<"%TEMP%\krishi_count.txt"
del "%TEMP%\krishi_count.txt"
echo   %FILECOUNT% files
echo.

echo [5/5] Creating initial commit...
git commit -m "KrishiAI: initial deployment-ready commit (Vercel + Render)" 2>&1
echo.

echo ============================================
echo   Local git setup DONE
echo ============================================
echo.
echo NEXT STEPS:
echo.
echo 1. Open https://github.com/new in your browser
echo 2. Create a new repo named: krishiai
echo    - Owner: your GitHub username
echo    - Public or Private (your choice)
echo    - DO NOT add README, .gitignore, or license (we have them)
echo 3. After creating, GitHub will show you a URL like:
echo      https://github.com/YOUR_USERNAME/krishiai.git
echo.
echo 4. Come back here and paste that URL when asked, then run:
echo      git remote add origin https://github.com/YOUR_USERNAME/krishiai.git
echo      git push -u origin main
echo.
echo 5. If git asks for password: use a GitHub Personal Access Token
echo    Create one at: https://github.com/settings/tokens
echo    Give it 'repo' scope, copy the token, paste as password.
echo.
pause
