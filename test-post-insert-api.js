/**
 * Test POST endpoint to see detailed error
 */

const testUserId = 'c81cfb58-6006-495c-81b8-1adbe1366472';
const apiUrl = process.env.API_URL || 'http://localhost:3001';

async function testPostCreation() {
    console.log('\n🔍 TESTING POST CREATION VIA API\n');
    console.log(`API URL: ${apiUrl}/api/social/post`);
    console.log(`User ID: ${testUserId}\n`);

    try {
        const response = await fetch(`${apiUrl}/api/social/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: testUserId,
                content: 'Test post via API script',
                visibility: 'PUBLIC',
                media: []
            })
        });

        const data = await response.json();
        
        console.log('✅ Response received:');
        console.log(JSON.stringify(data, null, 2));

        if (data.post) {
            console.log(`\n📊 Post Details:`);
            console.log(`  ID: ${data.post.id}`);
            console.log(`  ID Type: ${typeof data.post.id}`);
            console.log(`  Is UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.post.id)}`);
            console.log(`  Is Timestamp: ${typeof data.post.id === 'number' || !isNaN(data.post.id)}`);
            console.log(`  Content: ${data.post.content}`);
            console.log(`  User ID: ${data.post.userId}`);
        }

        if (data.error) {
            console.log(`\n❌ Error: ${data.error}`);
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testPostCreation();
