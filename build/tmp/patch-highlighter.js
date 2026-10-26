var fs = require('fs');
var FILE = 'build/tmp/shell-modules.js';
var s = fs.readFileSync(FILE, 'utf8');

var startAt = s.indexOf('  var HL = new RegExp(');
if (startAt < 0) { console.error('REFUSE: HL statement not found'); process.exit(1); }
var endAt = s.indexOf("'g');", startAt);
if (endAt < 0) { console.error('REFUSE: HL terminator not found'); process.exit(1); }
endAt += "'g');".length;

var newBlock = [
  '  // Comments are matched before strings, so each rule is narrowed until it',
  '  // cannot swallow real code. Two guards were missing from the original and',
  '  // are restored here:',
  '  //',
  '  //   block comments   CSS and JS samples are full of them and they were not',
  '  //                    highlighted at all, so a CSS block comment rendered as',
  '  //                    flat monochrome text beside highlighted code.',
  '  //   line comments    The old comment claimed a guard that the regex did not',
  '  //                    have, so https://example.com was coloured as a comment',
  '  //                    to the end of the line. Now blocked after a colon or a',
  '  //                    word character.',
  '  //   hash             only at line start or after whitespace, followed by a',
  '  //                    space or EOL, so CSS ids (#main, #fff) stay intact.',
  '  //   double dash      not followed by a word character or another dash, so',
  '  //                    CSS custom properties (--accent) and YAML document',
  '  //                    markers survive.',
  '  //',
  '  // All of these are lookaround assertions, so they add no capture groups and',
  '  // the (cm, str, num, id) argument order of the replacer stays unchanged.',
  '  var HL = new RegExp(',
  "    '(\\\\/\\\\*[\\\\s\\\\S]*?\\\\*\\\\/|(?<![:\\\\w])\\\\/\\\\/[^\\\\n]*|(?<![^\\\\s])#(?=\\\\s|$)[^\\\\n]*|--(?![\\\\w-])[^\\\\n]*)' +",
  "    '|(\"[^\"\\\\n]*\"|\\'[^\\'\\\\n]*\\'|`[^`\\\\n]*`)' +",
  "    '|\\\\b(\\\\d+(?:\\\\.\\\\d+)?)\\\\b' +",
  "    '|([A-Za-z_$][\\\\w$]*)', 'g');"
].join('\n');

var out = s.slice(0, startAt) + newBlock + s.slice(endAt);
if (out === s) { console.error('REFUSE: no change'); process.exit(1); }
fs.writeFileSync(FILE, out, 'utf8');
console.log('written ' + FILE + '  (' + s.length + ' -> ' + out.length + ' bytes)');
console.log('\n--- emitted source ---');
console.log(newBlock.split('\n').slice(-6).join('\n'));
