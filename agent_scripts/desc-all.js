// Report every page's title/description lengths and flag anything off-spec:
// browserTitle 20-65 chars, description 148-156 chars.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS = new Set(['favorites.html', 'test.html', 'search.html']);
const pages = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && !ARTIFACTS.has(f) && !/\.bak$/.test(f))
  .sort();

let bad = 0;
for (const f of pages) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const head = s.slice(0, s.indexOf('</head>'));
  const t = (head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const d = (head.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';
  const td = t.trim().length;
  const dl = d.length;
  const tOk = td >= 20 && td <= 65;
  const dOk = dl >= 148 && dl <= 156;
  if (!tOk || !dOk) {
    bad++;
    console.log(
      `${!tOk ? 'TITLE ' : '      '}${!dOk ? 'DESC ' : '     '}${f.padEnd(44)} t=${td}${tOk ? '' : '!'}  d=${dl}${dOk ? '' : '!'}`
    );
  }
}
console.log(`\n${pages.length} pages | off-spec: ${bad}`);
