// Structural check for guide body fragments in build/newguides/.
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '..', 'build', 'newguides');
if (!fs.existsSync(DIR)) { console.log('no fragments yet'); process.exit(0); }
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.main.html')).sort();
const want = ['nodejs', 'bun', 'docker-compose', 'fontawesome-icons', 'java', 'n8n', 'chatgpt', 'midjourney', 'claude'];
const have = new Set(files.map((f) => f.replace('.main.html', '')));
console.log('present:', files.length, '| missing:', want.filter((w) => !have.has(w)).join(', ') || '(none)');
console.log('');
let totalCode = 0;
const idsAll = new Map();
for (const f of files) {
  const s = fs.readFileSync(path.join(DIR, f), 'utf8');
  const sec = (s.match(/<section class="chapter">/g) || []).length;
  const h3 = (s.match(/<h3 id=/g) || []).length;
  const h4 = (s.match(/<h4/g) || []).length;
  const cw = (s.match(/class="codeWrap"/g) || []).length;
  const doubleEsc = (s.match(/&amp;(amp|lt|gt|quot|middot);/g) || []).length;
  const bareLt = (s.match(/<(?!\/?(?:h[234]|p|div|span|a|ul|li|ol|table|thead|tbody|tr|th|td|code|pre|strong|em|b|i|br|section|button|svg|path|circle|use|figure|figcaption|img|blockquote|nav|main|article|aside|header|footer|script|style|h1|h5|h6|input|label|select|option|textarea|dl|dt|dd|hr|small|sup|sub|abbr|kbd|var|samp|mark|time|iframe|form|fieldset|legend)\b)/g) || []).length;
  // malformed: an <h3 ...> whose next heading-close is </h4>
  const malformed = (s.match(/<h3[^>]*>(?:(?!<\/h[34]>)[\s\S])*?<\/h4>/g) || []).length;
  const secIds = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  for (const id of secIds) idsAll.set(id, (idsAll.get(id) || 0) + 1);
  totalCode += cw;
  console.log(
    f.replace('.main.html', '').padEnd(18),
    'sec=' + String(sec).padStart(2),
    'h3=' + String(h3).padStart(3),
    'h4=' + String(h4).padStart(3),
    'code=' + String(cw).padStart(3),
    '| malformedH3=' + malformed,
    'doubleEsc=' + doubleEsc,
    'bareLt=' + bareLt
  );
}
const dups = [...idsAll.entries()].filter(([, n]) => n > 1);
console.log('\ntotal code samples:', totalCode);
console.log('duplicate ids:', dups.length ? dups.map(([id, n]) => id + '(' + n + ')').join(', ') : '(none)');
