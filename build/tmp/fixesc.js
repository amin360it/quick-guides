// fixesc.js — escape stray < and & INSIDE codeWrap blocks only.
// Assertions: file grows, no < remains inside a code block, no &amp;lt; appears.
const fs = require('fs');
const path = process.argv[2];
const src = fs.readFileSync(path, 'utf8');

const ENTITY = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)|</g;

let blocks = 0;
let chars = 0;
const out = src.replace(
  /(<div class="codeWrap"><pre><code>)([\s\S]*?)(<\/code><\/pre><\/div>)/g,
  (_m, open, body, close) => {
    blocks++;
    const fixed = body.replace(ENTITY, (c) => {
      chars++;
      return c === '<' ? '&lt;' : '&amp;';
    });
    return open + fixed + close;
  }
);

if (/&amp;lt;/.test(out)) throw new Error('double escaping introduced');
if (out.length <= src.length) throw new Error('file did not grow');
if (chars === 0) throw new Error('no replacements made — pattern mismatch?');

// verify nothing stray remains inside code blocks
const check = [...out.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)];
for (const m of check) {
  if (/</.test(m[1])) throw new Error('literal < still inside a code block');
  const amp = m[1].match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/);
  if (amp) throw new Error('bare & still inside a code block');
}

fs.writeFileSync(path, out);
console.log(`blocks=${blocks} escaped_chars=${chars} bytes ${src.length} -> ${out.length}`);
