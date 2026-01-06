#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Cleanup: Remove useless extensions, consolidate workspaces, delete Fortheweebs
#>

Write-Host "🧹 CLEANUP AND CONSOLIDATION SCRIPT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1. REMOVE USELESS VSCODE EXTENSIONS (Keep only Copilot)
Write-Host "`n📦 Step 1: Removing useless VSCode extensions..." -ForegroundColor Yellow

$extensionsToKeep = @(
    "github.copilot",
    "github.copilot-chat"
)

$extensionsToRemove = @(
    "antfu.iconify",
    "clinyong.vscode-css-modules",
    "davidanson.vscode-markdownlint",
    "donjayamanne.githistory",
    "dsznajder.es7-react-js-snippets",
    "eamodio.gitlens",
    "fabiospampinato.vscode-open-in-github",
    "github.vscode-github-actions",
    "github.vscode-pull-request-github",
    "graphql.vscode-graphql-syntax",
    "humao.rest-client",
    "ms-python.debugpy",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-python.vscode-python-envs",
    "ms-vscode-remote.remote-containers",
    "ms-windows-ai-studio.windows-ai-studio",
    "msjsdiag.vscode-react-native",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg",
    "omartawfik.github-actions-vscode",
    "sonarsource.sonarlint-vscode",
    "steoates.autoimport",
    "tal7aouy.icons",
    "wallabyjs.console-ninja",
    "wayou.vscode-todo-highlight",
    "webnative.webnative",
    "wix.glean",
    "christian-kohler.npm-intellisense",
    "ms-vscode.vscode-typescript-next"
)

foreach ($ext in $extensionsToRemove) {
    Write-Host "  Removing $ext..." -ForegroundColor Gray
    code --uninstall-extension $ext --force 2>$null
}

Write-Host "✅ Extensions cleaned (kept only GitHub Copilot)" -ForegroundColor Green

# 2. UPDATE WORKSPACE EXTENSIONS.JSON
Write-Host "`n📝 Step 2: Updating workspace extensions.json..." -ForegroundColor Yellow

$extensionsJson = @"
{
  "recommendations": [
    "github.copilot",
    "github.copilot-chat"
  ],
  "unwantedRecommendations": []
}
"@

Set-Content -Path ".vscode/extensions.json" -Value $extensionsJson
Write-Host "✅ Updated .vscode/extensions.json" -ForegroundColor Green

# 3. CONSOLIDATE: Check what's in Fortheweebs that's not in current project
Write-Host "`n🔍 Step 3: Analyzing Fortheweebs for useful code..." -ForegroundColor Yellow

$fortheweebsPath = "C:\Users\polot\Fortheweebs"
$currentPath = Get-Location

if (Test-Path $fortheweebsPath) {
    Write-Host "  Found Fortheweebs at: $fortheweebsPath" -ForegroundColor Gray

    # Compare .env files
    if (Test-Path "$fortheweebsPath\.env") {
        Write-Host "  ⚠️  Fortheweebs has .env file - manual review needed" -ForegroundColor Yellow
    }

    # Check for unique components
    $fortheweebsComponents = Get-ChildItem "$fortheweebsPath\src\components" -File -ErrorAction SilentlyContinue
    $currentComponents = Get-ChildItem "src\components" -File -ErrorAction SilentlyContinue

    $uniqueFiles = $fortheweebsComponents | Where-Object {
        $_.Name -notin $currentComponents.Name
    }

    if ($uniqueFiles.Count -gt 0) {
        Write-Host "  ⚠️  Found $($uniqueFiles.Count) unique files in Fortheweebs:" -ForegroundColor Yellow
        $uniqueFiles | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }
        Write-Host "`n  💡 Review these files before deletion!" -ForegroundColor Cyan
    } else {
        Write-Host "  ✅ No unique files found in Fortheweebs" -ForegroundColor Green
    }
} else {
    Write-Host "  ℹ️  Fortheweebs not found at expected location" -ForegroundColor Gray
}

# 4. DELETE DUPLICATE PROJECTS
Write-Host "`n🗑️  Step 4: Preparing to delete duplicate projects..." -ForegroundColor Yellow

$projectsToDelete = @(
    "C:\Users\polot\Fortheweebs",
    "C:\Users\polot\Desktop\Lunonex",
    "C:\Users\polot\OneDrive\Desktop\fortheweebs"
)

Write-Host "  Projects marked for deletion:" -ForegroundColor Gray
foreach ($proj in $projectsToDelete) {
    if (Test-Path $proj) {
        $size = (Get-ChildItem $proj -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "    - $proj ($([math]::Round($size, 2)) MB)" -ForegroundColor Gray
    }
}

Write-Host "`n  ⚠️  MANUAL CONFIRMATION REQUIRED" -ForegroundColor Red
Write-Host "  Run this command to DELETE:" -ForegroundColor Yellow
Write-Host '  Remove-Item -Path "C:\Users\polot\Fortheweebs" -Recurse -Force' -ForegroundColor Cyan
Write-Host '  Remove-Item -Path "C:\Users\polot\Desktop\Lunonex" -Recurse -Force' -ForegroundColor Cyan
Write-Host '  Remove-Item -Path "C:\Users\polot\OneDrive\Desktop\fortheweebs" -Recurse -Force' -ForegroundColor Cyan

# 5. CLEAN UP GARBAGE FILES
Write-Host "`n🧹 Step 5: Cleaning up garbage files..." -ForegroundColor Yellow

$garbagePatterns = @(
    "*.log",
    "*.tmp",
    "*-old.*",
    "*-backup.*",
    "*.bak",
    "eslint-*.json",
    "lint-output.json"
)

$cleaned = 0
foreach ($pattern in $garbagePatterns) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue |
             Where-Object { $_.FullName -notmatch "node_modules" }

    foreach ($file in $files) {
        Write-Host "  Removing: $($file.Name)" -ForegroundColor Gray
        Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
        $cleaned++
    }
}

Write-Host "✅ Cleaned $cleaned garbage files" -ForegroundColor Green

# 6. CONSOLIDATE WORKSPACES
Write-Host "`n📂 Step 6: Creating single consolidated workspace..." -ForegroundColor Yellow

$workspaceConfig = @"
{
  "folders": [
    {
      "path": "."
    }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "files.exclude": {
      "**/node_modules": true,
      "**/.git": false,
      "**/dist": true,
      "**/.cache": true
    }
  },
  "extensions": {
    "recommendations": [
      "github.copilot",
      "github.copilot-chat"
    ]
  }
}
"@

Set-Content -Path "lunonex.code-workspace" -Value $workspaceConfig
Write-Host "✅ Created lunonex.code-workspace" -ForegroundColor Green

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review unique files from Fortheweebs (if any)" -ForegroundColor White
Write-Host "2. Manually run deletion commands above" -ForegroundColor White
Write-Host "3. Open: code lunonex.code-workspace" -ForegroundColor White
Write-Host "4. Restart VSCode to apply extension changes" -ForegroundColor White
