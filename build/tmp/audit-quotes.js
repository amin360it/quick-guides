var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var pages=fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });

// A malformed data attribute: data-toc" or data-toc' or data-toc = with no value
var BAD=/\sdata-(toc|target|scope)("|')/g;
var hits=[];
pages.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var m;
  while((m=BAD.exec(c))){
    var line=c.slice(0,m.index).split('\n').length;
    hits.push({ f:f, line:line, ctx:c.slice(Math.max(0,m.index-70), m.index+50).replace(/\n/g,' ') });
  }
});
console.log('=== malformed data-* attributes: '+hits.length+' ===');
hits.forEach(function(h){ console.log('  '+h.f+':'+h.line+'  '+JSON.stringify(h.ctx)); });

// also: data-toc on an h2/h3 that is NOT a bare boolean
var eq=[];
pages.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  (c.match(/data-toc="[^"]*"/g)||[]).forEach(function(t){ if(t!=='data-toc=""') {} });
});
console.log('');

// and: any data-* attribute name immediately followed by a quote
// (the data-toc" defect). Anchored on whitespace before "data-" so an id
// value such as ch5-data-sources" is not a false positive.
var stray=[];
pages.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var re2=/<h[23]\b[^>]*\sdata-[a-z-]+"[^>]*>/g;
  var m2;
  while((m2=re2.exec(c))){
    var line=c.slice(0,m2.index).split('\n').length;
    stray.push(f+':'+line+'  '+JSON.stringify(m2[0].slice(0,90)));
  }
});
console.log('=== headings with a stray quote in an attribute: '+stray.length+' ===');
stray.forEach(function(s){ console.log('  '+s); });