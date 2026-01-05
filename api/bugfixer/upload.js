const fs = require('fs');
const path = require('path');

function startNightlyUpload() {
  setInterval(() => {
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    if (fs.existsSync(artifactsDir)) {
      const files = fs.readdirSync(artifactsDir);
      console.log(`📤 Nightly artifact check: ${files.length} files`);
    }
  }, 86400000);
}

module.exports = { startNightlyUpload };
