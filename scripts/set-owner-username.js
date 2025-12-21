/* eslint-disable */
// Set owner username to 'polotuspossumus'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setOwnerUsername() {
  const OWNER_EMAIL = 'polotuspossumus@gmail.com';
  const USERNAME = 'polotuspossumus';

  console.log('🔍 Finding owner account...');
  
  // First check if username is already taken
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('username', USERNAME)
    .single();

  if (existingUser && existingUser.email !== OWNER_EMAIL) {
    console.error('❌ Username already taken by another user:', existingUser.email);
    return;
  }

  // Update owner username
  const { data, error } = await supabase
    .from('users')
    .update({ username: USERNAME })
    .eq('email', OWNER_EMAIL);

  if (error) {
    console.error('❌ Error updating username:', error);
    return;
  }

  console.log('✅ Owner username set to:', USERNAME);
  
  // Verify the update
  const { data: verify } = await supabase
    .from('users')
    .select('email, username')
    .eq('email', OWNER_EMAIL)
    .single();

  if (verify) {
    console.log('✅ Verified:', verify);
  }
}

setOwnerUsername().catch(console.error);
