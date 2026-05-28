@echo off
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Mandi Next.js API Push
echo ============================================

echo [1] Removing git lock...
attrib -r -s -h ".git\index.lock" 2>nul
del /f /q ".git\index.lock" 2>nul

echo [2] Staging...
git add frontend-next/src/app/api/mandi/
git add frontend-next/package.json
git add frontend-next/src/app/layout.tsx

echo [3] Committing...
git commit -m "feat(mandi): Next.js API route for AGMARKNET - works on Vercel"

echo [4] Pushing...
git push

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo   DONE! After Vercel deploys (~2 min):
    echo   Test: https://krishiai-steel.vercel.app/api/mandi/health
    echo ============================================
) else (
    echo Push failed. Run FIX-GIT-AUTH.bat first.
)
pause
