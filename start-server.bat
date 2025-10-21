@echo off
title Lumen Browser - Starting Server
echo.
echo ========================================
echo   Lumen Browser - Portable Edition
echo ========================================
echo.
echo Starting local web server...
echo.

REM Check if Node.js is installed
where node.exe >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    echo Or use run-dev.bat instead
    pause
    exit /b 1
)

REM Start a simple HTTP server
echo Server starting at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
npx --yes http-server -p 3000 -o index.html -c-1 --cors

pause
