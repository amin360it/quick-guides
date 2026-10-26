var fs = require('fs');
var path = 'package-publishing.html';
var c = fs.readFileSync(path, 'utf8');
var before = c.length;

var OPEN  = '<div class="codeWrap"><pre><code>';
var CLOSE = '</code></pre></div>';

// The defect: the opener for this block was deleted, so ~2.9 KB of code sample
// renders as bare page text and its </code></pre></div> is orphaned
// (356 closers vs 355 openers). The broken run -- closing tag, four
// whitespace-only lines, then the code sample's first comment -- is unique,
// which is what makes a targeted repair safe here.
var BROKEN = '</code></pre></div>\n    \n\n    \n\n    // DEPRECATION, the lifecycle of a version';
var FIXED  = '</code></pre></div>\n\n' + OPEN + '// DEPRECATION, the lifecycle of a version';

var n = c.split(BROKEN).length - 1;
console.log('broken run occurrences: ' + n);
if (n !== 1) { console.error('REFUSE: expected exactly 1, found ' + n); process.exit(1); }

var out = c.replace(BROKEN, () => FIXED);   // function replacer (AGENTS.md rule)

var expected = before + (FIXED.length - BROKEN.length);
console.log('expected size: ' + expected + '  actual: ' + out.length);
if (out.length !== expected) { console.error('REFUSE: size mismatch'); process.exit(1); }

// invariants: balanced, and now exactly 356 real blocks
var o  = out.split(OPEN).length - 1;
var cl = out.split(CLOSE).length - 1;
var pre = out.split('<pre>').length - 1;
console.log('openers=' + o + ' closers=' + cl + ' <pre>=' + pre);
if (o !== cl) { console.error('REFUSE: unbalanced ' + o + '/' + cl); process.exit(1); }
if (o !== 356) { console.error('REFUSE: expected 356, got ' + o); process.exit(1); }
if (pre !== o) { console.error('REFUSE: <pre> != blocks'); process.exit(1); }
// the repaired sample must now sit inside a code block: walk back to the
// nearest preceding OPEN and confirm nothing but whitespace sits between
var chk = out.indexOf('// DEPRECATION, the lifecycle of a version');
var back = out.slice(0, chk);
var lastOpen = back.lastIndexOf(OPEN);
var lastClose = back.lastIndexOf(CLOSE);
if (lastOpen === -1 || lastOpen < lastClose) {
  console.error('REFUSE: sample is not inside a code block'); process.exit(1);
}
var between = out.slice(lastOpen + OPEN.length, chk);
if (/\S/.test(between)) { console.error('REFUSE: non-whitespace between opener and sample: ' + JSON.stringify(between)); process.exit(1); }
console.log('verified: sample sits ' + between.length + ' bytes after its opener');

fs.writeFileSync(path, out, 'utf8');
console.log('\nWROTE: ' + before + ' -> ' + out.length + ' (' + (out.length-before) + ')');
console.log('band claims 356 code samples; actual now 356');