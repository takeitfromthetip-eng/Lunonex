const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ALL ESLint warnings...\n');

// Read lint output
const data = JSON.parse(fs.readFileSync('lint-output.json', 'utf8'));

let fixedFiles = 0;
let removedVars = 0;

data.forEach(file => {
  if (file.warningCount === 0) return;

  const filePath = file.filePath;
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  const unusedVars = file.messages.filter(m => m.ruleId === 'no-unused-vars');
  const undefs = file.messages.filter(m => m.ruleId === 'no-undef');

  // Sort by line number descending to avoid index issues
  const sortedMessages = [...unusedVars, ...undefs].sort((a, b) => b.line - a.line);

  sortedMessages.forEach(msg => {
    const lineIdx = msg.line - 1;
    const line = lines[lineIdx];

    if (msg.ruleId === 'no-unused-vars') {
      const varName = msg.message.match(/'([^']+)'/)[1];

      // Remove the unused variable declaration
      if (line.includes(`const ${varName}`) || line.includes(`let ${varName}`) || line.includes(`var ${varName}`)) {
        // Check if it's the only thing on the line
        if (line.trim().startsWith('const ') || line.trim().startsWith('let ') || line.trim().startsWith('var ')) {
          // Comment it out instead of removing
          lines[lineIdx] = line.replace(/^(\s*)/, '$1// ');
          modified = true;
          removedVars++;
        }
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    fixedFiles++;
    console.log(`✅ ${path.basename(filePath)}`);
  }
});

console.log(`\n✅ Fixed ${fixedFiles} files, commented out ${removedVars} unused variables`);
