/* Scan every guide for <div class="codeWrap"><pre><code> blocks whose content is
   pure JSON (or a JSON array) rather than code. Reports a sample of matches. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

function unescape(h) {
  return h
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

const blockRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let totalBlocks = 0;
const hits = [];

for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  let m;
  while ((m = blockRe.exec(s))) {
    totalBlocks++;
    const raw = m[1];
    const text = unescape(raw).trim();
    if (text.length < 4) continue;
    // must start with { or [ to be JSON-shaped
    if (text[0] !== '{' && text[0] !== '[') continue;
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { /* not JSON */ }
    if (parsed === null) continue;
    // pure JSON object/array with no obvious keywords
    const looksLikeData =
      /^\{|^\[/.test(text) &&
      !/\b(function|const|let|var|return|def |class |import |export |SELECT|INSERT|UPDATE|CREATE)\b/.test(text);
    if (looksLikeData) {
      const idx = s.indexOf(m[0]);
      const before = s.slice(Math.max(0, idx - 200), idx);
      const after = s.slice(idx + m[0].length, idx + m[0].length + 200);
      hits.push({ file: f, block: text.slice(0, 120), before: before.replace(/\s+/g, ' ').slice(-120), after: after.replace(/\s+/g, ' ').slice(0, 120) });
    }
  }
}

console.log('total code blocks:', totalBlocks);
console.log('JSON-only blocks found:', hits.length);
for (const h of hits.slice(0, 60)) {
  console.log('\n---', h.file);
  console.log('BEFORE:', h.before);
  console.log('BLOCK :', h.block);
  console.log('AFTER :', h.after);
}