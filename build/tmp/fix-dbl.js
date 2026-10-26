'use strict';
/* fix_dbl.js <files...>
   Un-double-escape entities inside canonical code blocks only.
   &amp;amp; -> &amp;   &amp;lt; -> &lt;   &amp;gt; -> &gt;   &amp;quot; -> &quot;
   Code samples are the only place a double escape is legitimate (a sample
   demonstrating escaped output writes it doubly), but these are real defects:
   a sample that outputs markup renders as literal "&amp;amp;" text. */
const fs = require('fs');

const OPEN = '<div class="codeWrap"><pre><code>';
const CLOSE = '</code></pre></div>';
const RE = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;

for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(f, 'utf8');
  const hits = [];
  let m;
  while ((m = RE.exec(s))) {
    const raw = m[1];
    if (/&amp;(amp|lt|gt|quot);/.test(raw)) {
      hits.push({ start: m.index + OPEN.length, len: raw.length, fixed:
        raw.replace(/&amp;amp;/g, '&amp;')
           .replace(/&amp;lt;/g, '&lt;')
           .replace(/&amp;gt;/g, '&gt;')
           .replace(/&amp;quot;/g, '&quot;') });
    }
  }
  if (!hits.length) { console.log(f + ' -> none'); continue; }
  let out = s;
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i];
    out = out.slice(0, h.start) + h.fixed + out.slice(h.start + h.len);
  }
  fs.writeFileSync(f, out);
  console.log(f + ' -> fixed ' + hits.length + ' block(s)');
}
