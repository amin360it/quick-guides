/* Look for JSON-LD-type content leaked inside code blocks, plus any code block
   that looks like a JSON data dump rather than a config/code sample. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

const blockRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;

function unescape(h) {
  return h.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

const leaks = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  let m;
  while ((m = blockRe.exec(s))) {
    const text = unescape(m[1]);
    if (/@context|"@graph"|application\/ld\+json|schema\.org/.test(text)) {
      leaks.push({ file: f, snippet: text.slice(0, 140) });
    }
  }
}
console.log('code blocks containing JSON-LD markers:', leaks.length);
for (const l of leaks) console.log('  ' + l.file + ' :: ' + l.snippet.replace(/\s+/g, ' '));