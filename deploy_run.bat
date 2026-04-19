@echo off
chcp 65001 >nul
title QAN Throne - Deploy
color 0E
cd /d "%~dp0"

echo.
echo  ==========================================
echo   QAN THRONE - Auto Deploy
echo   King of the Hill  -  QAN TestNet
echo  ==========================================
echo.

:: Hardhat telemetry kikapcsolasa (interaktiv kerdes elkerulese)
set "DO_NOT_TRACK=1"
set "HARDHAT_DISABLE_TELEMETRY=true"

:: === 1. Node.js ===
echo  [1/6] Node.js keresese...

where node >nul 2>&1
if errorlevel 1 (
    echo  [HIBA] Node.js nem talalhato\!
    echo  Telepitsd: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODEVER=%%v
echo  [OK] Node.js: %NODEVER%

:: === 2. Privat kulcs ===
echo.
echo  [2/6] Privat kulcs keresese...
set PRIVKEY=

if exist "%~dp0privkey" (
    set /p PRIVKEY=<"%~dp0privkey"
    echo  [OK] Talalat: qan-throne\privkey
    goto strip_key
)
if exist "%~dp0..\QAN-TESTNET\polyglot-jukebox\privkey" (
    set /p PRIVKEY=<"%~dp0..\QAN-TESTNET\polyglot-jukebox\privkey"
    echo  [OK] Talalat: polyglot-jukebox\privkey
    goto strip_key
)
if exist "%~dp0..\QAN-TESTNET\qvm-szabalymotor\privkey" (
    set /p PRIVKEY=<"%~dp0..\QAN-TESTNET\qvm-szabalymotor\privkey"
    echo  [OK] Talalat: qvm-szabalymotor\privkey
    goto strip_key
)
if exist "%~dp0..\QAN-TESTNET\qvm_demo_download\qvm_demo_download\privkey" (
    set /p PRIVKEY=<"%~dp0..\QAN-TESTNET\qvm_demo_download\qvm_demo_download\privkey"
    echo  [OK] Talalat: qvm_demo_download\privkey
    goto strip_key
)

echo  [\!] Privkey nem talalhato, add meg kezzel:
echo  (MetaMask: Account Details - Export Private Key, 0x NELKUL)
echo.
set /p PRIVKEY="  Kulcs: "

:strip_key
if /i "%PRIVKEY:~0,2%"=="0x" set PRIVKEY=%PRIVKEY:~2%
echo  [OK] Kulcs beolvasva.

:: === 3. .env fajl ===
echo.
echo  [3/6] .env fajl letrehozasa...
(
    echo QAN_RPC_URL=https://rpc-testnet.qanplatform.com
    echo QAN_CHAIN_ID=1121
    echo QAN_EXPLORER=https://testnet.qanscan.com
    echo ADMIN_PRIVATE_KEY=%PRIVKEY%
    echo PORT=3000
) > "%~dp0.env"
echo  [OK] .env letrehozva.

:: === 4. npm install ===
echo.
echo  [4/6] npm install (1-3 perc elso futasnal)...
echo.
call npm install --ignore-scripts
if errorlevel 1 (
    echo  [HIBA] npm install sikertelen\!
    pause
    exit /b 1
)
echo.
echo  [OK] Csomagok telepitve.

:: Hardhat compile kulon (telemetry kihagyva)
echo.
echo  Kontraktus forditasa...
call npx hardhat compile
if errorlevel 1 (
    echo  [FIGYELMEZETES] Forditas sikertelen, folytatom...
)
echo.

:: === 5. Contract deploy ===
echo.
echo  [5/6] QanThrone deploy a QAN TestNetre...
echo  (30-90 masodpercig tarthat)
echo.
call npx hardhat run scripts/deploy.js --network qanTestnet
if errorlevel 1 (
    echo.
    echo  [HIBA] Deploy sikertelen\!
    echo.
    echo  Lehetseges okok:
    echo   1. Nulla QANX egyenleg
    echo      Faucet: https://faucet.qanplatform.com
    echo   2. Internet / RPC problema
    echo   3. Helytelen privat kulcs
    echo.
    pause
    exit /b 1
)
echo  [OK] Kontraktus deployolva\!

:: === 6. Frontend build ===
echo.
echo  [6/6] Frontend build...
echo.
call npm run build
if errorlevel 1 (
    echo  [FIGYELMEZETES] Build sikertelen, futasd kezzel: npm run build
) else (
    echo  [OK] Build kesz\!
)

:: === Osszegzes ===
echo.
echo  ==========================================
echo   DEPLOY SIKERES\!
echo  ==========================================
echo.
echo   Lokalis teszt:    START_LOCAL.bat
echo   Vercel hosting:   vercel.com (ingyenes)
echo   Explorer:         https://testnet.qanscan.com
echo.
echo  ==========================================
echo.

if exist "%~dp0client\src\lib\addresses.json" (
    echo  Kontraktus cim:
    findstr "throne" "%~dp0client\src\lib\addresses.json"
    echo.
)

echo  Nyomj egy billentyut a bezarashoz...
pause >nul
