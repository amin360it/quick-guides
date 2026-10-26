'use strict';
/*
 fix-anatomy.js — escape the one code sample in package-publishing.html that
 shows the section markup literally, and therefore contains code-block
 delimiters as content. A regex cannot find its end, so the boundaries are
 found positionally between its opening line and the <ul> that follows.

   node fix-anatomy.js [--write]
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILE = 'package-publishing.html';
const abs = path.join(ROOT, FILE);
const src = fs.readFileSync(abs, 'utf8');
const write = process.argv.includes('--write');

const KEY = '// the anatomy of a section';
const OPEN = '<div class="codeWrap"><pre><code>';
const CLOSE = '</code></pre></div>';

const n = (t, needle) => t.split(needle).length - 1;
if (n(src, KEY) !== 1) { console.error('refuse: expected exactly one "' + KEY + '"'); process.exit(2); }

const at = src.indexOf(KEY);
const openAt = src.lastIndexOf(OPEN, at);
if (openAt < 0) { console.error('refuse: no block open before the sample'); process.exit(3); }
const bodyStart = openAt + OPEN.length;
const nextUl = src.indexOf('\n    <ul>', bodyStart);
if (nextUl < 0) { console.error('refuse: no <ul> after the sample'); process.exit(4); }
const bodyEnd = src.lastIndexOf(CLOSE, nextUl);
if (bodyEnd < bodyStart) { console.error('refuse: no block close after the sample'); process.exit(5); }

const body = src.slice(bodyStart, bodyEnd);
if (!body.includes(OPEN)) { console.error('refuse: the sample does not contain a nested block after all'); process.exit(6); }

const esc = (b) => b
  .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
  .replace(/</g, '&lt;');
const escaped = esc(body);
const out = src.slice(0, bodyStart) + escaped + src.slice(bodyEnd);

const bad = (t) => n(t, '&amp;lt;') + n(t, '&amp;amp;');
console.log(FILE + ': body ' + body.length + ' -> ' + escaped.length + ' chars | bytes ' + src.length + ' -> ' + out.length + ' | raw `<` left in body ' + n(escaped, '&lt;') + ' escaped');
if (out.length <= src.length) { console.error('refuse: file did not grow'); process.exit(7); }
if (bad(out) !== bad(src)) { console.error('refuse: double-escape count changed'); process.exit(8); }
if (n(out, OPEN) !== n(src, OPEN) - 1) { console.error('refuse: expected exactly one literal block-open to disappear'); process.exit(9); }

if (!write) { console.log('(dry run)'); process.exit(0); }
const bak = path.join(ROOT, 'build', 'bak', 'codeesc');
fs.mkdirSync(bak, { recursive: true });
fs.writeFileSync(path.join(bak, FILE + '.pre-anatomy'), src);
fs.writeFileSync(abs, out);
console.log('wrote ' + FILE);
