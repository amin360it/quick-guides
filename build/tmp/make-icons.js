var fs = require('fs');

// Emit GUIDE_ICONS / CAT_ICONS as a minified literal that can be spliced above
// the modules. Data comes from build/tmp/guideicons.json, which was extracted
// from the damaged 130 KB shell and validated (80 marks, all ASCII, no orphan
// filenames).
var data = JSON.parse(fs.readFileSync('build/tmp/guideicons.json', 'utf8'));

// Marks for the 14 guides that had none. Each is a 24x24 stroke glyph drawn to
// the same grid as the rest of the set, `currentColor` so it follows the theme.
var EXTRA = {
  'nodejs.html': '<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M12 12v8"/><path d="M12 12 3 7"/><path d="M12 12l9-5"/>',
  'bun.html': '<circle cx="12" cy="13" r="8"/><path d="M9 11h.01M15 11h.01"/><path d="M8.5 15c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/>',
  'java.html': '<path d="M8 18h8"/><path d="M9 14h6"/><path d="M6 10c0-3 2-4 4-5 1.5-.8 2-2 2-3"/><path d="M10 2c2 2 3 3 3 5s-2 3-2 5"/>',
  'spring-boot.html': '<path d="M12 21c4-2 7-5 7-9a7 7 0 1 0-14 0c0 4 3 7 7 9z"/><path d="M12 12c0-3 2-3 2-5"/>',
  'jsp.html': '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/>',
  'oracle-sql.html': '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  'docker-compose.html': '<rect x="3" y="11" width="4" height="4"/><rect x="8" y="11" width="4" height="4"/><rect x="13" y="11" width="4" height="4"/><rect x="8" y="6" width="4" height="4"/><path d="M3 18c4 2 10 2 14-1 2-1 3-3 3-5-1 1-3 1-4 1"/>',
  'microservices.html': '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 9v3h12V9"/><path d="M12 12v3"/>',
  'fontawesome-icons.html': '<path d="M5 21V4"/><path d="M5 5h11l-2 4 2 4H5"/>',
  'ai-models.html': '<rect x="4" y="6" width="16" height="12" rx="3"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><path d="M12 2v4M2 12h2M20 12h2"/>',
  'chatgpt.html': '<path d="M12 3a4 4 0 0 1 4 4v1"/><path d="M12 21a4 4 0 0 1-4-4v-1"/><path d="M5.5 8.5a4 4 0 0 1 4.5-2"/><path d="M18.5 15.5a4 4 0 0 1-4.5 2"/><path d="M8 12H5a4 4 0 0 0 0 8"/><path d="M16 12h3a4 4 0 0 1 0-8"/><circle cx="12" cy="12" r="3"/>',
  'claude.html': '<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',
  'midjourney.html': '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5-4 4-2-2-7 7"/>',
  'n8n.html': '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 0 6H8.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6"/>'
};

var added = 0;
Object.keys(EXTRA).forEach(function (f) {
  if (data.GUIDE_ICONS[f]) return;
  data.GUIDE_ICONS[f] = EXTRA[f];
  added++;
});

var gk = Object.keys(data.GUIDE_ICONS).sort();

var lines = [];
lines.push('// ---------- Guide marks ----------------------------------------------------');
lines.push('// guide file -> inner markup of a 24x24 monochrome glyph. Every fill and');
lines.push('// stroke is currentColor so a mark follows the theme and the colour mode.');
lines.push('// Built from build/tmp/geticons.js (simple-icons, fetched once at build time)');
lines.push('// plus hand-drawn glyphs; regenerate there rather than editing this literal.');
lines.push('//');
lines.push('// The letter avatar in each card stays the no-JS fallback: hydration replaces');
lines.push('// it only when a mark is known, so an unknown guide keeps its letter.');
lines.push('var GUIDE_ICONS = {');
var parts = gk.map(function (k) {
  return '  ' + JSON.stringify(k) + ': ' + JSON.stringify(data.GUIDE_ICONS[k]);
});
lines.push(parts.join(',\n'));
lines.push('};');
lines.push('');
lines.push('var CAT_ICONS = {');
var ck = Object.keys(data.CAT_ICONS);
lines.push(ck.map(function (k) {
  return '  ' + JSON.stringify(k) + ': ' + JSON.stringify(data.CAT_ICONS[k]);
}).join(',\n'));
lines.push('};');

var out = lines.join('\n') + '\n';
fs.writeFileSync('build/tmp/shell-icons.js', out, 'utf8');

console.log('wrote build/tmp/shell-icons.js');
console.log('  GUIDE_ICONS: ' + gk.length + ' (' + added + ' added for the guides that had none)');
console.log('  CAT_ICONS  : ' + ck.length);
console.log('  bytes      : ' + out.length);

// validate as JS
var fn = new Function(out + '\nreturn {g:GUIDE_ICONS,c:CAT_ICONS};');
var check = fn();
console.log('  parses: ' + Object.keys(check.g).length + ' guide marks, ' + Object.keys(check.c).length + ' cat glyphs');

var disk = fs.readdirSync('.').filter(function (f) {
  return /\.html$/.test(f) && ['index.html', 'topics.html', 'search.html', 'favorites.html'].indexOf(f) < 0;
});
var missing = disk.filter(function (f) { return !check.g[f]; });
console.log('  guides on disk without a mark: ' + (missing.length ? missing.join(', ') : 'none'));
