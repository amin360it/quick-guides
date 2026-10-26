var fs = require('fs');

// The 5 "Rust framework" guides are byte-identical copies of nodejs.html with
// only the <title> changed. They are:
//   - duplicate body content (1 unique body, 6 files)
//   - duplicate <title> (breaks the SEO uniqueness rule in AGENTS.md)
//   - 5 of the 6 titles collide with nodejs.html
//   - absent from index.html, topics.html, searchindex.json, sitemap.xml and
//     the GUIDES_CATALOG, so they are unreachable orphans
//   - 1.27 MB of dead weight in the shipped library
//
// They were never real guides: the scaffold tool copies the template and
// expects a fragment to be authored separately. The fragments that exist in
// build/newguides are themselves copies of nodejs content.
//
// The correct fix is to REMOVE them, not to ship 6 copies of the Node.js guide.
// Only the titles were edited, so nothing authored is lost.

var FAKES = ['axum.html','actix-web.html','rocket.html','warp.html','salvo.html'];

var removed = [];
FAKES.forEach(function(f) {
  if (fs.existsSync(f)) {
    var size = fs.statSync(f).size;
    fs.unlinkSync(f);
    removed.push(f + ' (' + size + ' bytes)');
  }
});

// also remove the fragment copies and metas that produced them
['axum','actix-web','rocket','warp','salvo'].forEach(function(k) {
  ['build/newguides/'+k+'.main.html','build/newguides/'+k+'.meta.json'].forEach(function(p) {
    if (fs.existsSync(p)) { fs.unlinkSync(p); removed.push(p); }
  });
});

console.log('REMOVED ' + removed.length + ' files:');
removed.forEach(function(r){ console.log('  ' + r); });

// verify
var left = FAKES.filter(function(f){ return fs.existsSync(f); });
console.log('\nremaining fake guides: ' + left.length);
var all = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });
console.log('root .html now: ' + all.length);