var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f) && NON.indexOf(f)<0; });

var rows=[], totCh=0, totSub=0, totCode=0, totBytes=0;
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var m=c.match(/<main id="content">([\s\S]*)<\/main>/);
  var b=m?m[1]:c;
  var ch=(b.match(/<h2[^>]*data-toc/g)||[]).length;
  var sub=(b.match(/<h3[^>]*data-toc/g)||[]).length;
  var code=(b.match(/<div class="codeWrap"><pre><code>/g)||[]).length;
  var label=(c.match(/<h1 class="am-band">[\s\S]*?<span class="am-band-t">([^<]*)</)||[])[1] || f.replace('.html','');
  totCh+=ch; totSub+=sub; totCode+=code; totBytes+=Buffer.byteLength(c);
  rows.push({ f:f, label:label, ch:ch, sub:sub, topics:ch+sub, code:code, kb:Math.round(Buffer.byteLength(c)/1024) });
});
rows.sort(function(a,b){ return a.label.localeCompare(b.label); });

var out = '| File | Guide | Chapters | Topics | Code | Size |\n|---|---|---:|---:|---:|---:|\n';
rows.forEach(function(r){
  out += '| `'+r.f+'` | '+r.label+' | '+r.ch+' | '+r.topics+' | '+r.code+' | '+r.kb+' KB |\n';
});
fs.writeFileSync('build/tmp/file-index-table.md', out, 'utf8');

console.log('guides: '+rows.length);
console.log('chapters: '+totCh);
console.log('subsections: '+totSub);
console.log('topics (ch+sub): '+(totCh+totSub));
console.log('code samples: '+totCode);
console.log('total size: '+(totBytes/1048576).toFixed(1)+' MB');
console.log('\nheader line:');
console.log(rows.length+' guides, '+(totCh+totSub)+' topics, '+totCode+' code samples, ~'+(totBytes/1048576).toFixed(0)+' MB. Measured 2026-10-17.');