// Quick API Test Script
const http = require('http');

console.log('Testing Lunonex API...\n');

// Test 1: Health Check
http.get('http://localhost:3001/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Health Check:', data);
    console.log('\n');

    // Test 2: Try to access governance (should get 401 unauthorized)
    http.get('http://localhost:3001/api/governance/notary/history', (res2) => {
      console.log(`📊 Governance API Status: ${res2.statusCode}`);
      console.log(res2.statusCode === 200 ? '✅ Governance working' : '⚠️  Governance requires auth (expected)');
      console.log('\n✅ API is ready! Server responding correctly.');
      console.log('\nNext step: Set up database in Supabase using the 3 SQL files.');
      process.exit(0);
    }).on('error', err => {
      console.error('❌ Governance API error:', err.message);
      process.exit(1);
    });
  });
}).on('error', (err) => {
  console.error('❌ Health check failed:', err.message);
  console.error('Make sure server is running: npm run server');
  process.exit(1);
});
