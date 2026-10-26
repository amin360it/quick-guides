var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);
console.log('guides on disk: '+guides.length);

var idx=fs.readFileSync('index.html','utf8');
var sj=JSON.stringify(JSON.parse(fs.readFileSync('searchindex.json','utf8')));
var tp=fs.readFileSync('topics.html','utf8');
var sm=fs.readFileSync('sitemap.xml','utf8');
var shell=fs.readFileSync('assets/shell.js','utf8');
var meta=fs.readFileSync('agent_scripts/guides-meta.js','utf8');

// f is already "name.html" -- do NOT append another .html
var miss={index:[],topics:[],search:[],sitemap:[],shell:[],meta:[]};
guides.forEach(function(g){
  if(idx.indexOf(g)===-1) miss.index.push(g);
  if(tp.indexOf(g)===-1) miss.topics.push(g);
  if(sj.indexOf(g)===-1) miss.search.push(g);
  if(sm.indexOf('/'+g+'<')===-1) miss.sitemap.push(g);
  if(shell.indexOf("'"+g+"'")===-1) miss.shell.push(g);
  if(meta.indexOf("'"+g+"'")===-1) miss.meta.push(g);
});
console.log('\n=== guides MISSING from each surface ===');
var anyMiss=false;
Object.keys(miss).forEach(function(k){
  if(miss[k].length){ anyMiss=true; console.log('  '+k+': '+miss[k].length+' -> '+miss[k].join(', ')); }
});
if(!anyMiss) console.log('  none - every guide is present on all six surfaces');

console.log('\n=== stale references to the 5 deleted guides ===');
var stale=0;
[['index.html',idx],['topics.html',tp],['sitemap.xml',sm],['assets/shell.js',shell],['agent_scripts/guides-meta.js',meta]].forEach(function(p){
  ['axum','actix-web','rocket','warp','salvo'].forEach(function(g){
    if(p[1].indexOf(g+'.html')!==-1 || p[1].indexOf("'"+g+".html'")!==-1){ console.log('  '+p[0]+' -> '+g); stale++; }
  });
});
['axum','actix-web','rocket','warp','salvo'].forEach(function(g){
  if(sj.indexOf(g)!==-1){
    var i=sj.indexOf(g);
    console.log('  searchindex.json -> '+g+' : '+JSON.stringify(sj.slice(Math.max(0,i-90),i+60)));
    stale++;
  }
});
if(!stale) console.log('  none');