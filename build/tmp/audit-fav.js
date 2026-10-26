var fs = require('fs');
var hub = fs.readFileSync('index.html', 'utf8');
var hubcss = fs.readFileSync('assets/hub.css', 'utf8');

console.log('=== index.html chrome ===');
['id="toTop"', 'id="progressBar"', 'id="topnav"', 'class="am-card"', 'am-card-ic'].forEach(function (k) {
  console.log('  ' + (k + '                        ').slice(0, 24) + (hub.split(k).length - 1));
});

console.log('\n=== hub.css: fav / star ===');
var at = 0, n = 0;
['favBtn', 'fav-btn', 'am-card-ic', 'am-glyph'].forEach(function (k) {
  var c = 0, i = 0;
  while ((i = hubcss.indexOf(k, i)) !== -1) { c++; i += k.length; }
  console.log('  ' + (k + '                      ').slice(0, 22) + c);
});

console.log('\n=== .am-card-ic rules (hub.css) ===');
var i = hubcss.indexOf('.am-card-ic');
while (i !== -1) {
  var open = hubcss.indexOf('{', i), close = hubcss.indexOf('}', open);
  console.log('  ' + hubcss.slice(i, close + 1).replace(/\s+/g, ' ').slice(0, 180));
  i = hubcss.indexOf('.am-card-ic', i + 1);
}

console.log('\n=== .am-glyph rules (hub.css + shell.css) ===');
[['hub.css', hubcss], ['shell.css', fs.readFileSync('assets/shell.css', 'utf8')]].forEach(function (pair) {
  var css = pair[1], j = css.indexOf('.am-glyph');
  while (j !== -1) {
    var open = css.indexOf('{', j), close = css.indexOf('}', open);
    console.log('  [' + pair[0] + '] ' + css.slice(j, close + 1).replace(/\s+/g, ' ').slice(0, 160));
    j = css.indexOf('.am-glyph', j + 1);
  }
});

console.log('\n=== favorites.html: what does it promise? ===');
var fav = fs.readFileSync('favorites.html', 'utf8');
var text = fav.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
var k = text.indexOf('star');
console.log('  ' + JSON.stringify(text.slice(Math.max(0, k - 420), k + 260)));
