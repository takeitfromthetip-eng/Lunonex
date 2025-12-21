# 🚀 FORTHEWEEBS - Safe Server Startup Script
# This script starts the Vite dev server in a dedicated window
# to prevent terminal interference that was causing crashes.

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "       🎌 ForTheWeebs - Server Startup" -ForegroundColor Cyan  
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes
Write-Host "🧹 Cleaning up old processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start server in dedicated window
Write-Host "🚀 Starting Vite dev server..." -ForegroundColor Green
Write-Host "   Opening dedicated PowerShell window..." -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command", 
    "cd '$PWD'; Clear-Host; Write-Host '🎌 ForTheWeebs Development Server' -ForegroundColor Cyan; Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor DarkGray; Write-Host ''; npm run dev"
) -WindowStyle Normal

# Wait for server to start
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server is running
$proc = Get-Process node -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "🌐 Local:   http://localhost:3002" -ForegroundColor Cyan
    Write-Host "🌐 Network: http://10.2.0.2:3002" -ForegroundColor Cyan  
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "💡 TIP: Keep the server window open!" -ForegroundColor Yellow
    Write-Host "   Closing it will stop the server." -ForegroundColor Gray
    Write-Host ""
    Write-Host "🛑 To stop: Close the server window or press Ctrl+C in it" -ForegroundColor Yellow
} else {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    Write-Host "   Check the server window for errors" -ForegroundColor Gray
}

Write-Host ""
