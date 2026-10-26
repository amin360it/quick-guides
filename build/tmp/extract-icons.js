var fs = require('fs');
var cand = fs.readFileSync('build/tmp/shell.candidate.js', 'utf8');

// Pull the two icon literals out of the repaired candidate and prove they are
// valid JS objects with the expected shape before anything is written.
function extract(name) {
  var start = cand.indexOf('var ' + name + ' = {');
  if (start < 0) throw new Error(name + ' not found');
  var i = cand.indexOf('{', start);
  var depth = 0, end = -1;
  for (; i < cand.length; i++) {
    var ch = cand[i];
    if (ch === "'" || ch === '"') {          // skip string literals
      var q = ch; i++;
      while (i < cand.length && cand[i] !== q) { if (cand[i] === '\\') i++; i++; }
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw new Error(name + ': unbalanced');
  return cand.slice(start, end + 1);
}

var g = extract('GUIDE_ICONS');
var c = extract('CAT_ICONS');

// evaluate in isolation to prove validity
var sandbox = {};
var fn = new Function(g + '\n' + c + '\nreturn {g: GUIDE_ICONS, c: CAT_ICONS};');
var icons = fn();

var gk = Object.keys(icons.g), ck = Object.keys(icons.c);
console.log('GUIDE_ICONS: ' + gk.length + ' marks, ' + g.length + ' bytes');
console.log('CAT_ICONS  : ' + ck.length + ' glyphs, ' + c.length + ' bytes');

// every value must be ASCII-only SVG inner markup
var bad = [];
gk.forEach(function (k) {
  if (!/^[\x20-\x7E]*$/.test(icons.g[k])) bad.push('GUIDE_ICONS[' + k + ']');
});
ck.forEach(function (k) {
  if (!/^[\x20-\x7E]*$/.test(icons.c[k])) bad.push('CAT_ICONS[' + k + ']');
});
console.log('non-ASCII values: ' + (bad.length ? bad.join(', ') : 'none'));

// which guides on disk have no mark?
var disk = fs.readdirSync('.').filter(function (f) {
  return /\.html$/.test(f) && ['index.html', 'topics.html', 'search.html', 'favorites.html'].indexOf(f) < 0;
});
var missing = disk.filter(function (f) { return !icons.g[f]; });
console.log('guides on disk: ' + disk.length + '   without a mark: ' + missing.length);
if (missing.length) console.log('  ' + missing.join(', '));

// marks that point at a guide that is not on disk
var orphans = gk.filter(function (f) { return disk.indexOf(f) < 0; });
console.log('marks for absent files: ' + (orphans.length ? orphans.join(', ') : 'none'));

console.log('\ncat keys: ' + JSON.stringify(ck));

fs.writeFileSync('build/tmp/guideicons.json', JSON.stringify({ GUIDE_ICONS: icons.g, CAT_ICONS: icons.c }, null, 0), 'utf8');
console.log('\nwritten build/tmp/guideicons.json');
