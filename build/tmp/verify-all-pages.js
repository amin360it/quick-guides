var fs = require('fs');
var cp = require('child_process');

// Render each page type headlessly and assert the restored shell actually ran.
// A JS error anywhere in the shell would leave the injected artefacts missing,
// so counting them is a functional test, not a smoke test.
var EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
var TMP = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode';

function dump(page, tag) {
  var prof = TMP + '\\edgeprof-' + tag;
  var outFile = 'build/tmp/dump-' + tag + '.html';
  var cmd = '"' + EDGE + '" --headless=new --disable-gpu --no-sandbox ' +
            '--user-data-dir="' + prof + '" --virtual-time-budget=5000 ' +
            '--dump-dom "http://localhost:8080/' + page + '"';
  var dom = cp.execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: 'cmd.exe', stdio: ['ignore', 'pipe', 'ignore'] });
  fs.writeFileSync(outFile, dom, 'utf8');
  return dom;
}

function n(h, re) { return (h.match(re) || []).length; }

var fails = [];
function check(label, ok, detail) {
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label + (detail ? '   ' + detail : ''));
  if (!ok) fails.push(label);
}

// ---- a guide -------------------------------------------------------------
console.log('=== rust-programming.html (guide) ===');
var g = dump('rust-programming.html', 'rust');
check('highlighter produced spans', n(g, /<span class="(k|s|n|c)">/g) > 500, n(g, /<span class="(k|s|n|c)">/g) + ' spans');
check('copy buttons injected', n(g, /class="copyBtn"/g) > 50, n(g, /class="copyBtn"/g));
check('chapter nav footers', n(g, /class="chapter-nav"/g) >= 7, n(g, /class="chapter-nav"/g));
check('ch-toc toggles bound', n(g, /data-bound="1"/g) >= 7, n(g, /data-bound="1"/g));
check('autocomplete container', n(g, /id="searchAuto"/g) === 1);
check('tocCount filled', /id="tocCount"[^>]*>\d+ topics</.test(g));
check('botnav injected', n(g, /class="botnav"/g) === 1);
check('botnav has Contents button', n(g, /class="botnav-c"/g) === 1);
check('nav glyphs hydrated', n(g, /class="am-glyph"/g) >= 90, n(g, /class="am-glyph"/g));
check('no double-escaped entity leak', n(g, /&amp;lt;/g) === 0);
check('no nested highlight span', n(g, /<span class="k"><span/g) === 0);
check('code text intact (fn sum present)', /fn sum\(xs/.test(g));

// ---- index hub -----------------------------------------------------------
console.log('\n=== index.html (hub) ===');
var i = dump('index.html', 'index2');
check('94 cards', n(i, /class="am-card"/g) === 94);
check('94 card glyphs', n(i, /am-card-ic"><svg[^>]*class="am-glyph"/g) === 94, n(i, /am-card-ic"><svg/g));
check('no letters left', n(i, /am-card-ic">[A-Z]<\/span>/g) === 0);
check('botnav injected', n(i, /class="botnav"/g) === 1);
check('nav glyphs hydrated', n(i, /class="tn-link[^"]*"[^>]*>[\s\S]{0,80}?am-glyph/g) >= 90 || n(i, /class="am-glyph"/g) >= 188, n(i, /class="am-glyph"/g));
check('no ch-toc on hub', n(i, /ch-toc-head" data-bound/g) === 0);

// ---- topics hub ----------------------------------------------------------
console.log('\n=== topics.html (hub) ===');
var t = dump('topics.html', 'topics');
check('botnav injected', n(t, /class="botnav"/g) === 1);
check('nav glyphs hydrated', n(t, /class="am-glyph"/g) >= 90, n(t, /class="am-glyph"/g));
check('to-top present', n(t, /id="toTop"/g) === 1);

// ---- search --------------------------------------------------------------
console.log('\n=== search.html ===');
var s = dump('search.html', 'search');
check('botnav injected', n(s, /class="botnav"/g) === 1);
check('nav built', n(s, /class="tn-link/g) >= 90, n(s, /class="tn-link/g));

// ---- favorites -----------------------------------------------------------
console.log('\n=== favorites.html ===');
var f = dump('favorites.html', 'fav');
check('botnav injected', n(f, /class="botnav"/g) === 1);
check('nav built', n(f, /class="tn-link/g) >= 90, n(f, /class="tn-link/g));

console.log('\n=== ' + (fails.length ? 'FAILURES: ' + fails.join(', ') : 'ALL PAGE TYPES PASS') + ' ===');
process.exit(fails.length ? 1 : 0);
