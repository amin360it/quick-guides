var fs = require('fs');

// ---------------------------------------------------------------------------
// Repair assets/shell.js.new into a clean candidate.
//
// Fault 1 - newlines tripled.  k x CRLF -> 3k x CRLF
//           observed run distribution {1:1, 2:6, 3:1003, 6:85, 9:1}
//           inverse: ceil(L/3), minimum 1.
//
// Fault 2 - one staged href.   searchLink.href = 'REMOVED' -> 'search.html'
//
// Fault 3 - CP1252 double-encoding.  The file's text was UTF-8 bytes read as
//           CP1252 and written back out as UTF-8, so '→' (E2 86 92) became the
//           three characters 'â', '†', '’'.  Reversed by mapping each char back
//           to its CP1252 byte.  This is applied ONLY to maximal runs of
//           non-ASCII text, and only when the decoded bytes are valid UTF-8
//           (no U+FFFD), so a genuinely-correct non-ASCII string elsewhere in
//           the file cannot be turned into garbage.
//
// Fault 4 - a stray `})();` with no opener: the `(function () {` that opened the
//           back-to-top block was deleted.  Removed by exact position.
// ---------------------------------------------------------------------------

// CP1252 0x80-0x9F -> unicode, used in reverse to recover the original byte
var CP1252 = {
  0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A,
  0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92,
  0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C,
  0x017E: 0x9E, 0x0178: 0x9F
};

function decodeRun(run) {
  var bytes = [];
  for (var i = 0; i < run.length; i++) {
    var code = run.charCodeAt(i);
    if (CP1252[code] !== undefined) bytes.push(CP1252[code]);
    else if (code <= 0xFF) bytes.push(code);
    else return null;                      // cannot be CP1252, leave alone
  }
  var decoded = Buffer.from(bytes).toString('utf8');
  if (decoded.indexOf('\uFFFD') !== -1) return null;  // not valid UTF-8
  return decoded;
}

var src = fs.readFileSync('assets/shell.js.new', 'utf8');
var beforeBytes = Buffer.byteLength(src, 'utf8');

// --- 1. newlines
var out = src.replace(/\r\n(?:[ \t]*\r\n)*/g, function (run) {
  var n = (run.match(/\r\n/g) || []).length;
  return new Array(Math.max(1, Math.ceil(n / 3)) + 1).join('\r\n');
});

// --- 2. staged href
var nRemoved = (out.match(/searchLink\.href = 'REMOVED'/g) || []).length;
if (nRemoved !== 1) { console.error('REFUSE: expected 1 staged href, found ' + nRemoved); process.exit(1); }
out = out.replace("searchLink.href = 'REMOVED'", "searchLink.href = 'search.html'");

// --- 3. encoding, per maximal non-ASCII run
var converted = 0, skipped = 0;
out = out.replace(/[^\x00-\x7F]+/g, function (run) {
  var d = decodeRun(run);
  if (d === null) { skipped++; return run; }
  converted++;
  return d;
});

// --- 4. the stray closer in the back-to-top block
var STRAY = '   below. It only needs #toTop, and it toggles a class so the fade can run. */\r\n})();\r\n(function () {';
if (out.indexOf(STRAY) < 0) { console.error('REFUSE: back-to-top stray-closer site not found'); process.exit(1); }
out = out.replace(STRAY, '   below. It only needs #toTop, and it toggles a class so the fade can run. */\r\n(function () {');

if (out.charCodeAt(0) === 0xFEFF) out = out.slice(1);

fs.writeFileSync('build/tmp/shell.candidate.js', out, 'utf8');

var bad = {};
for (var i = 0; i < out.length; i++) {
  var ch = out.charCodeAt(i);
  if (ch > 126) bad['U+' + ch.toString(16).toUpperCase()] = (bad['U+' + ch.toString(16).toUpperCase()] || 0) + 1;
}

var lines = out.split('\r\n');
console.log('candidate: build/tmp/shell.candidate.js');
console.log('  bytes ' + beforeBytes + ' -> ' + Buffer.byteLength(out, 'utf8') + '   lines ' + lines.length);
console.log('  encoding runs converted ' + converted + ', left alone ' + skipped);
console.log('  residual non-ASCII: ' + JSON.stringify(bad));
