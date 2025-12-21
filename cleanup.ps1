# ForTheWeebs Cleanup Ritual
# Fixes EPERM errors + esbuild version mismatches
# Usage: .\cleanup.ps1 or just "cleanup" if aliased

Write-Host "🔥 Starting ForTheWeebs Cleanup Ritual..." -ForegroundColor Cyan

# Step 1: Force remove node_modules
Write-Host "🗑️  Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found" -ForegroundColor Yellow
}

# Step 2: Remove lockfile
Write-Host "🗑️  Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force
    Write-Host "✅ package-lock.json removed" -ForegroundColor Green
} else {
    Write-Host "⚠️  package-lock.json not found" -ForegroundColor Yellow
}

# Step 3: Clear npm cache
Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✅ Cache cleared" -ForegroundColor Green

# Step 4: Install correct esbuild version
Write-Host "📦 Installing esbuild@0.25.12..." -ForegroundColor Yellow
npm install esbuild@0.25.12 --save-dev --force
Write-Host "✅ esbuild pinned" -ForegroundColor Green

# Step 5: Reinstall all dependencies
Write-Host "📦 Reinstalling all dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps
Write-Host "✅ Dependencies restored" -ForegroundColor Green

Write-Host "`n🎉 Cleanup ritual complete! Your environment is purged and rebuilt." -ForegroundColor Cyan
Write-Host "📝 Log this event as 'Duplication Guard Triggered' in your operational notes." -ForegroundColor Magenta
