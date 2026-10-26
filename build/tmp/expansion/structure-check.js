const fs = require('fs');
const src = fs.readFileSync('package-publishing.html', 'utf8');
const roi = src.slice(src.indexOf('<h2 id="ch5"'), src.indexOf('<h2 id="ch9"'));
const count = (s, re) => (s.match(re) || []).length;
const checks = {
  'codeWrap open': count(roi, /<div class="codeWrap">/g),
  'codeWrap close': count(roi, /<\/code><\/pre><\/div>/g),
  'h4 open': count(roi, /<h4[ >]/g),
  'h4 close': count(roi, /<\/h4>/g),
  'p open': count(roi, /<p[ >]/g),
  'p close': count(roi, /<\/p>/g),
  'code inline open': count(roi, /<code>/g),
  'code inline close': count(roi, /<\/code>/g),
  'tip/warn/note': count(roi, /<div class="(tip|warn|note)">/g),
  'section close': count(roi, /<\/section>/g),
};
for (const [k, v] of Object.entries(checks)) console.log(k.padEnd(20), v);

// stack balance ignoring code blocks and inline code
const stripped = roi.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '')
                     .replace(/<code>[\s\S]*?<\/code>/g, '');
const voids = new Set(['br', 'img', 'hr', 'input', 'meta', 'link']);
const stack = [];
let m;
const tagRe = /<\/?([a-zA-Z0-9]+)[^>]*?(\/?)>/g;
let bad = 0;
while ((m = tagRe.exec(stripped)) !== null) {
  const closing = m[0][1] === '/';
  const name = m[1].toLowerCase();
  if (voids.has(name) || m[2] === '/') continue;
  if (!closing) stack.push(name);
  else {
    const top = stack.pop();
    if (top !== name) { console.log(`TAG MISMATCH: </${name}> closes <${top}>`); bad++; if (bad > 10) break; }
  }
}
console.log('unclosed at end:', JSON.stringify(stack));
console.log(bad === 0 && stack.length === 0 ? 'STRUCTURE OK' : 'STRUCTURE PROBLEMS');
