var fs = require('fs');
var cp = require('child_process');

// Show the full check-links report first
var out = cp.execSync('node build/tmp/check-links.js', { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
console.log(out.split('\n').filter(function (l) {
  return /FILE MISSING|ANCHOR|real|summary|TOTAL|OK|FAIL|broken/i.test(l);
}).slice(-30).join('\n'));

console.log('\n=== context for each FILE MISSING hit ===');
var hits = [
  ['fontawesome-icons.html', 'file.svg'],
  ['html.html', 'a.png'],
  ['html.html', '/app/'],
  ['html.html', 'logo.svg'],
  ['search.html', 'url'],
  ['software-engineering.html', 'file.js'],
  ['vuejs.html', 'value'],
  ['wp-theme.html', 'VALUE']
];

hits.forEach(function (pair) {
  var file = pair[0], needle = pair[1];
  var c = fs.readFileSync(file, 'utf8');
  var at = c.indexOf(needle);
  if (at < 0) { console.log('\n' + file + ' :: "' + needle + '" not found'); return; }

  // what is the enclosing tag?
  var open = c.lastIndexOf('<', at);
  var close = c.indexOf('>', at);
  var tag = c.slice(open, close + 1);

  // are we inside a .codeWrap block?
  var before = c.slice(0, at);
  var lastWrapOpen = before.lastIndexOf('<div class="codeWrap">');
  var lastWrapClose = before.lastIndexOf('</div>');
  var inCodeBlock = lastWrapOpen > -1 && lastWrapOpen > lastWrapClose;

  // or inside an inline <code> span?
  var lastCode = before.lastIndexOf('<code');
  var lastCodeClose = before.lastIndexOf('</code>');
  var inInlineCode = lastCode > -1 && lastCode > lastCodeClose;

  console.log('\n--- ' + file + ' :: "' + needle + '"');
  console.log('    enclosing tag : ' + tag.slice(0, 160));
  console.log('    in codeWrap   : ' + inCodeBlock);
  console.log('    in inline code: ' + inInlineCode);
  console.log('    verdict       : ' + ((inCodeBlock || inInlineCode) ? 'FALSE POSITIVE (code)' : '*** REAL LINK ***'));
});
