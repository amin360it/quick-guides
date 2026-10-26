var fs = require('fs');
var { execSync } = require('child_process');

// 1. Where are the 14 raw-tag defects?
console.log('=== RAW-TAG DEFECTS ===');
var out = execSync('node agent_scripts/check-codeesc.js --all', {encoding:'utf8', maxBuffer: 1<<26});
var lines = out.split('\n').filter(function(l){ return /raw-tag defects|^===== /.test(l); });
// re-run per file to find offenders
var files = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });
var NON = ['index.html','topics.html','search.html','favorites.html'];
var offenders = [];
files.forEach(function(f){
  if (NON.indexOf(f)>=0) return;
  var c = fs.readFileSync(f,'utf8');
  var blocks = c.match(/<div class="codeWrap">[\s\S]*?<\/code><\/pre><\/div>/g) || [];
  blocks.forEach(function(b, i){
    var body = b.replace(/^<div class="codeWrap"><pre><code>/,'').replace(/<\/code><\/pre><\/div>$/,'');
    var hits = body.match(/<(?=[a-zA-Z!])/g);
    if (hits) offenders.push({f:f, i:i, n:hits.length, ctx:body.slice(0,0)});
  });
});
var byFile = {};
offenders.forEach(function(o){ (byFile[o.f]=byFile[o.f]||[]).push(o); });
Object.keys(byFile).forEach(function(f){
  console.log('  ' + f + ': ' + byFile[f].length + ' blocks, total ' +
    byFile[f].reduce((a,b)=>a+b.n,0) + ' raw <');
});

// 2. package-publishing: why 357 code blocks?
console.log('\n=== package-publishing.html block count ===');
var pp = fs.readFileSync('package-publishing.html','utf8');
console.log('  <div class="codeWrap"> : ' + (pp.split('<div class="codeWrap">').length-1));
console.log('  <div class="codeWrap"><pre><code> : ' + (pp.split('<div class="codeWrap"><pre><code>').length-1));
console.log('  <pre> : ' + (pp.split('<pre>').length-1));
console.log('  <pre><code> : ' + (pp.split('<pre><code>').length-1));
console.log('  </code></pre></div> : ' + (pp.split('</code></pre></div>').length-1));
console.log('  <codeWrap variants>');
(pp.match(/<div class="[^"]*codeWrap[^"]*"/g)||[]).forEach(function(v){
  console.log('    ' + JSON.stringify(v) + ' x' + (pp.split(v).length-1));
});