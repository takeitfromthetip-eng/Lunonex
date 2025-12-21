#!/usr/bin/env node

/**
 * React Deduplication Auto-Heal Script
 * Forces a clean install with React 18.3.1 deduplicated
 * Self-healing build pipeline component
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting React deduplication fix...\n');

const rootDir = path.join(__dirname, '..');
const nodeModules = path.join(rootDir, 'node_modules');
const packageLock = path.join(rootDir, 'package-lock.json');

// Step 1: Remove node_modules if it exists
if (fs.existsSync(nodeModules)) {
  console.log('🗑️  Removing node_modules...');
  try {
    fs.rmSync(nodeModules, { recursive: true, force: true });
    console.log('✅ node_modules removed\n');
  } catch (err) {
    console.error('⚠️  Could not remove node_modules:', err.message);
    console.log('Continuing anyway...\n');
  }
} else {
  console.log('✅ node_modules already clean\n');
}

// Step 2: Remove package-lock.json if it exists
if (fs.existsSync(packageLock)) {
  console.log('🗑️  Removing package-lock.json...');
  try {
    fs.unlinkSync(packageLock);
    console.log('✅ package-lock.json removed\n');
  } catch (err) {
    console.error('⚠️  Could not remove package-lock.json:', err.message);
    console.log('Continuing anyway...\n');
  }
} else {
  console.log('✅ package-lock.json already clean\n');
}

// Step 3: Force install with legacy peer deps
console.log('📦 Installing dependencies with --legacy-peer-deps...');
console.log('This may take a few minutes...\n');

try {
  execSync('npm install --legacy-peer-deps', {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log('\n✅ Dependencies installed\n');
} catch (err) {
  console.error('\n❌ npm install failed:', err.message);
  process.exit(1);
}

// Step 4: Force React to exact version
console.log('🔒 Forcing React 18.3.1...');

try {
  execSync('npm install react@18.3.1 react-dom@18.3.1 --save-exact --legacy-peer-deps', {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log('\n✅ React locked to 18.3.1\n');
} catch (err) {
  console.error('\n⚠️  Warning: Could not lock React version');
  console.error(err.message);
  console.log('Continuing anyway...\n');
}

// Step 5: Run npm dedupe
console.log('🧹 Deduplicating dependencies...');

try {
  execSync('npm dedupe', {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log('\n✅ Dependencies deduplicated\n');
} catch (err) {
  console.error('\n⚠️  Warning: Dedupe had issues');
  console.error(err.message);
  console.log('Continuing anyway...\n');
}

// Step 6: Verify the fix
console.log('🔍 Verifying React installation...');

try {
  const reactVersion = execSync('npm list react --depth=0', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  console.log(reactVersion);
  
  const reactMatches = (reactVersion.match(/react@/g) || []).length;
  
  if (reactMatches === 1) {
    console.log('\n✅ React deduplication fix SUCCESSFUL!');
    console.log('Only one React instance present.\n');
  } else {
    console.log('\n⚠️  Warning: Multiple React versions still detected');
    console.log('You may need to manually check dependencies.\n');
  }
  
} catch (err) {
  console.log('\n⚠️  Could not verify fix');
  console.log(err.message);
}

console.log('🎉 Fix complete! Ready to build.\n');
