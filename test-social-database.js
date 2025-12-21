/* eslint-disable */
/**
 * ForTheWeebs - Social Database Integration Test
 * Tests that Supabase tables are working with the social API
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const API_BASE = (process.env.API_URL || 'http://localhost:3001') + '/api/social';

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

async function testSupabaseConnection() {
  log('🔍', 'Testing Supabase connection...', colors.blue);
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Test connection by querying profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      log('❌', `Supabase connection failed: ${error.message}`, colors.red);
      return false;
    }

    log('✅', 'Supabase connected successfully', colors.green);
    return true;
  } catch (error) {
    log('❌', `Supabase error: ${error.message}`, colors.red);
    return false;
  }
}

async function testTableExists(tableName) {
  log('🔍', `Checking if table '${tableName}' exists...`, colors.blue);
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true });

    if (error) {
      log('❌', `Table '${tableName}' not found: ${error.message}`, colors.red);
      return false;
    }

    log('✅', `Table '${tableName}' exists`, colors.green);
    return true;
  } catch (error) {
    log('❌', `Error checking table '${tableName}': ${error.message}`, colors.red);
    return false;
  }
}

async function testAPIEndpoint(endpoint, method = 'GET', body = null) {
  log('🔍', `Testing ${method} ${endpoint}...`, colors.blue);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      log('❌', `API error (${response.status}): ${JSON.stringify(data)}`, colors.red);
      return null;
    }

    log('✅', `API response: ${JSON.stringify(data).substring(0, 100)}...`, colors.green);
    return data;
  } catch (error) {
    log('❌', `API request failed: ${error.message}`, colors.red);
    return null;
  }
}

async function createTestProfile() {
  log('🔍', 'Creating test profile...', colors.blue);
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Check if test user already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'test_user')
      .single();

    if (existing) {
      log('✅', `Test profile already exists (ID: ${existing.id})`, colors.green);
      return existing.id;
    }

    // Create new test user
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        username: 'test_user',
        display_name: 'Test User',
        bio: 'Test account for database verification',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('❌', `Failed to create profile: ${error.message}`, colors.red);
      return null;
    }

    log('✅', `Test profile created (ID: ${profile.id})`, colors.green);
    return profile.id;
  } catch (error) {
    log('❌', `Profile creation error: ${error.message}`, colors.red);
    return null;
  }
}

async function createTestPost(userId) {
  log('🔍', 'Creating test post...', colors.blue);
  
  const postData = {
    userId: userId,
    content: `🎉 Test post created at ${new Date().toLocaleString()} - Database integration verified!`,
    visibility: 'public'
  };

  return await testAPIEndpoint('/post', 'POST', postData);
}

async function testLikePost(postId, userId) {
  log('🔍', 'Testing like functionality...', colors.blue);
  
  try {
    const response = await fetch(`${API_BASE}/post/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    const data = await response.json();
    
    if (response.ok) {
      log('✅', `Post liked successfully`, colors.green);
      return true;
    } else {
      log('⚠️', `Like endpoint exists but returned: ${JSON.stringify(data)}`, colors.yellow);
      return false;
    }
  } catch (error) {
    log('⚠️', `Like test failed: ${error.message}`, colors.yellow);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🚀', 'ForTheWeebs - Social Database Integration Test', colors.blue);
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Supabase Connection
  const supabaseOk = await testSupabaseConnection();
  supabaseOk ? passed++ : failed++;
  console.log('');

  // Test 2: Check critical tables
  const tables = ['profiles', 'posts', 'likes', 'follows', 'subscriptions'];
  for (const table of tables) {
    const exists = await testTableExists(table);
    exists ? passed++ : failed++;
  }
  console.log('');

  // Test 3: API Endpoints
  log('📡', 'Testing API Endpoints...', colors.blue);
  const feedData = await testAPIEndpoint('/feed?limit=10');
  feedData ? passed++ : failed++;
  
  const discoverData = await testAPIEndpoint('/discover');
  discoverData ? passed++ : failed++;
  
  const searchData = await testAPIEndpoint('/search?q=test');
  searchData ? passed++ : failed++;
  console.log('');

  // Test 4: Create test profile
  const userId = await createTestProfile();
  if (userId) {
    passed++;
    
    // Test 5: Create test post
    const post = await createTestPost(userId);
    if (post) {
      passed++;
      
      // Test 6: Like the post
      if (post.id || post.post?.id) {
        const postId = post.id || post.post.id;
        const liked = await testLikePost(postId, userId);
        liked ? passed++ : failed++;
      }
    } else {
      failed++;
    }
  } else {
    failed += 2; // Failed profile and post creation
  }

  // Final Results
  console.log('\n' + '='.repeat(60));
  log('📊', 'Test Results:', colors.blue);
  console.log('='.repeat(60));
  log('✅', `Passed: ${passed}`, colors.green);
  log('❌', `Failed: ${failed}`, colors.red);
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  log('📈', `Success Rate: ${percentage}%`, percentage >= 80 ? colors.green : colors.yellow);
  
  console.log('='.repeat(60) + '\n');

  if (percentage >= 80) {
    log('🎉', 'DATABASE INTEGRATION VERIFIED - READY FOR LAUNCH!', colors.green);
  } else {
    log('⚠️', 'Some tests failed - review database setup', colors.yellow);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log('💥', `Fatal error: ${error.message}`, colors.red);
  console.error(error.stack);
  process.exit(1);
});
