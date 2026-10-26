var fs = require('fs');
var path = 'react.html';
var c = fs.readFileSync(path, 'utf8');
var before = c.length;

// Defect: one opener has a duplicated '<' -- "<div class="codeWrap"><<pre><code>".
// The browser sees a stray text node "<" before the <pre>, so this block loses
// its .codeWrap box. Unique string, so the targeted repair is safe.
var BROKEN = '<div class="codeWrap"><<pre><code>';
var FIXED  = '<div class="codeWrap"><pre><code>';

var n = c.split(BROKEN).length - 1;
console.log('occurrences of the doubled opener: ' + n);
if (n !== 1) { console.error('REFUSE: expected 1, found ' + n); process.exit(1); }

var out = c.replace(BROKEN, () => FIXED);   // function replacer (AGENTS.md rule)

var expected = before - 1;
console.log('expected: ' + expected + '  actual: ' + out.length);
if (out.length !== expected) { console.error('REFUSE: size mismatch'); process.exit(1); }

// invariants: every codeWrap div is now well-formed, counts balance
var OPENER = '<div class="codeWrap">';
var re = new RegExp(OPENER.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'), m, bad = 0;
while ((m = re.exec(out))) {
  if (out.slice(m.index + OPENER.length, m.index + OPENER.length + 11) !== '<pre><code>') bad++;
}
var o = out.split(OPENER + '<pre><code>').length - 1;
var cl = out.split('</code></pre></div>').length - 1;
console.log('malformed openers: ' + bad + '   blocks: ' + o + '  closers: ' + cl);
if (bad !== 0) { console.error('REFUSE: malformed openers remain'); process.exit(1); }
if (o !== cl) { console.error('REFUSE: unbalanced'); process.exit(1); }
if (o !== 198) { console.error('REFUSE: expected 198 blocks, got ' + o); process.exit(1); }

fs.writeFileSync(path, out, 'utf8');
console.log('\nWROTE ' + path + ': ' + before + ' -> ' + out.length + ' (-1)');
console.log('band claims 198 code samples; TRUE count is 198');