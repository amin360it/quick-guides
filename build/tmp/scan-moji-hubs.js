// Scan the two hubs (and their assets) for mojibake / replacement characters.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
for (const f of ['index.html', 'topics.html', 'assets/hub.js']) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  const bad = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0xFFFD || (c >= 0x80 && c <= 0x9F)) bad.push([i, c]);
  }
  const lines = [];
  for (const [i, c] of bad.slice(0, 200)) {
    lines.push(s.slice(0, i).split('\n').length);
  }
  const byLine = {};
  lines.forEach(l => (byLine[l] = (byLine[l] || 0) + 1));
  console.log(f, '| bad chars:', bad.length, '| lines:', JSON.stringify(byLine).slice(0, 400));
}
