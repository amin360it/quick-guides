var fs = require('fs');

// The two hits that need a precise look: find the actual href whose VALUE is
// the reported target, not an incidental substring match.
[['search.html', "' + url + '"], ['vuejs.html', 'value']].forEach(function (pair) {
  var file = pair[0], target = pair[1];
  var c = fs.readFileSync(file, 'utf8');
  console.log('=== ' + file + ' -> ' + JSON.stringify(target) + ' ===');

  var re = /href\s*=\s*"([^"]*)"/g, m, found = 0;
  while ((m = re.exec(c))) {
    if (m[1] !== target) continue;
    found++;
    var at = m.index;
    var before = c.slice(0, at);
    var lastWrapOpen = before.lastIndexOf('<div class="codeWrap">');
    var lastWrapClose = before.lastIndexOf('</pre></div>');
    var inCodeBlock = lastWrapOpen > -1 && lastWrapOpen > lastWrapClose;
    var lastCode = before.lastIndexOf('<code');
    var lastCodeClose = before.lastIndexOf('</code>');
    var inInlineCode = lastCode > -1 && lastCode > lastCodeClose;
    console.log('  hit at ' + at + '  inCodeBlock=' + inCodeBlock + '  inInlineCode=' + inInlineCode);
    console.log('  context: ' + JSON.stringify(c.slice(Math.max(0, at - 180), at + 120)));
  }
  console.log('  exact href matches: ' + found);
  console.log('');
});
