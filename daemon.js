/* eslint-disable */
const { execSync } = require('child_process');
const path = require('path');

/**
 * ForTheWeebs Server Daemon
 * Runs server permanently in background as Windows service
 */

const SERVICE_NAME = 'ForTheWeebsServer';
const SERVER_PATH = path.join(__dirname, 'server.js');
const NODE_PATH = process.execPath;

function isAdmin() {
  try {
    execSync('net session', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function serviceExists() {
  try {
    const result = execSync(`sc query ${SERVICE_NAME}`, { encoding: 'utf8' });
    return result.includes('SERVICE_NAME');
  } catch {
    return false;
  }
}

function installService() {
  console.log('📦 Installing ForTheWeebs as Windows service...');
  
  // Install node-windows if not present
  try {
    require('node-windows');
  } catch {
    console.log('Installing node-windows package...');
    execSync('npm install node-windows', { stdio: 'inherit' });
  }

  const Service = require('node-windows').Service;

  const svc = new Service({
    name: SERVICE_NAME,
    description: 'ForTheWeebs API Server - Runs permanently in background',
    script: SERVER_PATH,
    nodeOptions: [
      '--harmony',
      '--max_old_space_size=4096'
    ],
    env: [
      {
        name: 'NODE_ENV',
        value: 'production'
      },
      {
        name: 'PORT',
        value: '3000'
      }
    ]
  });

  svc.on('install', () => {
    console.log('✅ Service installed successfully!');
    console.log('🚀 Starting service...');
    svc.start();
  });

  svc.on('start', () => {
    console.log('✅ Service started!');
    console.log('🌐 Server running on http://localhost:3000');
    console.log('💡 Service will auto-start on system boot');
    console.log('\nCommands:');
    console.log('  Stop:      node daemon.js stop');
    console.log('  Restart:   node daemon.js restart');
    console.log('  Uninstall: node daemon.js uninstall');
  });

  svc.install();
}

function uninstallService() {
  console.log('🗑️  Uninstalling service...');
  
  const Service = require('node-windows').Service;
  const svc = new Service({
    name: SERVICE_NAME,
    script: SERVER_PATH
  });

  svc.on('uninstall', () => {
    console.log('✅ Service uninstalled');
  });

  svc.uninstall();
}

function stopService() {
  console.log('🛑 Stopping service...');
  try {
    execSync(`sc stop ${SERVICE_NAME}`, { stdio: 'inherit' });
    console.log('✅ Service stopped');
  } catch (error) {
    console.error('❌ Failed to stop service:', error.message);
  }
}

function startService() {
  console.log('🚀 Starting service...');
  try {
    execSync(`sc start ${SERVICE_NAME}`, { stdio: 'inherit' });
    console.log('✅ Service started');
  } catch (error) {
    console.error('❌ Failed to start service:', error.message);
  }
}

function restartService() {
  stopService();
  setTimeout(() => startService(), 2000);
}

function showStatus() {
  try {
    const result = execSync(`sc query ${SERVICE_NAME}`, { encoding: 'utf8' });
    console.log(result);
  } catch (error) {
    console.log('❌ Service not installed');
  }
}

// Main
const command = process.argv[2];

if (!isAdmin()) {
  console.error('❌ This script requires Administrator privileges');
  console.error('💡 Right-click PowerShell → Run as Administrator');
  console.error('   Then run: node daemon.js install');
  process.exit(1);
}

switch (command) {
  case 'install':
    if (serviceExists()) {
      console.log('⚠️  Service already installed');
      showStatus();
    } else {
      installService();
    }
    break;

  case 'uninstall':
    if (serviceExists()) {
      uninstallService();
    } else {
      console.log('⚠️  Service not installed');
    }
    break;

  case 'stop':
    stopService();
    break;

  case 'start':
    startService();
    break;

  case 'restart':
    restartService();
    break;

  case 'status':
    showStatus();
    break;

  default:
    console.log('ForTheWeebs Server Daemon');
    console.log('========================\n');
    console.log('Usage:');
    console.log('  node daemon.js install   - Install as Windows service');
    console.log('  node daemon.js uninstall - Remove service');
    console.log('  node daemon.js start     - Start service');
    console.log('  node daemon.js stop      - Stop service');
    console.log('  node daemon.js restart   - Restart service');
    console.log('  node daemon.js status    - Check service status\n');
    console.log('💡 Requires Administrator privileges');
}
