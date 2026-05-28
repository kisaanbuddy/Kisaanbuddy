@echo off
REM KrishiAI - Push mobile responsive nav fix to GitHub
REM Vercel will auto-deploy in ~2 min after push.

setlocal
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Mobile Nav Fix Deploy
echo ============================================
echo.

REM Ensure git identity is set for this repo
git config user.email "pragatipranu2006@gmail.com"
git config user.name "Pragati"

echo [1/3] Files changed:
git status --short
echo.

echo [2/3] Staging and committing...
git add frontend-next/src/components/Header.tsx frontend-next/src/app/layout.tsx
git commit -m "fix: add mobile responsive hamburger menu for navigation"
echo.

echo [3/3] Pushing to GitHub (Vercel will auto-deploy)...
git push
echo.

echo ============================================
echo   Done. Check Vercel dashboard for deploy.
echo ============================================
echo.
echo Vercel will rebuild in ~2 minutes.
echo Then open https://krishiai-steel.vercel.app on your phone.
echo You will see a hamburger menu (3 lines) on the top-right.
echo Tap it - all navigation links will appear.
echo.
pause
