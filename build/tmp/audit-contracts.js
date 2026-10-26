var fs = require('fs');

// --- A. inline scripts on the guides: is any feature implemented per-page?
var guides = fs.readdirSync('.').filter(function (f) {
  return /\.html$/.test(f) && ['index.html', 'topics.html', 'search.html', 'favorites.html'].indexOf(f) < 0;
});
var inlineSizes = [];
guides.forEach(function (f) {
  var c = fs.readFileSync(f, 'utf8');
  var scripts = c.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g) || [];
  var total = scripts.reduce(function (n, s) { return n + s.length; }, 0);
  inlineSizes.push({ f: f, n: scripts.length, bytes: total });
});
var maxInline = inlineSizes.slice().sort(function (a, b) { return b.bytes - a.bytes; })[0];
console.log('=== inline <script> on guides (largest first) ===');
inlineSizes.sort(function (a, b) { return b.bytes - a.bytes; }).slice(0, 5).forEach(function (s) {
  console.log('  ' + s.f + '  scripts=' + s.n + '  bytes=' + s.bytes);
});
console.log('  (a pre-paint theme bootstrap is ~600-900 bytes; a highlighter is 3k+)');

// --- B. does favorites.html rely on the injected #favBtn?
var fav = fs.readFileSync('favorites.html', 'utf8');
console.log('\n=== favorites.html references ===');
['favBtn', 'amin360it-favs', 'favList', 'star'].forEach(function (k) {
  console.log('  ' + (k + '                    ').slice(0, 20) + (fav.match(new RegExp(k, 'g')) || []).length);
});
var starText = fav.match(/.{80}star.{140}/i);
console.log('  context: ' + (starText ? JSON.stringify(starText[0].replace(/\s+/g, ' ')) : 'none'));

// --- C. the CSS contracts the missing JS must satisfy
var css = fs.readFileSync('assets/shell.css', 'utf8');
function has(re) { return (css.match(re) || []).length; }
console.log('\n=== CSS contracts present in shell.css ===');
console.log('  .codeWrap pre code .k/.s/.n/.c : ' + (css.match(/code\s*\.(k|s|n|c)\b/g) || []).length);
console.log('  tokens --code-k/s/n/c          : ' + ['--code-k', '--code-s', '--code-n', '--code-c', '--code-text'].map(function (t) { return t + '=' + has(new RegExp(t, 'g')); }).join(' '));
console.log('  .codeWrap button / .cp / .copy : ' + (css.match(/\.(cp|copy)\b|codeWrap[^{]*button/g) || []).length);
console.log('  #progressBar                   : ' + has(/#progressBar/g));
console.log('  #searchAuto                    : ' + has(/#searchAuto/g));
console.log('  #favBtn / .fav-btn             : ' + has(/#favBtn/g));
console.log('  .botnav                        : ' + has(/\.botnav/g));
console.log('  nav#toc a.active               : ' + has(/nav#toc a\.active/g));
console.log('  .am-glyph                      : ' + has(/\.am-glyph/g));
console.log('  .ch-toc.collapsed              : ' + has(/\.ch-toc\.collapsed/g));

// --- D. what span classes does the highlighter contract name?
console.log('\n=== CSS rules naming a code token class ===');
(css.match(/[^{}]*\.(?:codeWrap|code)[^{}]*\{[^}]*\}/g) || []).forEach(function (r) {
  if (!/\.[ksnc]\b/.test(r)) return;
  console.log('  ' + r.replace(/\s+/g, ' ').trim().slice(0, 150));
});

// --- E. brace balance of the candidate
var cand = fs.readFileSync('build/tmp/shell.candidate.js', 'utf8');
var stripped = cand.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '').replace(/'(?:\\.|[^'\\])*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
console.log('\n=== candidate brace balance (comments/strings stripped) ===');
console.log('  { ' + (stripped.match(/{/g) || []).length + '   } ' + (stripped.match(/}/g) || []).length);
console.log('  ( ' + (stripped.match(/\(/g) || []).length + '   ) ' + (stripped.match(/\)/g) || []).length);
