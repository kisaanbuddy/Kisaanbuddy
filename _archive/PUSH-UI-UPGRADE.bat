@echo off
cd /d "%~dp0"

echo ============================================
echo   KrishiAI - Premium UI + IoT Push
echo ============================================
echo.

echo Clearing stuck git locks...
for %%L in (index.lock HEAD.lock MERGE_HEAD.lock ORIG_HEAD.lock) do (
    if exist ".git\%%L" (
        attrib -r -s -h ".git\%%L" 2>nul
        del /f /q ".git\%%L" 2>nul
    )
)
taskkill /F /IM git.exe 2>nul
timeout /t 2 /nobreak >nul
for %%L in (index.lock HEAD.lock MERGE_HEAD.lock) do (
    if exist ".git\%%L" del /f /q ".git\%%L" 2>nul
)
echo   Locks cleared.
echo.

git config user.email "utkarsh.sinha.dev@gmail.com"
git config user.name "KrishiAI"

echo [1/3] Staging all UI changes...
git add frontend-next/src/app/globals.css
git add frontend-next/src/app/layout.tsx
git add frontend-next/src/app/page.tsx
git add frontend-next/src/app/dashboard/page.tsx
git add frontend-next/src/app/disease/page.tsx
git add frontend-next/src/app/crop-predictor/page.tsx
git add frontend-next/src/components/Header.tsx
git add frontend-next/src/components/ui/card.tsx
git add frontend-next/src/components/SensorAutoFill.tsx
git add frontend-next/src/lib/i18n.tsx
git add backend/api/sensor.py
git add backend/main.py
git add HARDWARE_SETUP.md
git add hardware/
echo.

echo Files staged:
git status --short
echo.

echo [2/3] Committing...
git commit -m "feat: Premium UI upgrade + ESP32 IoT sensor integration

UI Changes:
- globals.css: full design system with animations, glassmorphism, gradient utilities
- Header: icons on every nav link, active pill, user avatar with initials, scroll-shrink
- Dashboard: personalized greeting, 4 quick-stat cards (temp/humidity/soil/wind),
  feature shortcut grid, ESP32 live sensor tiles, smart alerts
- Landing page: dark hero + grid overlay, animated counters, testimonials, CTA card
- Disease Detection: drag-and-drop upload zone, animated diagnosis loader, premium layout
- Card components: refined glassmorphism, better hover lift transitions
- Layout: dark default theme, full SEO metadata, viewport meta

IoT Integration:
- backend/api/sensor.py: POST /ingest (ESP32 pushes) + GET /latest + GET /health
- SensorAutoFill component: Read live ESP32 data -> auto-fill crop predictor sliders
- hardware/krishiai_sensor_node.ino: complete Arduino firmware for ESP32 + DHT22 + capacitive sensor"

echo.

echo [3/3] Pushing to GitHub...
git push
echo.

echo ============================================
echo   DONE!
echo ============================================
echo.
echo Vercel auto-redeploys in ~2-3 minutes.
echo Then hard-refresh (Ctrl+F5) on:
echo   https://kisaanbuddy.com/dashboard
echo.
echo What's new:
echo   - Dark premium hero on homepage
echo   - Personalized greeting on dashboard
echo   - Live sensor stats (temperature, humidity, soil)
echo   - Icons + active pills in navigation
echo   - Drag-and-drop disease photo upload
echo   - Animated number counters on landing page
echo.
pause
