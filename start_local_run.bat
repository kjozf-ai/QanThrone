@echo off
chcp 65001 >nul
title QAN Throne - Lokalis Dev
color 0B
cd /d "%~dp0"

echo.
echo  ==========================================
echo   QAN THRONE - Lokalis Dev Szerver
echo  ==========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo  [HIBA] Node.js nem talalhato\! https://nodejs.org
    pause
    exit /b 1
)

if not exist ".env" (
    echo  [HIBA] .env fajl hianyzik\!
    echo  Futtasd elobb: DEPLOY.bat
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  [\!] node_modules hianyzik, telepites...
    call npm install --ignore-scripts
    echo.
)

:: Vite cache torlese (stale adatok elkerulese)
if exist "node_modules\.vite" (
    echo  Vite cache torlese...
    rmdir /s /q "node_modules\.vite" >nul 2>&1
)

echo  [OK] Szerver indul...
echo.
echo  URL: http://localhost:5173
echo  Leallitas: Ctrl+C
echo.

:: Varunk 4 masodpercet hogy a Vite elinduljon, majd megnyitjuk a bongeszt
start /b cmd /c "timeout /t 4 >nul && start http://localhost:5173"

call npm run dev
