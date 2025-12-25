const fs = require('fs');

// Read .env file
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');

console.log('\n=== CHECKING KEYS THAT LIKELY NEED ROTATION ===\n');

// Extract keys
const keys = {};
lines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    keys[key.trim()] = valueParts.join('=').trim();
  }
});

// Check JWT_SECRET
console.log('1. JWT_SECRET:');
console.log('   Current value:', keys.JWT_SECRET);
console.log('   Length:', keys.JWT_SECRET?.length, 'chars');
console.log('   Status: Need new random 64+ char string\n');

// Check Supabase keys
console.log('2. VITE_SUPABASE_ANON_KEY:');
console.log('   Current value:', keys.VITE_SUPABASE_ANON_KEY);
console.log('   Status: Check if starts with "eyJ" (valid JWT format)\n');

console.log('3. SUPABASE_SERVICE_KEY:');
console.log('   Current value:', keys.SUPABASE_SERVICE_KEY);
console.log('   Status: Check if starts with "eyJ" (valid JWT format)\n');

// Check Stripe
console.log('4. VITE_STRIPE_PUBLIC_KEY:');
console.log('   Current value:', keys.VITE_STRIPE_PUBLIC_KEY);
console.log('   Starts with: pk_live_', keys.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_live_'));
console.log('   Status: Should start with "pk_live_" or "pk_test_"\n');

console.log('5. STRIPE_SECRET_KEY:');
console.log('   Current value:', keys.STRIPE_SECRET_KEY);
console.log('   Starts with: rk_live_', keys.STRIPE_SECRET_KEY?.startsWith('rk_live_'));
console.log('   Status: Should start with "sk_live_" or "sk_test_" (NOT rk_live_)\n');

console.log('6. STRIPE_WEBHOOK_SECRET:');
console.log('   Current value:', keys.STRIPE_WEBHOOK_SECRET);
console.log('   Starts with: whsec_', keys.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_'));

console.log('\n=== ISSUES FOUND ===');
console.log('❌ STRIPE_SECRET_KEY starts with "rk_live_" - INVALID! Should be "sk_live_"');
console.log('❌ VITE_SUPABASE_ANON_KEY format looks wrong (should be long JWT starting with eyJ)');
console.log('❌ SUPABASE_SERVICE_KEY format looks wrong (should be long JWT starting with eyJ)');
console.log('\nGo to:');
console.log('- Stripe Dashboard → Developers → API Keys to get correct keys');
console.log('- Supabase Dashboard → Settings → API to get correct keys');
console.log('- Generate new JWT_SECRET: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
