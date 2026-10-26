var fs = require('fs');
var h = fs.readFileSync('assets/hub.css', 'utf8');

// Which comments contain a brace? Report each with its offset and a wide
// context window so the text can be rewritten, not guessed at.
var re = /\/\*[\s\S]*?\*\//g, m, n = 0;
while ((m = re.exec(h))) {
  if (!/[{}]/.test(m[0])) continue;
  n++;
  console.log('=== comment ' + n + ' at ' + m.index + ' (' + m[0].length + ' bytes) ===');
  console.log(JSON.stringify(m[0]));
  console.log('');
}
console.log('total: ' + n);

// Also look for a comment that is opened but never closed - a `*/` that became
// `*` would swallow the rest of the sheet and is a much worse fault.
var opens = (h.match(/\/\*/g) || []).length;
var closes = (h.match(/\*\//g) || []).length;
console.log('\ncomment opens ' + opens + ', closes ' + closes + (opens === closes ? '  (balanced)' : '  *** UNBALANCED ***'));

// Find a suspicious `\n   *` line that is not followed by a `/`
var bad = [];
var lines = h.split('\n');
lines.forEach(function (l, i) {
  if (/\*\s*$/.test(l) && !/\*\/\s*$/.test(l) && /^\s*\*/.test(l)) bad.push((i + 1) + ': ' + l);
});
console.log('\nlines ending in a bare * (possible unterminated comment): ' + bad.length);
bad.slice(0, 10).forEach(function (b) { console.log('  ' + b); });
