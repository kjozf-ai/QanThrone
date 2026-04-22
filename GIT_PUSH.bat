@echo off
chcp 65001 >nul
title QAN Throne - GitHub Push
color 0A
cd /d "%~dp0"

echo.
echo  ==========================================
echo   QAN Throne - GitHub Push + Vercel Deploy
echo  ==========================================
echo.

:: Git ellenorzese
where git >nul 2>&1
if errorlevel 1 (
    echo  [HIBA] Git nem talalhato!
    echo  Telepitsd: https://git-scm.com
    pause
    exit /b 1
)

:: Git repo ellenorzese
git status >nul 2>&1
if errorlevel 1 (
    echo  [HIBA] Nem git repository!
    echo  Futtasd elobb: git init es github-on add remote
    pause
    exit /b 1
)

:: Valtozasok mutatasa
echo  Modositott fajlok:
git status --short
echo.

:: Fontos fajlok hozzaadasa
echo  [1/3] Fajlok hozzaadasa...
git add client/src/lib/addresses.json
git add client/src/hooks/useThrone.ts
git add client/src/components/
git add client/src/lib/
git add client/src/pages/
git add client/src/App.tsx
git add vite.config.ts
git add vercel.json
echo  [OK] Fajlok hozzaadva.
echo.

:: Commit uzenet
echo  [2/3] Commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set DATUM=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%
git commit -m "update: QanThrone frontend %DATUM%"
if errorlevel 1 (
    echo  [INFO] Nincs uj valtozas vagy mar commitolva van.
)
echo.

:: Push
echo  [3/3] Push GitHubra...
git push
if errorlevel 1 (
    echo.
    echo  [HIBA] Push sikertelen!
    echo  Lehetseges ok: nincs remote beallitva
    echo  Futtasd: git remote add origin ^<github_url^>
    pause
    exit /b 1
)

echo.
echo  ==========================================
echo   PUSH SIKERES!
echo   Vercel automatikusan ujra-deployal.
echo   Ellenorizd: https://vercel.com/dashboard
echo  ==========================================
echo.
pause
