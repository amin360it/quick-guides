var fs = require('fs');
var path = 'flutter.html';
var c = fs.readFileSync(path, 'utf8');
var before = c.length;

// The defect: 28 code blocks open with <p class="codeWrap"><pre><code> but close
// with </code></pre></div>. A <p> cannot contain <pre> -- the HTML parser closes
// the <p> the moment it sees <pre>, so these blocks render with a stray </div>
// and lose the .codeWrap box entirely (no scrollbar, no border, no radius).
//
// Fix: make the opener match the closer. <p class="codeWrap"> -> <div class="codeWrap">,
// which is what all 396 sibling blocks already use.

var openP  = '<p class="codeWrap">';
var openD  = '<div class="codeWrap">';
var nOpen  = c.split(openP).length - 1;
var nClose = c.split('</code></pre></div>').length - 1;

console.log('before: ' + before + ' bytes');
console.log('<p class="codeWrap"> openers   : ' + nOpen);
console.log('</code></pre></div> closers   : ' + nClose);

if (nOpen !== 28) { console.error('REFUSE: expected 28, found ' + nOpen); process.exit(1); }

// every replacement must be the same length delta, so assert it up front
var delta = openD.length - openP.length;           // +2 bytes each
var expected = before + nOpen * delta;
console.log('expected size after : ' + expected);

var out = c.split(openP).join(openD);

if (out.length !== expected) {
  console.error('REFUSE: size ' + out.length + ' != expected ' + expected);
  process.exit(1);
}

// invariant: no <p class="codeWrap"> remains, and the block count is unchanged
var afterOpenP = out.split(openP).length - 1;
var afterOpenD = out.split(openD).length - 1;
var afterPre   = out.split('<pre><code>').length - 1;
if (afterOpenP !== 0) { console.error('REFUSE: openers remain'); process.exit(1); }
if (afterPre !== 424) { console.error('REFUSE: pre><code count changed to ' + afterPre); process.exit(1); }
if (afterOpenD !== 424) { console.error('REFUSE: codeWrap divs = ' + afterOpenD); process.exit(1); }

fs.writeFileSync(path, out, 'utf8');
console.log('\nWROTE ' + path + ': ' + before + ' -> ' + out.length + ' bytes (' + (out.length-before) + ')');
console.log('codeWrap divs now: ' + afterOpenD + '  (band claims 424)');