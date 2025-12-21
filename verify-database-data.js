/**
 * Direct Database Verification Test
 * Verifies posts are actually stored in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyDatabase() {
  console.log('\n🔍 DIRECT DATABASE VERIFICATION\n');
  console.log('='.repeat(60));

  // 1. Check how many posts exist
  const { data: posts, error: postsError, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' });

  if (postsError) {
    console.log('❌ Error querying posts:', postsError.message);
    return false;
  }

  console.log(`\n📊 Total posts in database: ${count}`);

  if (posts && posts.length > 0) {
    console.log('\n✅ POSTS FOUND IN DATABASE:');
    posts.forEach((post, i) => {
      console.log(`\n  Post #${i + 1}:`);
      console.log(`    ID: ${post.id}`);
      console.log(`    User: ${post.user_id}`);
      console.log(`    Content: ${post.content.substring(0, 100)}...`);
      console.log(`    Created: ${post.created_at}`);
      console.log(`    Likes: ${post.likes_count}`);
    });
  } else {
    console.log('\n⚠️  No posts found in database');
  }

  // 2. Check profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError) {
    console.log('\n❌ Error querying profiles:', profilesError.message);
    return false;
  }

  console.log(`\n👥 Total profiles in database: ${profiles.length}`);
  if (profiles.length > 0) {
    console.log('\n✅ PROFILES FOUND:');
    profiles.forEach((profile, i) => {
      console.log(`  ${i + 1}. ${profile.username} (${profile.id})`);
    });
  }

  // 3. Check likes
  const { data: likes, error: likesError } = await supabase
    .from('likes')
    .select('*');

  if (!likesError) {
    console.log(`\n❤️  Total likes in database: ${likes.length}`);
  }

  // 4. Check follows
  const { data: follows, error: followsError } = await supabase
    .from('follows')
    .select('*');

  if (!followsError) {
    console.log(`👥 Total follows in database: ${follows.length}`);
  }

  // 5. Check saves
  const { data: saves, error: savesError } = await supabase
    .from('saves')
    .select('*');

  if (!savesError) {
    console.log(`🔖 Total saves in database: ${saves.length}`);
  }

  console.log('\n' + '='.repeat(60));

  // Summary
  const hasData = count > 0 || profiles.length > 0;
  if (hasData) {
    console.log('\n✅ DATABASE IS POPULATED AND WORKING!\n');
    return true;
  } else {
    console.log('\n⚠️  Database tables exist but are empty\n');
    return false;
  }
}

verifyDatabase().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
