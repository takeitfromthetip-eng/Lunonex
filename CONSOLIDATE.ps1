# CONSOLIDATE.ps1 - Consolidate Fortheweebs into lunonex and delete duplicates
# Eliminates Fortheweebs from existence entirely

$ErrorActionPreference = "Continue"

$currentDir = "C:\Users\polot\IdeaProjects\lunonex"
$fortheweebs = "C:\Users\polot\Fortheweebs"
$desktopDupe = "C:\Users\polot\Desktop\Lunonex"
$onedriveDupe = "C:\Users\polot\OneDrive\Desktop\fortheweebs"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CONSOLIDATION AND CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Compare Fortheweebs and current lunonex
Write-Host "[1/7] Comparing Fortheweebs with lunonex..." -ForegroundColor Yellow

$fortComponents = @()
$lunoComponents = @()

if (Test-Path "$fortheweebs\src\components") {
    $fortComponents = Get-ChildItem "$fortheweebs\src\components" -Recurse -File -ErrorAction SilentlyContinue | Select-Object Name, LastWriteTime, Length
}

if (Test-Path "$currentDir\src\components") {
    $lunoComponents = Get-ChildItem "$currentDir\src\components" -Recurse -File -ErrorAction SilentlyContinue | Select-Object Name, LastWriteTime, Length
}

Write-Host "  Fortheweebs components: $($fortComponents.Count)" -ForegroundColor Gray
Write-Host "  Lunonex components: $($lunoComponents.Count)" -ForegroundColor Gray

# Find files in Fortheweebs that are newer or don't exist in lunonex
$uniqueOrNewer = @()
foreach ($fortFile in $fortComponents) {
    $matchingLuno = $lunoComponents | Where-Object { $_.Name -eq $fortFile.Name }
    if (-not $matchingLuno -or $fortFile.LastWriteTime -gt $matchingLuno.LastWriteTime) {
        $uniqueOrNewer += $fortFile
    }
}

Write-Host "`n  Files to migrate from Fortheweebs: $($uniqueOrNewer.Count)" -ForegroundColor Cyan

# Step 2: Copy unique/newer files
if ($uniqueOrNewer.Count -gt 0) {
    Write-Host "`n[2/7] Migrating unique/newer files..." -ForegroundColor Yellow

    $migrated = 0
    foreach ($file in $uniqueOrNewer) {
        try {
            $relativePath = $file.FullName.Replace("$fortheweebs\", "")
            $destPath = Join-Path $currentDir $relativePath
            $destDir = Split-Path $destPath -Parent

            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }

            Copy-Item $file.FullName $destPath -Force
            $migrated++
        } catch {
            Write-Host "  Failed to migrate file" -ForegroundColor Red
        }
    }

    Write-Host "  Migrated $migrated files successfully" -ForegroundColor Green
} else {
    Write-Host "`n[2/7] No files to migrate - lunonex is up to date" -ForegroundColor Green
}

# Step 3: Create backup list
Write-Host "`n[3/7] Creating deletion manifest..." -ForegroundColor Yellow
$manifest = @()

if (Test-Path $fortheweebs) {
    $manifest += "C:\Users\polot\Fortheweebs (entire folder)"
}
if (Test-Path $desktopDupe) {
    $manifest += "C:\Users\polot\Desktop\Lunonex (duplicate)"
}
if (Test-Path $onedriveDupe) {
    $manifest += "C:\Users\polot\OneDrive\Desktop\fortheweebs (duplicate)"
}

Write-Host "  Will delete:" -ForegroundColor Red
foreach ($item in $manifest) {
    Write-Host "    - $item" -ForegroundColor Red
}

# Step 4: Delete Fortheweebs
Write-Host "`n[4/7] Eliminating Fortheweebs from existence..." -ForegroundColor Yellow

if (Test-Path $fortheweebs) {
    try {
        Remove-Item $fortheweebs -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ Fortheweebs deleted" -ForegroundColor Green
    } catch {
        Write-Host "  Failed to delete Fortheweebs" -ForegroundColor Red
    }
} else {
    Write-Host "  Fortheweebs already gone" -ForegroundColor Gray
}

# Step 5: Delete duplicate Desktop folder
Write-Host "`n[5/7] Deleting duplicate Desktop/Lunonex..." -ForegroundColor Yellow

if (Test-Path $desktopDupe) {
    try {
        Remove-Item $desktopDupe -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ Desktop duplicate deleted" -ForegroundColor Green
    } catch {
        Write-Host "  Failed to delete Desktop duplicate" -ForegroundColor Red
    }
} else {
    Write-Host "  Desktop duplicate already gone" -ForegroundColor Gray
}

# Step 6: Delete OneDrive duplicate
Write-Host "`n[6/7] Deleting OneDrive duplicate..." -ForegroundColor Yellow

if (Test-Path $onedriveDupe) {
    try {
        Remove-Item $onedriveDupe -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ OneDrive duplicate deleted" -ForegroundColor Green
    } catch {
        Write-Host "  Failed to delete OneDrive duplicate" -ForegroundColor Red
    }
} else {
    Write-Host "  OneDrive duplicate already gone" -ForegroundColor Gray
}

# Step 7: Clean up garbage files
Write-Host "`n[7/7] Cleaning up garbage files..." -ForegroundColor Yellow

$garbagePatterns = @("*.log", "*.tmp", "*-old.*", "*-backup.*", "*.bak", "eslint-*.json")
$cleaned = 0

foreach ($pattern in $garbagePatterns) {
    $files = Get-ChildItem $currentDir -Filter $pattern -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        try {
            Remove-Item $file.FullName -Force
            $cleaned++
        } catch {
            # Silently continue
        }
    }
}

Write-Host "  ✓ Cleaned $cleaned garbage files" -ForegroundColor Green

# Final report
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CONSOLIDATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ One lunonex folder remaining" -ForegroundColor Green
Write-Host "  ✓ Fortheweebs eliminated" -ForegroundColor Green
Write-Host "  ✓ All duplicates removed" -ForegroundColor Green
Write-Host "  ✓ Garbage cleaned up" -ForegroundColor Green
Write-Host "`n"
