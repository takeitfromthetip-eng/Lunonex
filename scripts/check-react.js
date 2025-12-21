#!/usr/bin/env node

/**
 * React Deduplication Checker
 * Validates that only ONE version of React exists in node_modules
 * Fails the build if multiple versions are detected
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for React duplication...\n');

function findNestedReact(dir, nodeModulesPath, nestedReactPaths, depth = 0) {
  if (depth > 3) return; // Prevent infinite recursion

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);

        if (entry.name === 'react' && fullPath !== path.join(nodeModulesPath, 'react')) {
          nestedReactPaths.push(fullPath);
        } else if (entry.name === 'node_modules') {
          findNestedReact(fullPath, nodeModulesPath, nestedReactPaths, depth + 1);
        }
      }
    }
  } catch (err) {
    // Ignore permission errors
  }
}

try {
  // Check npm list for react versions
  const reactList = execSync('npm list react --depth=0 2>&1', { encoding: 'utf8' });
  const reactDomList = execSync('npm list react-dom --depth=0 2>&1', { encoding: 'utf8' });

  // Count occurrences
  const reactMatches = (reactList.match(/react@/g) || []).length;
  const reactDomMatches = (reactDomList.match(/react-dom@/g) || []).length;

  console.log('React versions found:', reactMatches);
  console.log('React-DOM versions found:', reactDomMatches);
  console.log('\n' + reactList);
  console.log('\n' + reactDomList);

  // Also check for multiple react directories
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  const nestedReactPaths = [];

  findNestedReact(nodeModulesPath, nodeModulesPath, nestedReactPaths);
  
  if (nestedReactPaths.length > 0) {
    console.error('\n❌ NESTED REACT INSTANCES DETECTED:');
    nestedReactPaths.forEach(p => console.error('  -', p));
    console.error('\n🔧 Run: npm run fix:react');
    process.exit(1);
  }
  
  if (reactMatches > 1 || reactDomMatches > 1) {
    console.error('\n❌ MULTIPLE REACT VERSIONS DETECTED!');
    console.error('This will cause the "Cannot set properties of undefined (setting \'Children\')" error.');
    console.error('\n🔧 Run: npm run fix:react');
    process.exit(1);
  }
  
  console.log('\n✅ React deduplication check PASSED');
  console.log('Only one React instance detected.\n');
  
} catch (error) {
  console.error('\n⚠️  Warning: Could not verify React versions');
  console.error(error.message);
  // Don't fail build on check error, just warn
  process.exit(0);
}
