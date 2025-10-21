@echo off
title Lumen Browser
echo.
echo ========================================
echo   Lumen Browser - Portable Edition
echo ========================================
echo.
echo Starting Lumen Browser...
echo.

REM Get the full path to index.html
set "INDEX_PATH=%~dp0index.html"

REM Try Chrome first
where chrome.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Google Chrome
    start "" chrome.exe --app="file:///%INDEX_PATH%" --window-size=1400,900 --disable-web-security --allow-file-access-from-files --user-data-dir="%~dp0.profile"
    goto :end
)

REM Try Edge
where msedge.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Microsoft Edge
    start "" msedge.exe --app="file:///%INDEX_PATH%" --window-size=1400,900 --disable-web-security --allow-file-access-from-files --user-data-dir="%~dp0.profile"
    goto :end
)

REM Try Brave
where brave.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Brave Browser
    start "" brave.exe --app="file:///%INDEX_PATH%" --window-size=1400,900 --disable-web-security --allow-file-access-from-files --user-data-dir="%~dp0.profile"
    goto :end
)

REM Try default browser
echo Opening in default browser...
start "" "%INDEX_PATH%"

:end
echo.
echo Lumen Browser is now running!
echo You can close this window.
timeout /t 3 >nul
