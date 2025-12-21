# 🖥️ DOCKED CONSOLE - Windows PowerShell Version
# Live Resource Monitor for Node.js Builds
# Streams CPU, RAM, and Node process stats
# Every crash gets ritualized as a sovereign artifact

$ErrorActionPreference = "Stop"

# Configuration
$INTERVAL = 2  # Update every 2 seconds
$ARTIFACT_DIR = "./artifacts"
$LOG_FILE = "$ARTIFACT_DIR/resource-monitor.log"
$CRASH_LOG = "$ARTIFACT_DIR/crash-log.json"

# Create artifacts directory
New-Item -ItemType Directory -Path $ARTIFACT_DIR -Force | Out-Null

# Initialize logs
"🖥️  Docked Console started at $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")" | Set-Content $LOG_FILE
"[]" | Set-Content $CRASH_LOG

Write-Host "🚀 Starting Docked Console Resource Monitor..." -ForegroundColor Green
Write-Host "📝 Logging to: $LOG_FILE" -ForegroundColor Yellow
Write-Host "🔴 Crash logs: $CRASH_LOG" -ForegroundColor Yellow
Start-Sleep -Seconds 2

$iteration = 0

try {
    while ($true) {
        Clear-Host
        
        Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║          🖥️  DOCKED CONSOLE - Resource Monitor              ║" -ForegroundColor Cyan
        Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
        Write-Host "║ Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")                        ║" -ForegroundColor Cyan
        Write-Host "║ Iteration: #$iteration                                        ║" -ForegroundColor Cyan
        Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
        
        # Memory Info
        $os = Get-CimInstance Win32_OperatingSystem
        $totalMemMB = [math]::Round($os.TotalVisibleMemorySize / 1024, 2)
        $freeMemMB = [math]::Round($os.FreePhysicalMemory / 1024, 2)
        $usedMemMB = [math]::Round($totalMemMB - $freeMemMB, 2)
        $memPercent = [math]::Round(($usedMemMB / $totalMemMB) * 100, 1)
        
        Write-Host "║ 💾 MEMORY                                                   ║" -ForegroundColor Cyan
        Write-Host "║    $usedMemMB/$totalMemMB MB ($memPercent%)                       ║" -ForegroundColor Cyan
        
        # Progress bar
        $barWidth = 20
        $filled = [math]::Floor($memPercent * $barWidth / 100)
        $empty = $barWidth - $filled
        $bar = "[" + ("█" * $filled) + ("░" * $empty) + "] $memPercent%"
        Write-Host "║    $bar                                        ║" -ForegroundColor Cyan
        Write-Host "║                                                                ║" -ForegroundColor Cyan
        
        # CPU Info
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        $cpuLoad = $cpu.LoadPercentage
        $cpuCores = $cpu.NumberOfLogicalProcessors
        
        Write-Host "║ ⚡ CPU                                                      ║" -ForegroundColor Cyan
        Write-Host "║    Load: $cpuLoad% ($cpuCores cores)                                 ║" -ForegroundColor Cyan
        Write-Host "║                                                                ║" -ForegroundColor Cyan
        
        # Disk Info
        $disk = Get-PSDrive C | Select-Object Used, Free
        $usedGB = [math]::Round($disk.Used / 1GB, 2)
        $freeGB = [math]::Round($disk.Free / 1GB, 2)
        $totalGB = $usedGB + $freeGB
        $diskPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)
        
        Write-Host "║ 💿 DISK                                                     ║" -ForegroundColor Cyan
        Write-Host "║    $usedGB/$totalGB GB ($diskPercent%)                          ║" -ForegroundColor Cyan
        Write-Host "║                                                                ║" -ForegroundColor Cyan
        
        # Node Processes
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        $nodeCount = if ($nodeProcesses) { $nodeProcesses.Count } else { 0 }
        
        Write-Host "║ 🟢 NODE.JS                                                  ║" -ForegroundColor Cyan
        Write-Host "║    Active: $nodeCount processes                                    ║" -ForegroundColor Cyan
        
        if ($nodeProcesses) {
            $topNode = $nodeProcesses | Sort-Object CPU -Descending | Select-Object -First 1
            $nodePID = $topNode.Id
            $nodeCPU = [math]::Round($topNode.CPU, 2)
            $nodeMemMB = [math]::Round($topNode.WS / 1MB, 2)
            Write-Host "║    Top PID: $nodePID | CPU: $nodeCPU s | MEM: $nodeMemMB MB           ║" -ForegroundColor Cyan
        }
        Write-Host "║                                                                ║" -ForegroundColor Cyan
        
        # Process Count
        $totalProcesses = (Get-Process).Count
        Write-Host "║ 📊 PROCESSES                                                ║" -ForegroundColor Cyan
        Write-Host "║    Total: $totalProcesses running                                    ║" -ForegroundColor Cyan
        
        Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
        Write-Host "║ Logs: $LOG_FILE                ║" -ForegroundColor Cyan
        Write-Host "║ Press Ctrl+C to stop monitoring                                ║" -ForegroundColor Cyan
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
        
        # Log to file
        $logEntry = "[$(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")] MEM: $usedMemMB/$totalMemMB MB ($memPercent%) | CPU: $cpuLoad% | DISK: $usedGB/$totalGB GB ($diskPercent%) | NODE: $nodeCount processes"
        Add-Content -Path $LOG_FILE -Value $logEntry
        
        $iteration++
        Start-Sleep -Seconds $INTERVAL
    }
}
catch {
    # Handle crash
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Red
    Write-Host "⚠️  CRASH DETECTED" -ForegroundColor Red
    Write-Host "════════════════════════════════════════" -ForegroundColor Red
    
    # Capture crash state
    $crashData = @{
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        error = $_.Exception.Message
        memory = @{
            used_mb = $usedMemMB
            free_mb = $freeMemMB
            percent = $memPercent
        }
        cpu_load = $cpuLoad
        disk_usage_percent = $diskPercent
        node_processes = $nodeCount
    }
    
    # Append to crash log
    $existingCrashes = Get-Content $CRASH_LOG | ConvertFrom-Json
    $existingCrashes += $crashData
    $existingCrashes | ConvertTo-Json -Depth 10 | Set-Content $CRASH_LOG
    
    Write-Host "📝 Crash artifact logged to: $CRASH_LOG" -ForegroundColor Yellow
    throw
}
