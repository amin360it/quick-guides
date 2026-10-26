var fs = require('fs');
var pages = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });

// Two WCAG gaps, identical on every page:
//
// 1. No skip link. The header holds a burger, the logo, a Guides dropdown
//    listing all 94 guides, the mode control and the theme toggle, so a
//    keyboard user tabs through ~100 stops before the first heading.
//    2.4.1 Bypass Blocks. The link goes FIRST in <body> so it is the first
//    tab stop, and it is off-screen until focused (CSS in shell.css) rather
//    than display:none, which would remove it from the tab order.
//
// 2. #themeBtn carried only a title attribute. Its two SVGs have no
//    aria-hidden, unlike the decorative chevron in the lockup which does.
//    A title is an unreliable accessible name (not exposed on touch), and the
//    button has no text content at all.

var changed = { skip: 0, theme: 0, hubMain: 0 };

pages.forEach(function(f) {
  var c = fs.readFileSync(f, 'utf8');
  var before = c.length;
  var out = c;

  // The two hubs carry <main class="am-main"> with no id, so a skip link has
  // nothing to target. Give the landmark an id (same one the guides use) so
  // every page in the library has exactly one skip target.
  if (/<main class="am-main">/.test(out)) {
    out = out.replace('<main class="am-main">', '<main id="content" class="am-main">');
    changed.hubMain++;
  }

  // 1. skip link, immediately after the <body ...> opening tag
  if (out.indexOf('class="am-skip"') === -1) {
    var m = out.match(/<body[^>]*>/);
    if (!m) { console.error('REFUSE ' + f + ': no <body>'); process.exit(1); }
    var at = m.index + m[0].length;
    // keep the newline + indentation that follows <body>
    var tail = out.slice(at, at + 40);
    var nl = (tail.match(/^\r?\n[ \t]*/) || [''])[0];
    out = out.slice(0, at) + nl + '  <a class="am-skip" href="#content">Skip to content</a>' + nl + out.slice(at + nl.length);
    changed.skip++;
  }

  // 2. theme button: a real accessible name, and hide the decorative SVGs
  if (/<button id="themeBtn" class="btn" title="Toggle dark \/ light mode">/.test(out)) {
    out = out.replace(
      '<button id="themeBtn" class="btn" title="Toggle dark / light mode">',
      '<button id="themeBtn" class="btn" title="Toggle dark / light mode" aria-label="Toggle dark or light theme" aria-pressed="false">'
    );
    out = out.replace('<svg id="icSun" class="theme-ic"', '<svg id="icSun" class="theme-ic" aria-hidden="true"');
    out = out.replace('<svg id="icMoon" class="theme-ic"', '<svg id="icMoon" class="theme-ic" aria-hidden="true"');
    changed.theme++;
  }

  if (out === c) return;

  // invariants for this page
  var nSkip = (out.match(/class="am-skip"/g) || []).length;
  if (nSkip !== 1) { console.error('REFUSE ' + f + ': am-skip count ' + nSkip); process.exit(1); }
  // it must be the first focusable element: nothing focusable before it.
  // The skip link itself is an <a>, so slice up to the LINK, not the body.
  var bIdx = out.indexOf('<body');
  var sIdx = out.indexOf('<a class="am-skip"');
  var between = out.slice(bIdx, sIdx);
  if (/<(a|button|input)\b/.test(between)) { console.error('REFUSE ' + f + ': focusable element before the skip link'); process.exit(1); }
  // it must point at a real target
  var nMain = (out.match(/<main id="content"/g) || []).length;
  if (nMain !== 1) { console.error('REFUSE ' + f + ': main#content count ' + nMain); process.exit(1); }
  var nTheme = (out.match(/id="themeBtn"[^>]*aria-label=/g) || []).length;
  if (nTheme !== 1) { console.error('REFUSE ' + f + ': themeBtn aria-label ' + nTheme); process.exit(1); }
  var nHidden = (out.match(/id="ic(?:Sun|Moon)"[^>]*aria-hidden="true"/g) || []).length;
  if (nHidden !== 2) { console.error('REFUSE ' + f + ': icon aria-hidden ' + nHidden); process.exit(1); }
  // head-tag count must not move. Compare against THIS file's own baseline:
  // guides carry 34, the utility pages carry fewer.
  var headOut = out.slice(out.indexOf('<head>'), out.indexOf('</head>'));
  var headIn  = c.slice(c.indexOf('<head>'), c.indexOf('</head>'));
  var tagsOut = (headOut.match(/<(?:meta|link|title|script)\b/g) || []).length;
  var tagsIn  = (headIn.match(/<(?:meta|link|title|script)\b/g) || []).length;
  if (tagsOut !== tagsIn) { console.error('REFUSE ' + f + ': head tags ' + tagsIn + ' -> ' + tagsOut); process.exit(1); }
  // exactly one body
  if ((out.match(/<body[^>]*>/g) || []).length !== 1) { console.error('REFUSE ' + f + ': body count'); process.exit(1); }

  fs.writeFileSync(f, out, 'utf8');
});

console.log('skip link added to   : ' + changed.skip + ' pages');
console.log('themeBtn fixed on     : ' + changed.theme + ' pages');