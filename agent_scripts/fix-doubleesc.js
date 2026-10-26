'use strict';
/*
 fix-doubleesc.js — repair the two REAL double-escape defects (not the
 deliberate "escaped output" demonstrations):

   cpp-programming.html : #include &amp;lt;string&amp;gt;  ->  #include &lt;string&gt;
                           #include &amp;lt;vector&amp;gt;   ->  #include &lt;vector&gt;
   go-programming.html  : &amp;lt;-sig                  ->  &lt;-sig

 Every replacement is asserted: the exact byte count must move by the amount
 the edits imply, and no &amp;lt;/&amp;amp; may be created.

   node fix-doubleesc.js [--write]
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const write = process.argv.includes('--write');

const EDITS = [
  { file: 'cpp-programming.html', from: '#include &amp;lt;string&amp;gt;', to: '#include &lt;string&gt;' },
  { file: 'cpp-programming.html', from: '#include &amp;lt;vector&amp;gt;', to: '#include &lt;vector&gt;' },
  { file: 'go-programming.html', from: '&amp;lt;-sig', to: '&lt;-sig' },
];

for (const e of EDITS) {
  const abs = path.join(ROOT, e.file);
  const src = fs.readFileSync(abs, 'utf8');
  const n = src.split(e.from).length - 1;
  if (n !== 1) { console.error('refuse: ' + e.file + ' expected 1 occurrence of ' + JSON.stringify(e.from) + ', found ' + n); process.exit(2); }
  const out = src.replace(e.from, e.to);
  const delta = out.length - src.length;
  const expect = (e.to.length - e.from.length);
  if (delta !== expect) { console.error('refuse: ' + e.file + ' byte delta ' + delta + ' != ' + expect); process.exit(3); }
  const bad = (t) => (t.match(/&amp;(amp|lt);/g) || []).length;
  if (bad(out) > bad(src)) { console.error('refuse: ' + e.file + ' created a double escape'); process.exit(4); }
  console.log(e.file + ': ' + JSON.stringify(e.from) + ' -> ' + JSON.stringify(e.to) + '  (' + delta + ' bytes)');
  if (!write) continue;
  const bak = path.join(ROOT, 'build', 'bak', 'doubleesc');
  fs.mkdirSync(bak, { recursive: true });
  fs.writeFileSync(path.join(bak, e.file + '.pre-doubleesc'), src);
  fs.writeFileSync(abs, out);
}
console.log(write ? 'written' : '(dry run)');
