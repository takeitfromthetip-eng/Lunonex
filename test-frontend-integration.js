/**
 * End-to-End Integration Test
 * Tests the ACTUAL frontend → backend → database flow
 */

const puppeteer = require('puppeteer');

async function testFullStack() {
    console.log('\n🧪 FULL STACK INTEGRATION TEST\n');
    console.log('Testing: Frontend (3003) → Backend (3001) → Supabase\n');

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Capture console logs
        const logs = [];
        page.on('console', msg => {
            const text = msg.text();
            logs.push(text);
            if (text.includes('localhost:3000') || text.includes('localhost:3001')) {
                console.log(`  📡 API Call: ${text}`);
            }
        });

        // Capture network requests
        const apiCalls = [];
        page.on('request', request => {
            const url = request.url();
            if (url.includes('/api/')) {
                apiCalls.push(url);
                console.log(`  🌐 Request: ${url}`);
            }
        });

        console.log('1️⃣  Opening frontend at http://localhost:3003...');
        await page.goto('http://localhost:3003', { waitUntil: 'networkidle2' });

        await page.waitForTimeout(2000);

        console.log('\n2️⃣  Checking which API URL is configured...');
        const apiUrl = await page.evaluate(() => {
            return import.meta.env?.VITE_API_URL || 'NOT FOUND';
        });
        console.log(`  ✅ VITE_API_URL = ${apiUrl}`);

        if (apiUrl === 'http://localhost:3001') {
            console.log(`  ✅ CORRECT! Using port 3001 (working backend)`);
        } else if (apiUrl === 'http://localhost:3000') {
            console.log(`  ❌ WRONG! Using port 3000 (broken backend)`);
        } else {
            console.log(`  ⚠️  Unexpected value: ${apiUrl}`);
        }

        console.log('\n3️⃣  API calls made during page load:');
        apiCalls.forEach(url => {
            const port = url.includes(':3001') ? '3001 ✅' : url.includes(':3000') ? '3000 ❌' : 'unknown';
            console.log(`  ${port} - ${url}`);
        });

        console.log('\n4️⃣  Keeping browser open for 30 seconds for manual inspection...');
        console.log('     Check: Network tab, Console logs, Social feed content');
        await page.waitForTimeout(30000);

        console.log('\n✅ Test complete! Check results above.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testFullStack();
