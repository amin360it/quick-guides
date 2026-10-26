var fs = require('fs');

var all = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });
var NON_GUIDES = ['index.html','topics.html','search.html','favorites.html','test.html'];
var guides = all.filter(function(f){ return NON_GUIDES.indexOf(f) === -1; });

console.log('root .html files: ' + all.length);
console.log('guides (excluding hubs/tools): ' + guides.length);

// claims in index.html
var idx = fs.readFileSync('index.html','utf8');
var claims = idx.match(/(\d+)\s*(Offline\s*)?[Gg]uides/g);
console.log('\nindex.html guide-count claims: ' + JSON.stringify(claims ? [...new Set(claims)] : []));
var ni = idx.match(/numberOfItems"?\s*:\s*"?(\d+)/g);
console.log('JSON-LD numberOfItems: ' + JSON.stringify(ni));

var t = (idx.match(/<title>([\s\S]*?)<\/title>/)||[])[1];
console.log('index title: ' + t);

// topics.html
var tp = fs.readFileSync('topics.html','utf8');
var tc = tp.match(/([\d,]+)\s*topics/g);
console.log('\ntopics.html count claims: ' + JSON.stringify(tc ? [...new Set(tc)] : []));

// sitemap
var sm = fs.readFileSync('sitemap.xml','utf8');
console.log('sitemap URL count: ' + (sm.match(/<loc>/g)||[]).length);

// searchindex
['searchindex.json','assets/searchindex.json'].forEach(function(p){
  if (fs.existsSync(p)) {
    var j = JSON.parse(fs.readFileSync(p,'utf8'));
    console.log(p + ': entries=' + (Array.isArray(j)?j.length:(j.pages?j.pages.length:'?')) + ' bytes=' + fs.statSync(p).size);
  } else { console.log(p + ': MISSING'); }
});

// stray non-guide files in root
console.log('\n=== root .js / .md / .json (possible strays) ===');
fs.readdirSync('.').filter(function(f){ return /\.(js|ps1|py)$/.test(f); }).forEach(function(f){
  console.log('  ' + f + '  ' + fs.statSync(f).size);
});
console.log('=== root .md ===');
fs.readdirSync('.').filter(function(f){ return /\.md$/.test(f); }).forEach(function(f){
  console.log('  ' + f + '  ' + fs.statSync(f).size);
});