var fs = require('fs');
var path = 'idea-to-deploy.html';
var c = fs.readFileSync(path, 'utf8');
var before = c.length;

// Defect: three headings carry a stray quote in the attribute:
//   <h3 id="ch2-spikes" data-toc">
// The browser reads that as an attribute literally named `data-toc"`, so
// element.hasAttribute('data-toc') is FALSE. Nothing reads it today (the TOC
// is fully pre-rendered and shell.js never queries it), which is exactly why
// it survived: every existing check regex matches the prefix `data-toc` and
// reports it as present. It is a trap for the documented runtime fallback.
var BROKEN = ' data-toc">';
var FIXED  = ' data-toc>';

var n = c.split(BROKEN).length - 1;
console.log('occurrences of `data-toc"`: ' + n);
if (n !== 3) { console.error('REFUSE: expected 3, found ' + n); process.exit(1); }

var out = c.split(BROKEN).join(FIXED);
if (out.length !== before - 3) { console.error('REFUSE: expected -3 bytes'); process.exit(1); }

// invariants
var bad = (out.match(/\sdata-[a-z-]+"/g) || []).length;
if (bad !== 0) { console.error('REFUSE: ' + bad + ' stray-quote attributes remain'); process.exit(1); }
var h3all = (out.match(/<h3[ >]/g) || []).length;
var h3toc = (out.match(/<h3 [^>]*\sdata-toc>/g) || []).length;
console.log('h3 total: ' + h3all + '   h3 with a real data-toc: ' + h3toc);
if (h3all !== h3toc) { console.error('REFUSE: ' + (h3all - h3toc) + ' h3 still lack data-toc'); process.exit(1); }

fs.writeFileSync(path, out, 'utf8');
console.log('\nWROTE ' + path + ': ' + before + ' -> ' + out.length + ' (-3)');
console.log('all 120 h3 now carry a real data-toc attribute');