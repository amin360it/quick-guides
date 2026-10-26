var fs = require('fs');
var FILE = 'build/tmp/shell-modules.js';
var s = fs.readFileSync(FILE, 'utf8');

// The `--` comment rule matched the LAST TWO dashes of a YAML document marker
// (`---`), producing `-` followed by a comment span. It also coloured Blade's
// `{{-- --}}` and JS `x--` as comments. One lookbehind fixes all three: a
// double-dash comment only starts at line start or after whitespace.
var before = "|--(?![\\\\w-])[^\\\\n]*)'";
var after  = "|(?<![^\\\\s])--(?![\\\\w-])[^\\\\n]*)'";

var hits = s.split(before).length - 1;
if (hits !== 1) { console.error('REFUSE: expected 1 occurrence of the -- rule, found ' + hits); process.exit(1); }

var out = s.replace(before, after);
if (out === s) { console.error('REFUSE: no change'); process.exit(1); }

fs.writeFileSync(FILE, out, 'utf8');
console.log('patched the -- rule');
console.log('  before: ' + before);
console.log('  after : ' + after);

// show the resulting HL lines
var i = out.indexOf('var HL = new RegExp(');
console.log('\n--- now ---');
console.log(out.slice(i, out.indexOf("'g');", i) + 5));
