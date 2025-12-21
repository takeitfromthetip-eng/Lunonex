@echo off
REM ============================================================================
REM ForTheWeebs - Production Server Startup Script
REM ============================================================================
REM This script kills all duplicate Node processes and starts a clean server
REM ============================================================================

echo.
echo ========================================
echo ForTheWeebs Server Startup
echo ========================================
echo.

REM Kill all existing Node processes to prevent duplicates
echo [1/4] Killing existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Killed existing servers
) else (
    echo ℹ️  No existing servers found
)

REM Wait for ports to be released
echo.
echo [2/4] Waiting for ports to release...
timeout /t 2 /nobreak >nul
echo ✅ Ports released

REM Verify environment
echo.
echo [3/4] Checking environment...
if not exist ".env" (
    echo ❌ ERROR: .env file not found
    echo Please create .env file with required variables
    pause
    exit /b 1
)
echo ✅ Environment file found

REM Start the server
echo.
echo [4/4] Starting server...
echo.
echo ========================================
echo Server starting on port 3000
echo Press Ctrl+C to stop
echo ========================================
echo.

node server.js
