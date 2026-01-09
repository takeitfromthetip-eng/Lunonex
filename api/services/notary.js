const fs = require('fs');
const path = require('path');

const ledgerPath = path.join(process.cwd(), 'artifacts', 'notary-ledger.json');

function notaryRecord(entry) {
  try {
    const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath)) : [];
    ledger.push({ ...entry, timestamp: new Date().toISOString() });
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
  } catch (error) {
    console.error('Notary record failed:', error);
  }
}

module.exports = { notaryRecord };
