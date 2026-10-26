var fs = require('fs');
var css = fs.readFileSync('assets/shell.css', 'utf8');

var classes = [
  'copyBtn', 'chapter-nav', 'ch-end', 'ch-end-line', 'ch-end-label', 'ch-nav-row',
  'nav-link', 'nav-dir', 'nav-title', 'nav-arrow', 'ch-done', 'ch-done-btn',
  'ch-done-link', 'auto-sub', 'hidden-item', 'botnav', 'tn-menu', 'tn-link',
  'tn-chap', 'tn-menu-note', 'tn-scroll', 'tn-cat-h', 'am-glyph', 'mode-swatch',
  'mode-pop', 'ch-toc-head', 'ch-toc-list', 'topic-desc', 'menu-open', 'drawer-open',
  'searchAuto', 'progressBar', 'to-top', 'show'
];

console.log('class/id            in shell.css   count');
classes.forEach(function (k) {
  var n = 0, at = 0;
  var needle = (k === 'searchAuto' || k === 'progressBar') ? '#' + k : '.' + k;
  while ((at = css.indexOf(needle, at)) !== -1) { n++; at += needle.length; }
  // also allow the bare word (e.g. id selectors written without '#')
  var n2 = 0; at = 0;
  while ((at = css.indexOf(k, at)) !== -1) { n2++; at += k.length; }
  console.log('  ' + (k + '                  ').slice(0, 20) + String(n).padStart(6) + String(n2).padStart(11));
});

// the two rules that must exist for the rebuilt features to work
function ruleFor(sel) {
  var at = css.indexOf(sel);
  if (at < 0) return null;
  var open = css.indexOf('{', at);
  var close = css.indexOf('}', open);
  return css.slice(at, close + 1).replace(/\s+/g, ' ').slice(0, 220);
}
console.log('\n--- sample rules ---');
['#progressBar', '.copyBtn', '.chapter-nav', '.botnav', '.am-glyph'].forEach(function (s) {
  console.log(s + ' => ' + (ruleFor(s) || 'ABSENT'));
});
