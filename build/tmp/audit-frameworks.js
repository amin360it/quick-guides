var fs = require('fs');
var files = ['axum.html','actix-web.html','rocket.html','warp.html','salvo.html','nodejs.html'];

files.forEach(function(f) {
  if (!fs.existsSync(f)) { console.log(f + ': MISSING'); return; }
  var c = fs.readFileSync(f, 'utf8');
  var t = (c.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '(none)';
  var h1 = (c.match(/<h1 class="am-band">[\s\S]*?<span class="am-band-t">([\s\S]*?)<\/span>/) || [])[1] || '(none)';
  var bandS = (c.match(/<span class="am-band-s">([\s\S]*?)<\/span>/) || [])[1] || '(none)';
  var sec = (c.match(/<section class="chapter">/g) || []).length;
  var h3 = (c.match(/<h3/g) || []).length;
  var code = (c.match(/<div class="codeWrap">/g) || []).length;
  console.log('=== ' + f + ' (' + c.length + ' bytes)');
  console.log('  title: ' + t);
  console.log('  band-t: ' + h1);
  console.log('  band-s: ' + bandS);
  console.log('  sec=' + sec + ' h3=' + h3 + ' code=' + code);
  // Rust-specific markers
  console.log('  mentions "Rust": ' + (c.match(/Rust/g) || []).length);
  console.log('  mentions "axum/actix/rocket/warp/salvo": ' + (c.match(/axum|actix|rocket|warp|salvo/gi) || []).length);
  console.log('  mentions "JavaScript/Express": ' + (c.match(/JavaScript|Express/g) || []).length);
});