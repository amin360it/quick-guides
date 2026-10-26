const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
for (const file of ['index.html', 'topics.html', 'manifest.json']) {
  const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  console.log('==== ' + file + ' ====');
  const re = /\b\d[\d,]*(?:\s+(?:self-contained\s+)?(?:HTML\s+)?(?:offline\s+)?(?:developer\s+)?(?:guides?|chapters?|sub-sections?|linked topics|topics?|code samples?|exercise sets?|exercises?))\b/gi;
  const seen = new Map();
  let m;
  while ((m = re.exec(s)) !== null) {
    const key = m[0];
    if (!seen.has(key)) seen.set(key, 0);
    seen.set(key, seen.get(key) + 1);
  }
  for (const [k, v] of [...seen.entries()].sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(3), k);
  // also JSON-LD staircase
  const ld = s.match(/"numberOfItems":\d+/g);
  if (ld) console.log('   numberOfItems:', [...new Set(ld)].join(', '));
  const nt = s.match(/name":"[^"]*Offline Developer Guides"/g);
  if (nt) console.log('   title-ish:', [...new Set(nt)].join(', '));
  console.log();
}
