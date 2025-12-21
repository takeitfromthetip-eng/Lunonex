@echo off
REM Install ForTheWeebs as Windows Service (runs permanently)

echo ===================================
echo ForTheWeebs Service Installer
echo ===================================
echo.

REM Check for admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges
    echo.
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/3] Installing node-windows package...
call npm install node-windows

echo.
echo [2/3] Installing service...
node daemon.js install

echo.
echo [3/3] Done!
echo.
echo Your server is now running permanently in the background.
echo It will auto-start when Windows boots.
echo.
echo Commands:
echo   node daemon.js stop      - Stop the server
echo   node daemon.js start     - Start the server
echo   node daemon.js restart   - Restart the server
echo   node daemon.js status    - Check if running
echo   node daemon.js uninstall - Remove service
echo.
pause
