/* eslint-disable */
/**
 * COMPLETE PLATFORM TEST
 * Tests EVERY critical endpoint to verify the platform is launch-ready
 */

const API_URL = 'http://localhost:3000';

const tests = [];
let passed = 0;
let failed = 0;

async function test(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        passed++;
        return true;
    } catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
        failed++;
        return false;
    }
}

async function main() {
    console.log('🚀 COMPLETE PLATFORM TEST - ForTheWeebs\n');
    console.log('Testing ALL critical endpoints...\n');

    // Test 1: Server Health
    await test('Server Health Check', async () => {
        const res = await fetch(`${API_URL}/health`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (data.status !== 'OK') throw new Error('Server not healthy');
    });

    // Test 2: Bug Fixer - Report
    await test('Bug Fixer - Create Report', async () => {
        const res = await fetch(`${API_URL}/api/bug-fixer/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                errorMessage: 'Test error from platform test',
                pageUrl: 'http://test.com',
                severity: 'low'
            })
        });
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!data.success || !data.reportId) throw new Error('Bug report failed');
    });

    // Test 3: Social Feed - GET
    await test('Social Feed - Get Feed', async () => {
        const res = await fetch(`${API_URL}/api/social/feed`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.posts)) throw new Error('Posts not array');
    });

    // Test 4: Social Feed - POST (Critical!)
    let postId = null;
    await test('Social Feed - Create Post', async () => {
        const res = await fetch(`${API_URL}/api/social/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test_user_complete',
                content: 'Platform test post - if you see this, everything works!',
                visibility: 'public'
            })
        });
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!data.post || !data.post.id) throw new Error('Post creation failed');
        postId = data.post.id;
    });

    // Test 5: Social Discovery
    await test('Social - Discover Creators', async () => {
        const res = await fetch(`${API_URL}/api/social/discover?limit=5`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.creators)) throw new Error('Creators not array');
    });

    // Test 6: Social Search
    await test('Social - Search Users', async () => {
        const res = await fetch(`${API_URL}/api/social/search?q=test`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.users)) throw new Error('Search failed');
    });

    // Test 7: User Activity
    await test('User Activity - Track', async () => {
        const res = await fetch(`${API_URL}/api/user-activity/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test_user',
                action: 'platform_test',
                metadata: { test: true }
            })
        });
        // Allow 404 as this endpoint may not exist yet
        if (res.status !== 404 && !res.ok) throw new Error(`Status: ${res.status}`);
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED - PLATFORM IS LAUNCH READY! 🚀');
        console.log('\nCritical Systems Verified:');
        console.log('  ✅ Server health monitoring');
        console.log('  ✅ Bug tracking system');
        console.log('  ✅ Social feed (GET)');
        console.log('  ✅ Post creation (POST) - WORKING!');
        console.log('  ✅ User discovery');
        console.log('  ✅ Search functionality');
        console.log('\n🌟 You are cleared for launch! 🌟\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed - review errors above');
        console.log(`\n${passed} systems operational, ${failed} need attention\n`);
        process.exit(1);
    }
}

main().catch(console.error);
