var fs = require('fs');

var FAKES = ['axum','actix-web','rocket','warp','salvo'];

// 1. Is rust-programming.html real?
var rp = fs.readFileSync('rust-programming.html','utf8');
console.log('=== rust-programming.html ===');
console.log('  title: ' + (rp.match(/<title>([\s\S]*?)<\/title>/)||[])[1]);
console.log('  band-t: ' + (rp.match(/am-band-t">([\s\S]*?)</)||[])[1]);
console.log('  "Rust" mentions: ' + (rp.match(/\bRust\b/g)||[]).length);
console.log('  "fn main" mentions: ' + (rp.match(/fn main/g)||[]).length);
console.log('  sec=' + (rp.match(/<section class="chapter">/g)||[]).length +
            ' h3=' + (rp.match(/<h3/g)||[]).length +
            ' code=' + (rp.match(/<div class="codeWrap">/g)||[]).length);

// 2. Do the fakes appear in indexes?
var sj = JSON.parse(fs.readFileSync('searchindex.json','utf8'));
var sjText = JSON.stringify(sj);
var tp = fs.readFileSync('topics.html','utf8');
var idx = fs.readFileSync('index.html','utf8');

console.log('\n=== FAKE GUIDE LEAKAGE ===');
FAKES.forEach(function(f) {
  var needle = f + '.html';
  console.log('  ' + f + ': searchindex=' + (sjText.indexOf(needle) !== -1) +
    ' topics=' + (tp.indexOf(needle) !== -1) +
    ' index=' + (idx.indexOf(needle) !== -1));
});

// 3. Are the 5 real new guides present everywhere?
console.log('\n=== REAL NEW GUIDES ===');
['microservices','spring-boot','jsp','oracle-sql','ai-models','rust-programming'].forEach(function(f) {
  var needle = f + '.html';
  console.log('  ' + f + ': searchindex=' + (sjText.indexOf(needle) !== -1) +
    ' topics=' + (tp.indexOf(needle) !== -1) +
    ' index=' + (idx.indexOf(needle) !== -1));
});

// 4. test.html content
console.log('\n=== test.html ===');
console.log(JSON.stringify(fs.readFileSync('test.html','utf8')));