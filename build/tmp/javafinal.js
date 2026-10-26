const fs = require('fs');
const path = require('path');

const parts = ['java.part1.html', 'java.part2.html', 'java.part3.html', 'java.part4.html']
  .map((f) => 'build/tmp/' + f);
const outPath = 'build/newguides/java.main.html';

const chunks = parts.map((p) => fs.readFileSync(p, 'utf8').trim());
// normalize trailing newline style: join with a single blank line
const body = chunks.join('\n\n');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, body + '\n', 'utf8');

// ---------- verification ----------
const t = fs.readFileSync(outPath, 'utf8');
const errs = [];
const sec = (re) => (t.match(re) || []).length;
const count = (re) => (t.match(re) || []).length;

const sections = count(/<section class="chapter">/g);
const sectionClose = count(/<\/section>/g);
const h3 = count(/<h3 /g);
const h4 = count(/<h4>/g) + count(/<h4 /g);
const codeOpen = count(/<code>/g);
const codeClose = count(/<\/code>/g);
const cw = count(/<div class="codeWrap"><pre><code>/g);
const tbOpen = count(/<table>/g);
const tbClose = count(/<\/table>/g);

console.log('sections', sections, 'close', sectionClose);
console.log('h3', h3, 'h4', h4, 'codeWrap', cw);
console.log('code', codeOpen, '/', codeClose);
console.log('table', tbOpen, '/', tbClose);
console.log('bytes', Buffer.byteLength(t, 'utf8'));

if (sections !== sectionClose) errs.push('section open/close mismatch');
if (codeOpen !== codeClose) errs.push('code open/close mismatch');
if (tbOpen !== tbClose) errs.push('table open/close mismatch');

// heading ids: collect from h2 + h3 (the only data-toc carriers)
const ids = [];
const idRe = /<(h2|h3)[^>]*\sid="([^"]+)"/g;
let m;
while ((m = idRe.exec(t))) ids.push(m[2]);
const seen = new Set();
for (const id of ids) {
  if (seen.has(id)) errs.push('duplicate id: ' + id);
  seen.add(id);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) errs.push('non-url-safe id: ' + id);
}
console.log('heading ids', ids.length, 'unique', seen.size);

// every data-toc heading is h2 or h3 only
const tocTags = new Set();
const tocRe = /<(h[1-6])[^>]*\sdata-toc/g;
while ((m = tocRe.exec(t))) tocTags.add(m[1]);
console.log('data-toc tags', [...tocTags].join(','));
if ([...tocTags].some((x) => x !== 'h2' && x !== 'h3')) errs.push('data-toc on non h2/h3');

// every h3 must have at least one h4 before the next h3/section close
const headRe = /<h3 [^>]*>|<\/section>/g;
const h3Positions = [];
const h4Positions = [];
let mm;
const re3 = /<h3 /g;
while ((mm = re3.exec(t))) h3Positions.push(mm.index);
const re4 = /<h4[ >]/g;
while ((mm = re4.exec(t))) h4Positions.push(mm.index);
h3Positions.forEach((pos, i) => {
  const next = i + 1 < h3Positions.length ? h3Positions[i + 1] : t.length;
  const has = h4Positions.some((p) => p > pos && p < next);
  if (!has) {
    const ln = t.slice(0, pos).split('\n').length;
    errs.push('h3 without h4 at line ' + ln + ': ' + t.slice(pos, pos + 70).replace(/\n/g, ' '));
  }
});

// raw uppercase after '<' means an unescaped generic or tag
const rawRe = /<[A-Z]/g;
while ((mm = rawRe.exec(t))) {
  const ln = t.slice(0, mm.index).split('\n').length;
  errs.push('unescaped <Upper at line ' + ln + ': ' + t.slice(mm.index - 30, mm.index + 40).replace(/\n/g, ' '));
}

// callout classes limited to tip/warn/note/ex
const callRe = /<(div|p) class="([^"]*)"/g;
const allowed = new Set(['tip', 'warn', 'note', 'ex', 'table-scroll']);
while ((mm = callRe.exec(t))) {
  for (const c of mm[2].split(/\s+/)) {
    if (c.startsWith('code') || c === 'topic-desc' || c === '') continue;
    if (!allowed.has(c)) errs.push('unexpected class "' + c + '" at line ' + t.slice(0, mm.index).split('\n').length);
  }
}

// escaped-entity sanity: no double escaping of < or &
for (const bad of ['&amp;lt;', '&amp;gt;', '&amp;amp;']) {
  const n = count(new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
  if (n) errs.push('double-escape ' + bad + ' x' + n);
}

// no page-level chrome leaked in
for (const bad of ['<!DOCTYPE', '<html', '<head', '<body', '<main', '<h1', 'id="sidebar"', '<footer', '<script']) {
  if (t.includes(bad)) errs.push('fragment contains page chrome: ' + bad);
}

if (errs.length) {
  console.log('FAIL');
  for (const e of errs) console.log('  - ' + e);
  process.exit(1);
}
console.log('OK');
