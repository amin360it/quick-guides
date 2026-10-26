var fs = require('fs');
var path = 'flutter.html';
var c = fs.readFileSync(path, 'utf8');
var before = c.length;

var OPEN  = '<div class="codeWrap"><pre><code>';
var CLOSE = '</code></pre></div>';

// These 14 were invisible to check-codeesc.js until the 28 misnested
// <p class="codeWrap"> blocks became canonical: the checker only scans
// <div class="codeWrap"> blocks, so Dart generics like List<Entry> went
// unescaped. Unescaped, the browser parses <Entry> as a tag and the type
// silently disappears from the rendered sample.
//
// Only < immediately followed by an uppercase letter is a Dart generic.
// A bare comparison (a < b) is followed by a space and must not be touched.
function escapeGenerics(body) {
  var out = '', i = 0, changed = 0;
  while (i < body.length) {
    var ch = body[i];
    if (ch === '<' && /[A-Z]/.test(body[i+1] || '')) {
      // walk to the matching >, tracking nesting and skipping string literals
      var depth = 1, j = i + 1, inStr = null;
      while (j < body.length && depth > 0) {
        var d = body[j];
        if (inStr) {
          if (d === inStr && body[j-1] !== '\\') inStr = null;
        } else if (d === '"' || d === "'") inStr = d;
        else if (d === '<') depth++;
        else if (d === '>') depth--;
        j++;
      }
      if (depth === 0) {                       // closed cleanly -> escape it
        var seg = body.slice(i, j).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        out += seg; changed += (j - i); i = j;
        continue;
      }
    }
    out += ch; i++;
  }
  return { out: out, changed: changed };
}

// apply per block so a replacement can never span a block boundary
var pieces = [], last = 0, totalChanged = 0, blocksTouched = 0;
var re = new RegExp(OPEN.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '([\\s\\S]*?)' + CLOSE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
var m;
while ((m = re.exec(c))) {
  pieces.push(c.slice(last, m.index));
  var r = escapeGenerics(m[1]);
  if (r.changed) { blocksTouched++; totalChanged += r.changed; }
  pieces.push(OPEN + r.out + CLOSE);
  last = m.index + m[0].length;
}
pieces.push(c.slice(last));
var out = pieces.join('');

console.log('blocks touched: ' + blocksTouched + '  chars inside generics: ' + totalChanged);
console.log('size: ' + before + ' -> ' + out.length + '  (delta ' + (out.length-before) + ')');

// invariants
var nOpen = out.split(OPEN).length - 1;
var nClose = out.split(CLOSE).length - 1;
var nPre = out.split('<pre>').length - 1;
console.log('blocks: open=' + nOpen + ' close=' + nClose + ' pre=' + nPre);
if (nOpen !== 424 || nClose !== 424 || nPre !== 424) { console.error('REFUSE: block count changed'); process.exit(1); }

// no raw < followed by a letter may remain inside a block
var re2 = new RegExp(OPEN.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '([\\s\\S]*?)' + CLOSE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
var remaining = 0;
while ((m = re2.exec(out))) remaining += (m[1].match(/<(?=[a-zA-Z!])/g) || []).length;
console.log('remaining raw < in blocks: ' + remaining);
if (remaining !== 0) { console.error('REFUSE: ' + remaining + ' raw < remain'); process.exit(1); }

// no double escaping introduced
var ampLt = (out.match(/&amp;lt;/g)||[]).length;
console.log('double-escaped (&amp;lt;): ' + ampLt);
if (ampLt !== 0) { console.error('REFUSE: double escaping'); process.exit(1); }

fs.writeFileSync(path, out, 'utf8');
console.log('\nWROTE ' + path);