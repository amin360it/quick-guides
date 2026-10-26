const M = require('./guides-meta.js');
for (const [f, m] of Object.entries(M)) {
  const d = m.description;
  const flag = d.length >= 148 && d.length <= 156 ? 'OK ' : 'BAD';
  console.log(flag, String(d.length).padStart(3), f.padEnd(24), m.browserTitle.length, '|', m.browserTitle);
}
console.log('browserTitle must be 20-65 chars, description 148-156.');
