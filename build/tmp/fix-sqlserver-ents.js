var fs = require('fs');
var path = 'sqlserver.html';
var c = fs.readFileSync(path, 'utf8');
var before = c.length;

// These four are a deliberate demonstration -- the sentence NAMES the entities
// so the reader can match them against the sample above -- but they sit in
// plain prose, where every other guide in the library wraps such a token in
// <code>. Wrap them so the page matches the convention; the rendered text is
// unchanged (still literal "&lt;&lt;" / "&gt;&gt;"), only the typeface changes.
var BROKEN = 'written as &amp;lt;&amp;lt; and &amp;gt;&amp;gt; entities';
var FIXED  = 'written as <code>&amp;lt;&amp;lt;</code> and <code>&amp;gt;&amp;gt;</code> entities';

var n = c.split(BROKEN).length - 1;
console.log('occurrences: ' + n);
if (n !== 1) { console.error('REFUSE: expected 1, found ' + n); process.exit(1); }

var out = c.replace(BROKEN, () => FIXED);
console.log('size: ' + before + ' -> ' + out.length + ' (+' + (out.length-before) + ')');

// invariant: the four entities are still present and still double-escaped
var ents = (out.match(/&amp;(amp|lt|gt|quot|middot|nbsp|mdash);/g)||[]).length;
console.log('double-escaped entities still present: ' + ents);
if (ents !== 4) { console.error('REFUSE: entity count changed to ' + ents); process.exit(1); }
// and each is now inside a <code> span
var re=/&amp;(amp|lt|gt|quot|middot|nbsp|mdash);/g, m, outside=0;
while((m=re.exec(out))){
  var b=out.lastIndexOf('<code>',m.index), bc=out.lastIndexOf('</code>',m.index);
  if(!(b>bc)) outside++;
}
console.log('double-escaped entities outside <code>: ' + outside);
if (outside !== 0) { console.error('REFUSE'); process.exit(1); }

fs.writeFileSync(path, out, 'utf8');
console.log('\nWROTE ' + path);