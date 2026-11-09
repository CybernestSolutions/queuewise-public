// Fails if electron/updater.js differs between QueueWise apps. Usage: node scripts/check-updater-sync.js <other updater.js>...
const fs = require('fs');
const mine = fs.readFileSync(require('path').join(__dirname, '../electron/updater.js'));
const bad = process.argv.slice(2).filter((p) => !fs.readFileSync(p).equals(mine));
if (bad.length) { console.error('Out of sync:', bad.join(', ')); process.exit(1); }
console.log('updater.js in sync');
