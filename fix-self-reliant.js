#!/usr/bin/env node
/**
 * Mass fix all OpenAI/Anthropic dependencies to use localAI
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/routes/generate-content.js',
  'src/routes/auto-heal.js',
  'src/routes/auto-heal-autonomous.js',
  'src/routes/bug-reports.js',
  'src/routes/mico-suggest.js',
  'src/routes/mico-suggestion-pipeline.js',
  'src/routes/auto-answer-questions.js',
  'src/utils/aiCSAMDetection.js',
  'src/utils/aiModeration.js',
  'src/utils/legalComplianceChecker.js',
  'src/extractMetadata.js',
  'src/lib/promptToContent.ts'
];

const localAIImport = `const localAI = require('../../api/utils/localAI');`;

function fixFile(filePath) {
  console.log(`\n🔧 Fixing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found, skipping`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add localAI import if not present
  if (!content.includes('localAI')) {
    const firstImportIndex = content.indexOf('import ') || content.indexOf('const ') || content.indexOf('require(');
    if (firstImportIndex > -1) {
      const endOfLine = content.indexOf('\n', firstImportIndex);
      content = content.slice(0, endOfLine + 1) + localAIImport + '\n' + content.slice(endOfLine + 1);
      changed = true;
    }
  }

  // Replace OpenAI API checks with localAI fallback
  const openAIChecks = [
    {
      pattern: /if\s*\(!process\.env\.OPENAI_API_KEY\)/g,
      replacement: 'if (false) // localAI used instead'
    },
    {
      pattern: /if\s*\(process\.env\.OPENAI_API_KEY\)/g,
      replacement: 'if (true) // localAI always available'
    },
    {
      pattern: /const\s+ANTHROPIC_API_KEY\s*=\s*process\.env\.ANTHROPIC_API_KEY;?/g,
      replacement: 'const ANTHROPIC_API_KEY = "local-ai"; // Using localAI'
    },
    {
      pattern: /const\s+anthropicKey\s*=\s*process\.env\.ANTHROPIC_API_KEY;?/g,
      replacement: 'const anthropicKey = "local-ai"; // Using localAI'
    }
  ];

  openAIChecks.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  });

  // Comment out axios calls to external APIs
  if (content.includes('api.openai.com') || content.includes('api.anthropic.com')) {
    console.log(`   ⚠️  Contains external API calls - manual review needed`);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Fixed`);
  } else {
    console.log(`   ℹ️  No changes needed`);
  }
}

console.log('🚀 Starting self-reliant AI migration...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ All files processed!');
console.log('\n⚠️  MANUAL REVIEW REQUIRED:');
console.log('   - Check files with external API calls');
console.log('   - Test all AI features');
console.log('   - Verify localAI imports are correct');
