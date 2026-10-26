var fs = require('fs');
var html = fs.readFileSync('build/tmp/dump-rust.html', 'utf8');

function n(re) { return (html.match(re) || []).length; }

console.log('=== rendered DOM, post-JS ===');
console.log('  highlighted spans (.k/.s/.n/.c)  : ' + n(/<span class="(k|s|n|c)">/g));
console.log('  copy buttons (.copyBtn)          : ' + n(/class="copyBtn"/g));
console.log('  chapter-nav footers              : ' + n(/class="chapter-nav"/g));
console.log('  ch-end labels                    : ' + n(/class="ch-end-label"/g));
console.log('  nav-link buttons                 : ' + n(/nav-link nav-/g));
console.log('  botnav                           : ' + n(/class="botnav"/g));
console.log('  searchAuto                       : ' + n(/id="searchAuto"/g));
console.log('  tocCount text                    : ' + JSON.stringify((html.match(/id="tocCount"[^>]*>([^<]*)</) || [])[1] || ''));
console.log('  to-top has .show                 : ' + /id="toTop"[^>]*class="[^"]*\bshow\b/.test(html));
console.log('  tn-link rows                     : ' + n(/class="tn-link(?: cur)?"/g));
console.log('  tn-link glyphs                   : ' + n(/class="tn-link(?: cur)?"[^>]*>\s*<svg class="am-glyph"/g));
console.log('  any am-glyph in nav              : ' + n(/class="am-glyph"/g));

// check for evidence of the corruption traps
console.log('\n=== trap checks ===');
console.log('  literal &lt; printed as text     : ' + (/&amp;lt;/.test(html) ? 'FOUND (bad)' : 'none'));
console.log('  nested highlight spans           : ' + n(/<span class="k"><span/g));
console.log('  data-hl markers                  : ' + n(/data-hl="1"/g));
console.log('  data-bound markers               : ' + n(/data-bound="1"/g));

// is the prose of a code sample intact? compare a known snippet
var i = html.indexOf('data-hl="1"');
if (i > 0) {
  console.log('\n=== first highlighted block, first 400 chars ===');
  console.log(html.slice(i, i + 400));
}
