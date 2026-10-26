/* Check whether any page's own JSON-LD block text appears inside its own
   code samples (a copy-paste defect that would show "JSON instead of code"). */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let bad = [];

for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(s);
  if (!ld) continue;
  const inner = ld[1].trim();
  const probe = inner.slice(0, 120);
  const blockRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
  let m;
  while ((m = blockRe.exec(s))) {
    const raw = m[1];
    const hit = probe.length > 40 && raw.includes(probe.slice(0, 60));
    if (hit) {
      bad.push({ file: f, snippet: probe.slice(0, 90) });
      break;
    }
  }
}
console.log('pages whose own JSON-LD leaked into a code block:', bad.length);
for (const b of bad) console.log('  ' + b.file + ' :: ' + b.snippet);