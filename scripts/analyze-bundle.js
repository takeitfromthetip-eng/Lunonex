#!/usr/bin/env node

/**
 * Bundle analyzer script
 * Helps visualize bundle size and identify large dependencies
 * 
 * Usage: node scripts/analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');

function getFileSizeInKB(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
}

function analyzeBundle() {
    console.log('📦 Analyzing bundle...\n');

    if (!fs.existsSync(DIST_DIR)) {
        console.error('❌ dist directory not found. Run `npm run build` first.');
        process.exit(1);
    }

    const files = fs.readdirSync(DIST_DIR, { recursive: true });
    const jsFiles = [];
    const cssFiles = [];
    const otherFiles = [];

    files.forEach(file => {
        if (typeof file !== 'string') return;

        const filePath = path.join(DIST_DIR, file);
        if (!fs.statSync(filePath).isFile()) return;

        const size = getFileSizeInKB(filePath);
        const fileInfo = { name: file, size: parseFloat(size) };

        if (file.endsWith('.js')) {
            jsFiles.push(fileInfo);
        } else if (file.endsWith('.css')) {
            cssFiles.push(fileInfo);
        } else {
            otherFiles.push(fileInfo);
        }
    });

    // Sort by size
    jsFiles.sort((a, b) => b.size - a.size);
    cssFiles.sort((a, b) => b.size - a.size);

    // Calculate totals
    const totalJS = jsFiles.reduce((sum, f) => sum + f.size, 0);
    const totalCSS = cssFiles.reduce((sum, f) => sum + f.size, 0);
    const totalOther = otherFiles.reduce((sum, f) => sum + f.size, 0);
    const totalSize = totalJS + totalCSS + totalOther;

    console.log('JavaScript Files:');
    console.log('─────────────────');
    jsFiles.forEach(file => {
        const bar = '█'.repeat(Math.ceil(file.size / 10));
        console.log(`${file.name.padEnd(40)} ${bar} ${file.size} KB`);
    });
    console.log(`\nTotal JS: ${totalJS.toFixed(2)} KB\n`);

    console.log('CSS Files:');
    console.log('──────────');
    cssFiles.forEach(file => {
        const bar = '█'.repeat(Math.ceil(file.size / 5));
        console.log(`${file.name.padEnd(40)} ${bar} ${file.size} KB`);
    });
    console.log(`\nTotal CSS: ${totalCSS.toFixed(2)} KB\n`);

    console.log('Summary:');
    console.log('────────');
    console.log(`📦 Total bundle size: ${totalSize.toFixed(2)} KB`);
    console.log(`📜 JavaScript: ${totalJS.toFixed(2)} KB (${((totalJS / totalSize) * 100).toFixed(1)}%)`);
    console.log(`🎨 CSS: ${totalCSS.toFixed(2)} KB (${((totalCSS / totalSize) * 100).toFixed(1)}%)`);
    console.log(`📁 Other: ${totalOther.toFixed(2)} KB (${((totalOther / totalSize) * 100).toFixed(1)}%)`);

    // Warnings
    console.log('\n⚠️  Recommendations:');
    if (totalJS > 500) {
        console.log('- Consider code splitting to reduce main bundle size');
    }
    if (jsFiles.some(f => f.size > 200)) {
        console.log('- Some JS files are very large, consider lazy loading');
    }
    if (totalSize > 1000) {
        console.log('- Total bundle size is large, optimize images and dependencies');
    }

    console.log('\n✅ Analysis complete!');
}

analyzeBundle();
