var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var files=fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f) && NON.indexOf(f)<0; });

// Every guide already carries two theme-color tags (one per scheme). 66 of 94
// are missing <meta name="color-scheme">, so the browser UI (scrollbars, form
// controls, the canvas behind the page) is not told the page supports both.
// Insert it immediately BEFORE the first theme-color tag, which is where the
// 28 already-correct pages have it.
var TAG = '<meta name="color-scheme" content="light dark">';
var changed = 0, bytes = 0, skipped = [];

files.forEach(function(f) {
  var c = fs.readFileSync(f, 'utf8');

  var pre = (c.match(/<meta name="color-scheme"/g) || []).length;
  if (pre > 1) { console.error('REFUSE ' + f + ': already has ' + pre + ' color-scheme'); process.exit(1); }
  if (pre === 1) return;

  var tc = (c.match(/<meta name="theme-color"/g) || []).length;
  if (tc !== 2) { console.error('REFUSE ' + f + ': theme-color count ' + tc); process.exit(1); }

  // index of the FIRST theme-color tag, inside <head> only
  var headEnd = c.indexOf('</head>');
  if (headEnd < 0) { console.error('REFUSE ' + f + ': no </head>'); process.exit(1); }
  var at = c.indexOf('<meta name="theme-color"');
  if (at < 0 || at > headEnd) { skipped.push(f + ' (no theme-color in head)'); return; }

  // start of that tag's line, so the new tag inherits the same indentation
  var lineStart = c.lastIndexOf('\n', at - 1) + 1;
  var indent = c.slice(lineStart, at);
  if (/[^\s]/.test(indent)) { console.error('REFUSE ' + f + ': tag is not at line start'); process.exit(1); }

  var out = c.slice(0, lineStart) + indent + TAG + '\n' + indent + c.slice(lineStart);

  // verify the result rather than trusting the arithmetic
  var nCs  = (out.match(/<meta name="color-scheme"/g)  || []).length;
  var nTc  = (out.match(/<meta name="theme-color"/g)   || []).length;
  var nHead= (out.match(/<head>/g) || []).length;
  if (nCs !== 1) { console.error('REFUSE ' + f + ': color-scheme now ' + nCs); process.exit(1); }
  if (nTc !== 2) { console.error('REFUSE ' + f + ': theme-color now ' + nTc); process.exit(1); }
  if (nHead !== 1) { console.error('REFUSE ' + f + ': head count changed'); process.exit(1); }
  if (out.indexOf(TAG) > out.indexOf('</head>')) { console.error('REFUSE ' + f + ': outside head'); process.exit(1); }
  // everything after the insertion point must be byte-identical
  if (out.slice(lineStart + indent.length + TAG.length + 1) !== c.slice(lineStart)) {
    console.error('REFUSE ' + f + ': tail changed'); process.exit(1);
  }

  var delta = out.length - c.length;
  fs.writeFileSync(f, out, 'utf8');
  changed++; bytes += delta;
});

console.log('patched ' + changed + ' guides, +' + bytes + ' bytes (' + Math.round(bytes/Math.max(changed,1)) + ' each)');
if (skipped.length) console.log('skipped: ' + skipped.join(', '));