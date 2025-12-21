#!/bin/bash

###############################################################################
# 🖥️  DOCKED CONSOLE - Live Resource Monitor for Node.js Builds
###############################################################################
# Streams CPU, RAM, Swap, File Descriptors, and Node process stats
# Every crash or pivot gets ritualized as a sovereign artifact
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
INTERVAL=2  # Update every 2 seconds
LOG_FILE="./artifacts/resource-monitor.log"
CRASH_LOG="./artifacts/crash-log.json"
ARTIFACT_DIR="./artifacts"

# Create artifacts directory
mkdir -p "$ARTIFACT_DIR"

# Initialize logs
echo "🖥️  Docked Console started at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$LOG_FILE"
echo "[]" > "$CRASH_LOG"

# Trap signals for crash detection
trap 'handle_crash "SIGINT"' INT
trap 'handle_crash "SIGTERM"' TERM
trap 'handle_crash "EXIT"' EXIT

function handle_crash() {
  local signal=$1
  echo ""
  echo -e "${RED}════════════════════════════════════════${NC}"
  echo -e "${RED}⚠️  CRASH DETECTED: $signal${NC}"
  echo -e "${RED}════════════════════════════════════════${NC}"
  
  # Capture crash state
  local crash_data=$(cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "signal": "$signal",
  "memory": {
    "free": "$(free -m | grep Mem: | awk '{print $4}')MB",
    "used": "$(free -m | grep Mem: | awk '{print $3}')MB",
    "swap_used": "$(free -m | grep Swap: | awk '{print $3}')MB"
  },
  "cpu_load": "$(uptime | awk -F'load average:' '{print $2}' | xargs)",
  "disk_usage": "$(df -h / | tail -1 | awk '{print $5}')",
  "node_processes": $(ps aux | grep -c node || echo "0"),
  "file_descriptors_open": "$(lsof 2>/dev/null | wc -l || echo "unknown")"
}
EOF
)
  
  # Append to crash log
  local existing=$(cat "$CRASH_LOG")
  echo "$existing" | jq ". += [$crash_data]" > "$CRASH_LOG" 2>/dev/null || echo "$crash_data" > "$CRASH_LOG"
  
  echo -e "${YELLOW}📝 Crash artifact logged to: $CRASH_LOG${NC}"
  
  # Don't actually exit on trap, just log
  if [ "$signal" != "EXIT" ]; then
    return
  fi
}

function get_memory_info() {
  local mem_total=$(free -m | grep Mem: | awk '{print $2}')
  local mem_used=$(free -m | grep Mem: | awk '{print $3}')
  local mem_free=$(free -m | grep Mem: | awk '{print $4}')
  local mem_percent=$((mem_used * 100 / mem_total))
  
  local swap_total=$(free -m | grep Swap: | awk '{print $2}')
  local swap_used=$(free -m | grep Swap: | awk '{print $3}')
  local swap_percent=0
  if [ "$swap_total" -gt 0 ]; then
    swap_percent=$((swap_used * 100 / swap_total))
  fi
  
  echo "$mem_used/$mem_total MB ($mem_percent%) | Swap: $swap_used/$swap_total MB ($swap_percent%)"
}

function get_cpu_info() {
  local load=$(uptime | awk -F'load average:' '{print $2}' | xargs | cut -d',' -f1)
  local cpu_count=$(nproc)
  echo "Load: $load (${cpu_count} cores)"
}

function get_disk_info() {
  local disk_used=$(df -h / | tail -1 | awk '{print $3}')
  local disk_total=$(df -h / | tail -1 | awk '{print $2}')
  local disk_percent=$(df -h / | tail -1 | awk '{print $5}')
  echo "$disk_used/$disk_total ($disk_percent)"
}

function get_node_processes() {
  local count=$(ps aux | grep -c node || echo "0")
  echo "$count processes"
}

function get_file_descriptors() {
  local open_fds=$(lsof 2>/dev/null | wc -l || echo "unknown")
  local limit=$(ulimit -n)
  echo "$open_fds/$limit"
}

function draw_progress_bar() {
  local percent=$1
  local width=20
  local filled=$((percent * width / 100))
  local empty=$((width - filled))
  
  printf "["
  printf "%${filled}s" | tr ' ' '█'
  printf "%${empty}s" | tr ' ' '░'
  printf "]"
}

function monitor_loop() {
  local iteration=0
  
  while true; do
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}          🖥️  DOCKED CONSOLE - Resource Monitor${NC}              ${CYAN}║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} Timestamp: ${YELLOW}$(date +"%Y-%m-%d %H:%M:%S")${NC}                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC} Iteration: ${GREEN}#$iteration${NC}                                        ${CYAN}║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════════╣${NC}"
    
    # Memory
    local mem_info=$(get_memory_info)
    local mem_percent=$(free -m | grep Mem: | awk '{print int($3*100/$2)}')
    echo -e "${CYAN}║${NC} ${MAGENTA}💾 MEMORY${NC}                                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    $mem_info                       ${CYAN}║${NC}"
    printf "${CYAN}║${NC}    "
    draw_progress_bar "$mem_percent"
    printf " ${mem_percent}%%\n"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    
    # CPU
    local cpu_info=$(get_cpu_info)
    echo -e "${CYAN}║${NC} ${GREEN}⚡ CPU${NC}                                                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    $cpu_info                                         ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    
    # Disk
    local disk_info=$(get_disk_info)
    echo -e "${CYAN}║${NC} ${YELLOW}💿 DISK${NC}                                                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    $disk_info                                          ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    
    # Node Processes
    local node_info=$(get_node_processes)
    echo -e "${CYAN}║${NC} ${BLUE}🟢 NODE.JS${NC}                                                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    Active: $node_info                                    ${CYAN}║${NC}"
    
    # Show top Node process if any
    local top_node=$(ps aux | grep node | grep -v grep | head -1 | awk '{print $2, $3, $4}' || echo "No processes")
    if [ "$top_node" != "No processes" ]; then
      echo -e "${CYAN}║${NC}    Top PID: $top_node                           ${CYAN}║${NC}"
    fi
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    
    # File Descriptors
    local fd_info=$(get_file_descriptors)
    echo -e "${CYAN}║${NC} ${MAGENTA}📁 FILE DESCRIPTORS${NC}                                        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}    Open: $fd_info                                        ${CYAN}║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} ${WHITE}Logs: $LOG_FILE${NC}                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC} ${WHITE}Press Ctrl+C to stop monitoring${NC}                            ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    # Log to file
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] MEM: $mem_info | CPU: $cpu_info | DISK: $disk_info | NODE: $node_info | FD: $fd_info" >> "$LOG_FILE"
    
    iteration=$((iteration + 1))
    sleep "$INTERVAL"
  done
}

# Start monitoring
echo -e "${GREEN}🚀 Starting Docked Console Resource Monitor...${NC}"
echo -e "${YELLOW}📝 Logging to: $LOG_FILE${NC}"
echo -e "${YELLOW}🔴 Crash logs: $CRASH_LOG${NC}"
sleep 2

monitor_loop
