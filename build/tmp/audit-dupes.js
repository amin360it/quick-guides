var fs = require('fs');
var crypto = require('crypto');

var NON_GUIDES = ['index.html','topics.html','search.html','favorites.html','test.html'];
var all = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });
var guides = all.filter(function(f){ return NON_GUIDES.indexOf(f) === -1; });

// Hash the BODY only (strip head + header/nav/footer chrome) so two guides
// sharing content but differing in <head> still collide.
function bodyHash(c) {
  var m = c.match(/<main id="content">([\s\S]*)<\/main>/);
  var body = m ? m[1] : c;
  // normalise: strip whitespace
  body = body.replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(body).digest('hex');
}

var byHash = {};
guides.forEach(function(f) {
  var h = bodyHash(fs.readFileSync(f, 'utf8'));
  (byHash[h] = byHash[h] || []).push(f);
});

var dupes = Object.keys(byHash).filter(function(h){ return byHash[h].length > 1; });
console.log('=== IDENTICAL-BODY GROUPS: ' + dupes.length + ' ===');
dupes.forEach(function(h) {
  console.log('  ' + byHash[h].join('  ==  '));
});

console.log('\ntotal guides: ' + guides.length);
console.log('unique bodies: ' + Object.keys(byHash).length);

// Also: near-dupe check - same chapter titles
function chapterTitles(c) {
  var m = c.match(/<main id="content">([\s\S]*)<\/main>/);
  var body = m ? m[1] : c;
  var t = (body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/g) || []).map(function(x){
    return x.replace(/<[^>]*>/g,'').trim();
  });
  return t.join(' | ');
}
var byChap = {};
guides.forEach(function(f) {
  var k = chapterTitles(fs.readFileSync(f, 'utf8'));
  if (!k) return;
  (byChap[k] = byChap[k] || []).push(f);
});
var dupCh = Object.keys(byChap).filter(function(k){ return byChap[k].length > 1; });
console.log('\n=== SAME-CHAPTER-TITLE GROUPS: ' + dupCh.length + ' ===');
dupCh.forEach(function(k) {
  console.log('  ' + byChap[k].join('  ==  '));
});