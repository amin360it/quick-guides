var fs = require('fs');
var css = fs.readFileSync('assets/shell.css', 'utf8');

function dumpAll(sel, limit) {
  var out = [], i = 0, n = 0;
  while ((i = css.indexOf(sel, i)) !== -1 && n < (limit || 10)) {
    var open = css.indexOf('{', i), close = css.indexOf('}', open);
    if (open < 0) break;
    out.push(css.slice(i, close + 1).replace(/\s+/g, ' ').trim());
    i += sel.length; n++;
  }
  return out;
}

['.botnav', '.chapter-nav', '.ch-end', '.ch-nav-row', '.nav-link', '.copyBtn',
 '#searchAuto', '#progressBar', '.ch-toc-head', '.ch-toc.collapsed',
 'nav#toc a.active', '.hidden-item', '.cur', '.auto-sub'].forEach(function (sel) {
  console.log('=== ' + sel + ' ===');
  var rules = dumpAll(sel, 8);
  if (!rules.length) console.log('  ABSENT');
  rules.forEach(function (r) { console.log('  ' + r.slice(0, 260)); });
  console.log('');
});

// media queries that mention botnav
console.log('=== media queries containing .botnav ===');
var idx = 0;
while ((idx = css.indexOf('@media', idx)) !== -1) {
  var open = css.indexOf('{', idx);
  var depth = 0, end = -1;
  for (var i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) break;
  var block = css.slice(idx, end + 1);
  if (block.indexOf('botnav') !== -1) {
    console.log('  ' + css.slice(idx, open).trim() + '  ->  ' + block.slice(block.indexOf('botnav') - 40, block.indexOf('botnav') + 200).replace(/\s+/g, ' '));
  }
  idx = end + 1;
}
