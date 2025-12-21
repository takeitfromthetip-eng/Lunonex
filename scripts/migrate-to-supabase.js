/**
 * Migration Helper: Convert Mock Data API Routes to Supabase
 * This script helps convert route files from in-memory arrays to Supabase queries
 *
 * Usage: node scripts/migrate-to-supabase.js <route-file>
 * Example: node scripts/migrate-to-supabase.js api/routes/posts.js
 */

const fs = require('fs');
const path = require('path');

const routeFile = process.argv[2];

if (!routeFile) {
  console.log('❌ No route file specified\n');
  console.log('Usage: node scripts/migrate-to-supabase.js <route-file>');
  console.log('Example: node scripts/migrate-to-supabase.js api/routes/posts.js\n');
  process.exit(1);
}

const fullPath = path.resolve(routeFile);

if (!fs.existsSync(fullPath)) {
  console.log(`❌ File not found: ${fullPath}\n`);
  process.exit(1);
}

console.log('🔄 SUPABASE MIGRATION HELPER\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`   File: ${routeFile}`);
console.log('');

// Read file
const content = fs.readFileSync(fullPath, 'utf-8');

// Check if already using Supabase
if (content.includes('supabaseServer') || content.includes('from(')) {
  console.log('✅ This file already uses Supabase!\n');
  console.log('📝 MANUAL REVIEW NEEDED:');
  console.log('   - Check if all routes are converted');
  console.log('   - Verify error handling');
  console.log('   - Test endpoints with Postman/curl\n');
  process.exit(0);
}

// Detect mock data patterns
const hasMockArrays = content.match(/const \w+ = \[\];/g);
const hasPushOperations = content.includes('.push(');
const hasFilterOperations = content.includes('.filter(');
const hasFindOperations = content.includes('.find(');

console.log('🔍 Analyzing file...\n');

if (hasMockArrays) {
  console.log(`   ✅ Found ${hasMockArrays.length} mock array(s)`);
  hasMockArrays.forEach(arr => console.log(`      ${arr}`));
} else {
  console.log('   ⚠️  No mock arrays detected');
}

console.log('');

if (hasPushOperations) {
  console.log('   ✅ Found .push() operations (CREATE operations)');
}
if (hasFilterOperations) {
  console.log('   ✅ Found .filter() operations (READ operations)');
}
if (hasFindOperations) {
  console.log('   ✅ Found .find() operations (READ operations)');
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 CONVERSION GUIDE\n');

// Provide conversion examples based on detected patterns
console.log('STEP 1: Add Supabase import at the top of the file:\n');
console.log('  const { supabase } = require(\'../lib/supabaseServer\');\n');
console.log('');

console.log('STEP 2: Convert operations:\n');

if (hasPushOperations) {
  console.log('  CREATE (array.push → Supabase insert):\n');
  console.log('  ❌ BEFORE:');
  console.log('     posts.push({ id: Date.now(), ...req.body });');
  console.log('     res.json(req.body);\n');
  console.log('  ✅ AFTER:');
  console.log('     const { data, error } = await supabase');
  console.log('       .from(\'posts\')');
  console.log('       .insert([req.body])');
  console.log('       .select()');
  console.log('       .single();');
  console.log('     if (error) throw error;');
  console.log('     res.json(data);\n');
}

if (hasFilterOperations) {
  console.log('  READ ALL (array.filter → Supabase select):\n');
  console.log('  ❌ BEFORE:');
  console.log('     const userPosts = posts.filter(p => p.authorId === userId);');
  console.log('     res.json(userPosts);\n');
  console.log('  ✅ AFTER:');
  console.log('     const { data, error } = await supabase');
  console.log('       .from(\'posts\')');
  console.log('       .select(\'*\')');
  console.log('       .eq(\'author_id\', userId);');
  console.log('     if (error) throw error;');
  console.log('     res.json(data);\n');
}

if (hasFindOperations) {
  console.log('  READ ONE (array.find → Supabase select + single):\n');
  console.log('  ❌ BEFORE:');
  console.log('     const post = posts.find(p => p.id === postId);');
  console.log('     if (!post) return res.status(404).json({ error: \'Not found\' });');
  console.log('     res.json(post);\n');
  console.log('  ✅ AFTER:');
  console.log('     const { data, error } = await supabase');
  console.log('       .from(\'posts\')');
  console.log('       .select(\'*\')');
  console.log('       .eq(\'id\', postId)');
  console.log('       .single();');
  console.log('     if (error) return res.status(404).json({ error: \'Not found\' });');
  console.log('     res.json(data);\n');
}

console.log('  UPDATE (array mutation → Supabase update):\n');
console.log('  ❌ BEFORE:');
console.log('     const post = posts.find(p => p.id === postId);');
console.log('     post.likes++;\n');
console.log('  ✅ AFTER:');
console.log('     const { error } = await supabase');
console.log('       .from(\'posts\')');
console.log('       .update({ likes: supabase.sql`likes + 1` })');
console.log('       .eq(\'id\', postId);\n');

console.log('  DELETE (array.filter → Supabase delete):\n');
console.log('  ❌ BEFORE:');
console.log('     posts = posts.filter(p => p.id !== postId);');
console.log('     res.json({ success: true });\n');
console.log('  ✅ AFTER:');
console.log('     const { error } = await supabase');
console.log('       .from(\'posts\')');
console.log('       .delete()');
console.log('       .eq(\'id\', postId);');
console.log('     if (error) throw error;');
console.log('     res.json({ success: true });\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 COMMON SUPABASE PATTERNS\n');

console.log('1. SELECT with JOIN (get post with author info):');
console.log('   const { data } = await supabase');
console.log('     .from(\'posts\')');
console.log('     .select(`');
console.log('       *,');
console.log('       author:users(id, email, display_name, avatar_url)');
console.log('     `)');
console.log('     .eq(\'id\', postId)');
console.log('     .single();\n');

console.log('2. SELECT with FILTER (where clause):');
console.log('   .eq(\'column\', value)      → WHERE column = value');
console.log('   .neq(\'column\', value)     → WHERE column != value');
console.log('   .gt(\'column\', value)      → WHERE column > value');
console.log('   .gte(\'column\', value)     → WHERE column >= value');
console.log('   .lt(\'column\', value)      → WHERE column < value');
console.log('   .lte(\'column\', value)     → WHERE column <= value');
console.log('   .like(\'column\', \'%val%\')  → WHERE column LIKE \'%val%\'');
console.log('   .in(\'column\', [1, 2, 3]) → WHERE column IN (1, 2, 3)\n');

console.log('3. SELECT with PAGINATION:');
console.log('   const { data } = await supabase');
console.log('     .from(\'posts\')');
console.log('     .select(\'*\')');
console.log('     .order(\'created_at\', { ascending: false })');
console.log('     .range(0, 19);  // First 20 items (0-19)\n');

console.log('4. SELECT with COUNT:');
console.log('   const { count } = await supabase');
console.log('     .from(\'posts\')');
console.log('     .select(\'*\', { count: \'exact\', head: true });');
console.log('   // Returns count without fetching data\n');

console.log('5. UPSERT (insert or update):');
console.log('   const { data } = await supabase');
console.log('     .from(\'post_likes\')');
console.log('     .upsert({ post_id: postId, user_id: userId })');
console.log('     .select();\n');

console.log('6. RPC (call database function):');
console.log('   const { data } = await supabase');
console.log('     .rpc(\'get_user_feed\', {');
console.log('       user_uuid: userId,');
console.log('       page_limit: 20,');
console.log('       page_offset: 0');
console.log('     });\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  IMPORTANT NOTES\n');

console.log('1. ASYNC/AWAIT REQUIRED:');
console.log('   All route handlers must be async:');
console.log('   router.get(\'/path\', async (req, res) => { ... });\n');

console.log('2. ERROR HANDLING:');
console.log('   Always check for errors:');
console.log('   if (error) {');
console.log('     console.error(\'DB Error:\', error);');
console.log('     return res.status(500).json({ error: error.message });');
console.log('   }\n');

console.log('3. COLUMN NAMING:');
console.log('   Database uses snake_case (author_id)');
console.log('   JavaScript uses camelCase (authorId)');
console.log('   Convert between them in your code\n');

console.log('4. AUTHENTICATION:');
console.log('   Get user ID from JWT token:');
console.log('   const { userId } = req.user;  // Set by authenticateToken middleware\n');

console.log('5. TESTING:');
console.log('   After conversion, test with:');
console.log('   - curl commands');
console.log('   - Postman');
console.log('   - node test-api-health.js\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📚 REFERENCE DOCUMENTATION\n');

console.log('   Supabase JS Docs: https://supabase.com/docs/reference/javascript');
console.log('   Full Guide: SUPABASE_DATABASE_SETUP.md');
console.log('   Example Conversion: See comments in api/routes/posts.js\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ READY TO CONVERT\n');

console.log('📝 NEXT STEPS:');
console.log(`   1. Open ${routeFile} in your editor`);
console.log('   2. Add Supabase import at the top');
console.log('   3. Convert each route handler to use Supabase');
console.log('   4. Test with: node test-api-health.js');
console.log('   5. Move to next route file\n');

console.log('💡 Tip: Start with simple routes (GET) before complex ones (POST/DELETE)\n');
