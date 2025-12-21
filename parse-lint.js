const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lint-output.json', 'utf-8'));
data.filter(f => f.errorCount > 0).forEach(f => {
  console.log(`${f.filePath} - ${f.errorCount} errors`);
  f.messages.filter(m => m.severity === 2).forEach(m => {
    console.log(`  Line ${m.line}: ${m.message} (${m.ruleId})`);
  });
  console.log('');
});
