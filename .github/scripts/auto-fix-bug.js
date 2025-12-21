#!/usr/bin/env node
/**
 * Auto Bug Fixer
 * Reads GitHub issue, analyzes code, generates fix using Claude AI
 */

const fs = require('fs');
const path = require('path');
const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getIssueDetails(issueNumber) {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  return await response.json();
}

async function readProjectFiles() {
  const files = {};
  const srcPath = path.join(process.cwd(), 'src');

  function readDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        readDir(fullPath);
      } else if (entry.name.match(/\.(js|jsx|ts|tsx)$/)) {
        const relativePath = path.relative(process.cwd(), fullPath);
        files[relativePath] = fs.readFileSync(fullPath, 'utf8');
      }
    }
  }

  if (fs.existsSync(srcPath)) {
    readDir(srcPath);
  }

  return files;
}

async function analyzeBugAndFix(issueData, projectFiles) {
  const prompt = `You are an expert developer fixing a bug in a React application.

BUG REPORT:
Title: ${issueData.title}
Description: ${issueData.body}

PROJECT FILES:
${Object.entries(projectFiles).map(([path, content]) => `
=== ${path} ===
${content}
`).join('\n')}

TASK:
1. Analyze the bug report
2. Identify the root cause
3. Generate a fix by providing the EXACT file path and EXACT code changes
4. Return your response in this JSON format:

{
  "analysis": "Brief explanation of the bug",
  "fixes": [
    {
      "file": "relative/path/to/file.js",
      "changes": [
        {
          "action": "replace",
          "oldCode": "exact code to replace",
          "newCode": "exact new code"
        }
      ]
    }
  ]
}

Be precise with code changes. Use exact matches.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}

function applyFixes(fixData) {
  for (const fix of fixData.fixes) {
    const filePath = path.join(process.cwd(), fix.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    for (const change of fix.changes) {
      if (change.action === 'replace') {
        if (!content.includes(change.oldCode)) {
          console.log(`⚠️  Old code not found in ${fix.file}`);
          continue;
        }
        content = content.replace(change.oldCode, change.newCode);
        console.log(`✅ Fixed: ${fix.file}`);
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

async function main() {
  const issueNumber = process.argv[2];

  if (!issueNumber) {
    console.error('Usage: node auto-fix-bug.js <issue-number>');
    process.exit(1);
  }

  console.log(`🔍 Analyzing issue #${issueNumber}...`);

  const issueData = await getIssueDetails(issueNumber);
  console.log(`📋 Bug: ${issueData.title}`);

  const projectFiles = await readProjectFiles();
  console.log(`📂 Read ${Object.keys(projectFiles).length} project files`);

  console.log('🤖 Generating fix with Claude AI...');
  const fixData = await analyzeBugAndFix(issueData, projectFiles);

  console.log(`💡 Analysis: ${fixData.analysis}`);
  console.log(`🔧 Applying ${fixData.fixes.length} fixes...`);

  applyFixes(fixData);

  console.log('✅ Auto-fix complete!');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
