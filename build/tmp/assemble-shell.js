var fs = require('fs');

// Assemble assets/shell.js from three parts:
//   1. the live file, lines 1..372   - header, theme, colour mode, GUIDES_CATALOG
//   2. the live file, lines 374..end - the Guides dropdown builder (unchanged)
//   3. the icon literals + the restored modules
// Order matters: the nav builds .tn-link[data-file] rows, and the icon block
// then hydrates them, so it has to run after the nav IIFE.

var live = fs.readFileSync('build/tmp/shell.js.orig', 'utf8');
var lines = live.split(/\r?\n/);
if (lines.length !== 510) { console.error('REFUSE: live shell.js is ' + lines.length + ' lines, expected 510'); process.exit(1); }

// the catalog array ends at the `];` before the nav IIFE
var navStart = -1;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].indexOf("var nav = document.getElementById('topnav');") !== -1) { navStart = i; break; }
}
if (navStart < 0) { console.error('REFUSE: nav IIFE not found'); process.exit(1); }
var iifeOpen = navStart - 1;
while (iifeOpen >= 0 && lines[iifeOpen].trim() !== '(function () {') iifeOpen--;
if (iifeOpen < 0) { console.error('REFUSE: nav IIFE opener not found'); process.exit(1); }

// the tail closing brace of the file, i.e. the nav IIFE's `})();`
// (it is the last non-empty line)
var last = lines.length - 1;
while (last >= 0 && !lines[last].trim()) last--;
if (lines[last].trim() !== '})();') { console.error('REFUSE: file does not end with })();  got: ' + JSON.stringify(lines[last])); process.exit(1); }

var head = lines.slice(0, iifeOpen).join('\n');        // 1..(iifeOpen) exclusive
var navBlock = lines.slice(iifeOpen).join('\n');       // nav IIFE to EOF

var icons = fs.readFileSync('build/tmp/shell-icons.js', 'utf8').replace(/^\uFEFF/, '');
var modules = fs.readFileSync('build/tmp/shell-modules.js', 'utf8').replace(/^\uFEFF/, '');

var out = head.replace(/\s*$/, '\n') + '\n' + navBlock.replace(/\s*$/, '\n') + '\n' + icons + '\n' + modules;

// no BOM
if (out.charCodeAt(0) === 0xFEFF) out = out.slice(1);

fs.writeFileSync('build/tmp/shell.assembled.js', out, 'utf8');

console.log('assembled build/tmp/shell.assembled.js');
console.log('  parts: head ' + head.length + ' B, nav ' + navBlock.length + ' B, icons ' + icons.length + ' B, modules ' + modules.length + ' B');
console.log('  total ' + out.length + ' B, ' + out.split('\n').length + ' lines');
