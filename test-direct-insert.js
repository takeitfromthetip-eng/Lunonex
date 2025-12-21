/**
 * Direct Post Insertion Test
 * Try to insert a post directly into Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testDirectInsert() {
  console.log('\n🔍 DIRECT POST INSERTION TEST\n');

  const postData = {
    author_id: 'c81cfb58-6006-495c-81b8-1adbe1366472', // Schema uses author_id
    content: 'Direct insertion test - SCHEMA FIXED!',
    visibility: 'PUBLIC', // Schema expects uppercase
    media_urls: [], // Schema uses array
    created_at: new Date().toISOString(),
    likes: 0, // Schema uses 'likes' not 'likes_count'
    comments_count: 0,
    shares: 0, // Schema uses 'shares' not 'shares_count'
    views: 0
  };

  console.log('Attempting to insert post:', JSON.stringify(postData, null, 2));

  const { data, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.log('\n❌ INSERT FAILED:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Error details:', JSON.stringify(error, null, 2));
    return false;
  }

  console.log('\n✅ POST INSERTED SUCCESSFULLY!');
  console.log('Post ID:', data.id);
  console.log('Full post:', JSON.stringify(data, null, 2));

  // Verify it's in the database
  const { data: verification } = await supabase
    .from('posts')
    .select('*')
    .eq('id', data.id)
    .single();

  if (verification) {
    console.log('\n✅ POST VERIFIED IN DATABASE!');
    return true;
  } else {
    console.log('\n❌ POST NOT FOUND IN DATABASE AFTER INSERT!');
    return false;
  }
}

testDirectInsert().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
