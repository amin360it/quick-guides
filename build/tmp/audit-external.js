var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var pages=fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });

// 1. Anything that a BROWSER FETCHES with an absolute external URL
var FETCH=/<(?:script[^>]*\bsrc|link[^>]*\brel="stylesheet"[^>]*\bhref|img[^>]*\bsrc|source[^>]*\bsrc|iframe[^>]*\bsrc|video[^>]*\bsrc|audio[^>]*\bsrc)\s*=\s*"(https?:\/\/[^"]+)"/gi;
var fetches=[];
pages.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var m;
  while((m=FETCH.exec(c))) fetches.push(f+' -> '+m[1]);
});
console.log('=== external resources a browser would fetch: '+fetches.length+' ===');
fetches.slice(0,10).forEach(function(x){ console.log('  '+x); });

// 2. @import / url() in CSS pointing off-box
['assets/shell.css','assets/hub.css'].forEach(function(p){
  if(!fs.existsSync(p)) return;
  var css=fs.readFileSync(p,'utf8');
  var imports=css.match(/@import[^;]+;/g)||[];
  var urls=[...css.matchAll(/url\(\s*['"]?(https?:\/\/[^)'"]+)/g)].map(function(m){return m[1];});
  var localUrls=[...css.matchAll(/url\(\s*['"]?(?!data:|https?:)([^)'"]+)/g)].map(function(m){return m[1];});
  console.log('\n'+p+':');
  console.log('  @import      : '+(imports.length?imports.join(' | '):'none'));
  console.log('  external url(): '+(urls.length?urls.join(', '):'none'));
  console.log('  local url()  : '+(localUrls.length?localUrls.join(', '):'none'));
  var base64=(css.match(/url\(\s*['"]?data:/g)||[]).length;
  console.log('  data: url()  : '+base64);
});

// 3. CDN-ish hostnames anywhere in the shipped pages (as prose is fine)
var CDN=/(cdn\.jsdelivr|unpkg\.com|cdnjs\.cloudflare|fonts\.googleapis|fonts\.gstatic|ajax\.googleapis|stackpath\.bootstrapcdn)/i;
var cdnHits=[];
pages.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  if(CDN.test(c)){
    var m=c.match(CDN);
    cdnHits.push(f+' -> '+m[0]);
  }
});
console.log('\n=== CDN hostnames mentioned: '+cdnHits.length+' ===');
[...new Set(cdnHits)].slice(0,10).forEach(function(x){ console.log('  '+x); });