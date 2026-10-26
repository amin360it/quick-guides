var fs = require('fs');
var c = fs.readFileSync('flutter.html','utf8');

var OPEN = '<div class="codeWrap"><pre><code>';
var CLOSE = '</code></pre></div>';

// split into blocks and find raw < inside
var blocks = [];
var idx = 0, i = 0;
while (true) {
  var a = c.indexOf(OPEN, i);
  if (a === -1) break;
  var b = c.indexOf(CLOSE, a);
  if (b === -1) break;
  blocks.push({ start: a, end: b, body: c.slice(a+OPEN.length, b) });
  i = b + CLOSE.length;
}
console.log('canonical blocks: ' + blocks.length);

var hits = [];
blocks.forEach(function(bl, n) {
  var re = /<(?=[a-zA-Z!])/g, m;
  while ((m = re.exec(bl.body))) {
    hits.push({ block: n+1, off: m.index, abs: bl.start + OPEN.length + m.index,
                ctx: bl.body.slice(Math.max(0,m.index-45), m.index+45) });
  }
});
console.log('raw < total: ' + hits.length + '\n');
hits.forEach(function(h) {
  console.log('block ' + h.block + ' @' + h.off);
  console.log('   ' + JSON.stringify(h.ctx));
});