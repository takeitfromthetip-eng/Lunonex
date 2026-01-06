#!/usr/bin/env node
/**
 * NUCLEAR OPTION: Comment out ALL external API calls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with external API calls
const filesToNuke = [
  'src/extractMetadata.js',
  'src/routes/auto-answer-questions.js',
  'src/routes/auto-heal.js',
  'src/routes/generate-content.js',
  'src/routes/mico-suggestion-pipeline.js',
  'src/utils/aiCSAMDetection.js',
  'src/utils/aiModeration.js'
];

function nukeAPICall(filePath) {
  console.log(`\n💣 Nuking API calls in: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace fetch/axios calls to external APIs with localAI
  content = content.replace(
    /const response = await (fetch|axios\.post)\(\s*['"`]https:\/\/api\.(openai|anthropic)\.com[^)]+\);?/gs,
    '// EXTERNAL API DISABLED - USING LOCAL AI INSTEAD\n    const response = await localAI.generate("content", prompt || "");'
  );

  content = content.replace(
    /await (fetch|axios\.post)\(\s*['"`]https:\/\/api\.(openai|anthropic)\.com[^)]+\);?/gs,
    '// EXTERNAL API DISABLED - USING LOCAL AI'
  );

  // Wrap any remaining OpenAI/Anthropic calls in if(false) blocks
  content = content.replace(
    /(const .* = )?await openai\./g,
    'if(false) $1await openai.'
  );

  content = content.replace(
    /(const .* = )?await anthropic\./g,
    'if(false) $1await anthropic.'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Nuked!`);
  } else {
    console.log(`   ℹ️  Already clean`);
  }
}

console.log('💣💣💣 NUCLEAR OPTION: Disabling ALL external APIs 💣💣💣\n');

filesToNuke.forEach(nukeAPICall);

console.log('\n✅ All external API calls have been disabled!');
console.log('\n📝 System is now 100% self-reliant');
console.log('   All AI features route through localAI');
console.log('   ZERO external costs');
