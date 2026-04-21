@echo off
chcp 65001 >nul
title QAN Throne - Vercel Deploy
color 0B
cd /d "%~dp0"

echo.
echo  ==========================================
echo   QAN Throne - Vercel Ujratelepites
echo  ==========================================
echo.

:: Ellenorzes: van-e addresses.json
if not exist "client\src\lib\addresses.json" (
    echo  [HIBA] addresses.json hianyzik!
    echo  Elobb futtasd: DEPLOY.bat
    pause
    exit /b 1
)

:: Ellenorzes: van-e kontraktus cim
findstr /C:"0x" "client\src\lib\addresses.json" >nul 2>&1
if errorlevel 1 (
    echo  [HIBA] A kontraktus meg nincs deployolva!
    echo  Elobb futtasd: DEPLOY.bat
    pause
    exit /b 1
)

:: Build
echo  [1/2] Frontend build...
call npm run build
if errorlevel 1 (
    echo  [HIBA] Build sikertelen!
    pause
    exit /b 1
)
echo  [OK] Build kesz.
echo.

:: Vercel deploy
echo  [2/2] Vercel deploy...
where vercel >nul 2>&1
if errorlevel 1 (
    echo  Vercel CLI telepitese...
    call npm install -g vercel
)

call vercel --prod
if errorlevel 1 (
    echo  [HIBA] Vercel deploy sikertelen!
    pause
    exit /b 1
)

echo.
echo  ==========================================
echo   VERCEL DEPLOY SIKERES!
echo  ==========================================
echo.
pause
