var fs = require('fs');
var path = require('path');

// 1. All root html files
var all = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });

// 2. Title uniqueness (SEO requirement)
var titles = {};
var dupTitles = [];
all.forEach(function(f) {
  var c = fs.readFileSync(f, 'utf8');
  var t = (c.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '(none)';
  if (titles[t]) { dupTitles.push(f + ' == ' + titles[t]); }
  else titles[t] = f;
});
console.log('=== DUPLICATE TITLES (' + dupTitles.length + ') ===');
dupTitles.forEach(function(d){ console.log('  ' + d); });

// 3. Canonical uniqueness
console.log('\n=== CANONICALS ===');
var cans = {};
all.forEach(function(f) {
  var c = fs.readFileSync(f, 'utf8');
  var t = (c.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '(none)';
  cans[f] = t;
});
var noCanon = all.filter(function(f){ return cans[f] === '(none)'; });
console.log('pages without canonical: ' + noCanon.length);
noCanon.slice(0,20).forEach(function(f){ console.log('  ' + f); });

// 4. Which pages are NOT in sitemap
var sm = fs.existsSync('sitemap.xml') ? fs.readFileSync('sitemap.xml','utf8') : '';
console.log('\n=== SITEMAP ===');
var smUrls = (sm.match(/<loc>[^<]*<\/loc>/g) || []).map(function(x){ return x.replace(/<\/?loc>/g,''); });
console.log('sitemap URLs: ' + smUrls.length);
var notInSm = all.filter(function(f){
  return smUrls.indexOf('https://amin360it.github.io/quick-guides/' + f) === -1;
});
console.log('root pages NOT in sitemap: ' + notInSm.length);
notInSm.forEach(function(f){ console.log('  ' + f); });

// 5. Which pages are NOT in index.html
var idx = fs.existsSync('index.html') ? fs.readFileSync('index.html','utf8') : '';
console.log('\n=== INDEX.HTML ===');
var notInIdx = all.filter(function(f){
  if (f === 'index.html' || f === 'topics.html' || f === 'search.html' || f === 'favorites.html' || f === 'test.html') return false;
  return idx.indexOf('"' + f + '"') === -1 && idx.indexOf(f) === -1;
});
console.log('guides NOT referenced in index.html: ' + notInIdx.length);
notInIdx.forEach(function(f){ console.log('  ' + f); });