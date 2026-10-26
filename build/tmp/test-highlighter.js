var fs = require('fs');

// The highlighter rewrites innerHTML of every code sample. The invariant that
// matters is that it never changes the TEXT the reader sees - only wraps parts
// of it in spans. A regression here silently corrupts 11,635 samples and is
// invisible in a diff because the markup still looks like markup.
//
// This test pulls the REAL KWS set and highlight() out of assets/shell.js
// (not a copy) and runs it over every code block on disk.

var src = fs.readFileSync('assets/shell.js', 'utf8');

var start = src.indexOf('var KWS = new Set([');
if (start < 0) { console.error('REFUSE: KWS not found'); process.exit(1); }
var hlAt = src.indexOf('function highlight(text) {', start);
if (hlAt < 0) { console.error('REFUSE: highlight() not found'); process.exit(1); }

var i = src.indexOf('{', hlAt), depth = 0, end = -1;
for (; i < src.length; i++) {
  var ch = src[i];
  if (ch === "'" || ch === '"') {
    var q = ch; i++;
    while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; }
    continue;
  }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end < 0) { console.error('REFUSE: highlight() unbalanced'); process.exit(1); }

var escapeHtml = function (s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
var mod = new Function('escapeHtml', src.slice(start, end) +
  '\nreturn { KWS: KWS, highlight: highlight };')(escapeHtml);

console.log('extracted: KWS has ' + mod.KWS.size + ' keywords');

function decode(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&');
}
function stripTags(html) { return html.replace(/<[^>]*>/g, ''); }

// Span nesting, done properly: walk the tags and assert depth never goes above
// 1 and never negative. The earlier version deleted every </span> first, which
// made two adjacent sibling spans look like a nested pair and reported 11,449
// phantom faults - one bad assertion is indistinguishable from a broken module.
function spansWellFormed(html) {
  var re = /<span\b[^>]*>|<\/span>/g, m, d = 0, maxDepth = 0;
  while ((m = re.exec(html))) {
    if (m[0].charAt(1) === '/') d--;
    else d++;
    if (d > maxDepth) maxDepth = d;
    if (d < 0) return { ok: false, why: 'close without open', maxDepth: maxDepth };
  }
  if (d !== 0) return { ok: false, why: 'unclosed span', maxDepth: maxDepth };
  if (maxDepth > 1) return { ok: false, why: 'nested spans', maxDepth: maxDepth };
  return { ok: true, maxDepth: maxDepth };
}

var files = fs.readdirSync('.').filter(function (f) {
  return /\.html$/.test(f) && ['index.html', 'topics.html', 'search.html', 'favorites.html'].indexOf(f) < 0;
});

var total = 0;
var textFails = [], entityFails = [], spanFails = [], doubleEscFails = [];

files.forEach(function (file) {
  var c = fs.readFileSync(file, 'utf8');
  var re = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g, m;
  while ((m = re.exec(c))) {
    total++;
    var rawHtml = m[1];
    var shown = decode(stripTags(rawHtml));         // what the browser shows now
    var out = mod.highlight(shown);                 // the highlighter's output
    var shownAfter = decode(stripTags(out));        // what it will show after

    if (shownAfter !== shown) textFails.push({ file: file, before: shown.slice(0, 160), after: shownAfter.slice(0, 160) });

    // A doubly-escaped entity is only a defect if the ORIGINAL text did not
    // contain it. `&amp;lt;` is the correct output when the sample's own text
    // contains `&lt;` - that is a sample demonstrating escaped output.
    if (/&amp;amp;/.test(out) && shown.indexOf('&amp;') === -1) {
      doubleEscFails.push({ file: file, frag: out.slice(0, 220) });
    }
    if (/&undefined;|&NaN;/.test(out)) doubleEscFails.push({ file: file, frag: out.slice(0, 220) });

    // `&amp;lt;` in output is fine only if the source text really has `&lt;`
    var litEntities = out.match(/&amp;(lt|gt|quot|#39);/g) || [];
    if (litEntities.length && shown.indexOf('&lt;') === -1 && shown.indexOf('&gt;') === -1) {
      entityFails.push({ file: file, frag: out.slice(0, 220) });
    }

    var wf = spansWellFormed(out);
    if (!wf.ok) spanFails.push({ file: file, why: wf.why, maxDepth: wf.maxDepth, frag: out.slice(0, 220) });
  }
});

console.log('\ncode samples scanned: ' + total);
console.log('  text preserved   : ' + (total - textFails.length) + ' / ' + total);
console.log('  no double-escape : ' + (total - doubleEscFails.length) + ' / ' + total);
console.log('  entities sane    : ' + (total - entityFails.length) + ' / ' + total);
console.log('  spans well-formed: ' + (total - spanFails.length) + ' / ' + total);

function show(list, label, extra) {
  if (!list.length) return;
  console.log('\n--- ' + label + ' (' + list.length + ') ---');
  list.slice(0, 5).forEach(function (x) {
    console.log('  ' + x.file + (x.why ? '  [' + x.why + ' maxDepth=' + x.maxDepth + ']' : ''));
    if (x.before !== undefined) {
      console.log('    before: ' + JSON.stringify(x.before));
      console.log('    after : ' + JSON.stringify(x.after));
    } else {
      console.log('    ' + JSON.stringify(x.frag));
    }
  });
}
show(textFails, 'TEXT CHANGED');
show(doubleEscFails, 'DOUBLE-ESCAPE');
show(entityFails, 'ENTITY DAMAGE');
show(spanFails, 'SPAN PROBLEMS');

var ok = !textFails.length && !doubleEscFails.length && !entityFails.length && !spanFails.length;
console.log('\n' + (ok ? 'PASS: highlighter preserves every sample' : '*** FAIL ***'));
process.exit(ok ? 0 : 1);
