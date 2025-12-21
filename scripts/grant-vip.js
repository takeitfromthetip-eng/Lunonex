// Grant VIP Access Script
// Run with: node scripts/grant-vip.js shellymontoya82@gmail.com

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Need: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantVIP(email) {
  if (!email) {
    console.error('❌ Please provide an email address');
    console.error('Usage: node scripts/grant-vip.js user@example.com');
    process.exit(1);
  }

  console.log(`🔍 Checking user: ${email}`);

  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching user:', fetchError.message);
      process.exit(1);
    }

    if (existingUser) {
      console.log('✅ User found, upgrading to platinum tier (VIP)...');
      console.log('Current user data:', existingUser);
      
      // Update existing user to platinum (highest tier = VIP)
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          tier: 'platinum',
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        process.exit(1);
      }

      console.log('✅ Successfully granted VIP access (platinum tier)!');
      console.log('User:', updated);
    } else {
      console.log('ℹ️  User not found, creating new user with platinum tier (VIP)...');
      
      // Create new user with platinum tier
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          tier: 'platinum',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        console.error('Full error:', createError);
        process.exit(1);
      }

      console.log('✅ Successfully created VIP user (platinum tier)!');
      console.log('User:', newUser);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
grantVIP(email);
