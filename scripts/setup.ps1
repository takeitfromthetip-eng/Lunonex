# ForTheWeebs - One-Command Dev Setup
# Windows PowerShell Script

Write-Host "🚀 ForTheWeebs Development Setup" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Run this from project root." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check environment
Write-Host "🔍 Checking environment..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "📝 Creating .env from template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env - Please edit with your credentials" -ForegroundColor Green
    } else {
        Write-Host "❌ No .env.example found" -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Setup complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start development:" -ForegroundColor White
Write-Host "  Backend only:  " -NoNewline
Write-Host "node server.js" -ForegroundColor Yellow
Write-Host "  Frontend only: " -NoNewline
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host "  Both together: " -NoNewline
Write-Host "npm run dev:all" -ForegroundColor Yellow
Write-Host ""
