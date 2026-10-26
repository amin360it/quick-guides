var fs = require('fs');

// Unit-test the emitted highlighter on the exact strings the guards exist for.
// This runs the REAL function extracted from assets/shell.js.
var src = fs.readFileSync('assets/shell.js', 'utf8');
var start = src.indexOf('var KWS = new Set([');
var hlAt = src.indexOf('function highlight(text) {', start);
var i = src.indexOf('{', hlAt), depth = 0, end = -1;
for (; i < src.length; i++) {
  var ch = src[i];
  if (ch === "'" || ch === '"') { var q = ch; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } continue; }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
var escapeHtml = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
var mod = new Function('escapeHtml', src.slice(start, end) + '\nreturn { highlight: highlight };')(escapeHtml);
var hl = mod.highlight;

var fails = 0;
function expect(label, cond, got) {
  console.log('  ' + (cond ? 'PASS' : 'FAIL') + '  ' + label);
  if (!cond) { fails++; if (got) console.log('        got: ' + JSON.stringify(got)); }
}

console.log('=== CSS block comment is styled ===');
var css = '/* base theme */\n:root { --accent: #06c; }';
var o = hl(css);
expect('block comment wrapped', /<span class="c">\/\* base theme \*\/<\/span>/.test(o), o);
expect('--accent not a comment', !/<span class="c">[^<]*--accent/.test(o), o);
expect('--accent survives literally', o.indexOf('--accent') !== -1, o);

console.log('\n=== URL is not a comment ===');
var js = "const url = 'https://example.com/a//b'; // real comment";
o = hl(js);
expect('URL intact', o.indexOf('https://example.com/a//b') !== -1, o);
expect('trailing // styled as comment', /<span class="c">\/\/ real comment<\/span>/.test(o), o);
expect('no comment span inside the URL', !/<span class="c">\/\/example/.test(o), o);

console.log('\n=== Python hash comment at line start ===');
o = hl('# explain\nx = 1');
expect('hash line styled', /<span class="c"># explain<\/span>/.test(o), o);

console.log('\n=== CSS id is not a hash comment ===');
o = hl('#main { color: red }');
expect('selector untouched', o.indexOf('#main') !== -1 && !/<span class="c">/.test(o), o);

console.log('\n=== SQL double-dash comment ===');
o = hl('SELECT 1 -- note');
expect('sql comment styled', /<span class="c">-- note<\/span>/.test(o), o);

console.log('\n=== YAML document marker untouched ===');
o = hl('---\nkey: value');
expect('--- not a comment', !/<span class="c">/.test(o), o);

console.log('\n=== HTML entities in code are not split ===');
o = hl('if (a < b && c > d) { return "x"; }');
expect('lt/gt survived as entities', o.indexOf('&lt;') !== -1 && o.indexOf('&gt;') !== -1, o);
expect('&& becomes &amp;&amp;', o.indexOf('&amp;&amp;') !== -1, o);
expect('no bare & left', !/&(?!(amp|lt|gt|quot|#39);)/.test(o), o);

console.log('\n=== decrement operator is not a comment ===');
o = hl('let n = 5; n--; doThing(n);');
expect('n-- not styled as comment', !/<span class="c">/.test(o), o);

console.log('\n=== Blade comment marker does not start a comment span ===');
o = hl('{{-- hidden --}}');
expect('no comment span from {{--', !/<span class="c">/.test(o), o);

console.log('\n=== keyword "default" does not split into lt ===');
o = hl('switch (x) { default: break; }');
expect('default styled whole', /<span class="k">default<\/span>/.test(o), o);
expect('no &<span', o.indexOf('&<span') === -1, o);

console.log('\n' + (fails ? '*** ' + fails + ' FAILURES ***' : 'PASS: highlighter guards correct'));
process.exit(fails ? 1 : 0);
