/**
 * Grant Owner Full Access Script
 * Run this to ensure polotuspossumus@gmail.com has unlimited access
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const OWNER_EMAIL = 'polotuspossumus@gmail.com';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function grantOwnerAccess() {
  console.log('🔓 Granting unlimited access to owner...\n');

  try {
    // 1. Get owner user from Supabase Auth
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    const owner = users.users.find(u => u.email.toLowerCase() === OWNER_EMAIL.toLowerCase());
    
    if (!owner) {
      console.error(`❌ Owner email ${OWNER_EMAIL} not found in Supabase Auth`);
      console.log('📝 Please sign up with this email first');
      return;
    }

    console.log(`✅ Found owner: ${owner.email} (ID: ${owner.id})`);

    // 2. Update users table with max tier
    const { error: userUpdateError } = await supabase
      .from('users')
      .upsert({
        id: owner.id,
        email: owner.email,
        payment_tier: 'OWNER',
        tier_updated_at: new Date().toISOString(),
        payment_status: 'owner',
        amount_paid: 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (userUpdateError) {
      console.error('⚠️ Error updating users table:', userUpdateError.message);
    } else {
      console.log('✅ Updated users table with OWNER tier');
    }

    console.log('\n🎉 Owner access granted successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Log in with', OWNER_EMAIL);
    console.log('   2. All paywalls should be removed');
    console.log('   3. All features should be unlocked\n');
    console.log('💡 If paywalls still appear:');
    console.log('   - Clear browser localStorage');
    console.log('   - Log out and log back in');
    console.log('   - Hard refresh (Ctrl+Shift+R)\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

grantOwnerAccess();
