@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
title QAN Throne - Lokalis Dev
color 0B
cd /d "%~dp0"

echo.
echo  ==========================================
echo   QAN THRONE - Lokalis Dev Szerver
echo  ==========================================
echo.

:: Node.js keresese
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set "NODE_EXE="
    if exist "C:\Program Files\nodejs\node.exe"        set "NODE_EXE=C:\Program Files\nodejs"
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs"
    if defined NODE_EXE (
        set "PATH=%PATH%;!NODE_EXE!"
    ) else (
        echo  [HIBA] Node.js nem talalhato! https://nodejs.org
        pause & exit /b 1
    )
)

if not exist ".env" (
    echo  [HIBA] .env fajl hianyzik - futtasd elobb a DEPLOY.bat-ot!
    pause & exit /b 1
)

if not exist "node_modules" (
    echo  [!] node_modules hianyzik, telepites...
    call npm install
    echo.
)

echo  [OK] Dev szerver indul: http://localhost:5173
echo  Leallitas: Ctrl+C
echo.
start "" "http://localhost:5173"
call npm run dev
