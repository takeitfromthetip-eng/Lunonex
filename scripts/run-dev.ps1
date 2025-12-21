# ForTheWeebs - One-Command Dev Runner
# Windows PowerShell Script

Write-Host "🚀 Starting ForTheWeebs Development Environment" -ForegroundColor Cyan
Write-Host ""

# Set environment
$env:PORT = "3002"
$env:NODE_ENV = "development"

Write-Host "📍 Backend Port: 3002" -ForegroundColor Yellow
Write-Host "📍 Frontend Port: 3003 (default)" -ForegroundColor Yellow
Write-Host ""

# Check if server is already running on port 3002
$process = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "⚠️  Port 3002 already in use!" -ForegroundColor Yellow
    Write-Host "Would you like to kill the existing process? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-Process -Id $process.OwningProcess -Force
        Start-Sleep -Seconds 2
        Write-Host "✅ Cleared port 3002" -ForegroundColor Green
    } else {
        Write-Host "❌ Exiting - port conflict" -ForegroundColor Red
        exit 1
    }
}

# Start backend and frontend concurrently
Write-Host "🎬 Starting backend and frontend..." -ForegroundColor Cyan
Write-Host ""

npm run dev:all
