var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var pages=fs.readdirSync('.').filter(f=>/\.html$/.test(f));

var titles={},descs={},ogts={},canons={};
var probs=[];
pages.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var t=(c.match(/<title>([^<]*)<\/title>/)||[])[1];
  var d=(c.match(/<meta name="description" content="([^"]*)"/)||[])[1];
  var og=(c.match(/<meta property="og:title" content="([^"]*)"/)||[])[1];
  var tw=(c.match(/<meta name="twitter:title" content="([^"]*)"/)||[])[1];
  var can=(c.match(/<link rel="canonical" href="([^"]*)"/)||[])[1];
  var ld=(c.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)||[])[1];
  var h1=(c.match(/<h1 class="am-band">[\s\S]*?<span class="am-band-t">([^<]*)</)||[])[1];

  if(!t) probs.push(f+' no <title>');
  if(!d) probs.push(f+' no description');
  if(!can) probs.push(f+' no canonical');
  if(d && (d.length<148||d.length>157)) probs.push(f+' description length '+d.length);
  if(ld){ try{ JSON.parse(ld); }catch(e){ probs.push(f+' JSON-LD invalid: '+e.message); } }
  // unique fields
  [['title',t],['desc',d],['og',og],['tw',tw]].forEach(function(p){
    if(!p[1]) return;
    if(titles[p[0]] && titles[p[0]][p[1]]) probs.push(f+' duplicate '+p[0]+' with '+titles[p[0]][p[1]]);
    else if(!titles[p[0]]) titles[p[0]]={};
    titles[p[0]][p[1]]=f;
  });
  // canonical must be unique per page
  if(can){ if(canons[can] && canons[can]!==f) probs.push(f+' canonical collides with '+canons[can]); canons[can]=f; }
});
console.log('pages checked: '+pages.length);
console.log('problems: '+probs.length);
[...new Set(probs)].slice(0,30).forEach(p=>console.log('  '+p));

// h1 band labels unique?
var bands={},dupBand=[];
var guides=pages.filter(f=>NON.indexOf(f)<0);
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var h=(c.match(/<h1 class="am-band">[\s\S]*?<span class="am-band-t">([^<]*)</)||[])[1];
  if(!h) return;
  if(bands[h]) dupBand.push(f+' == '+bands[h]);
  bands[h]=f;
});
console.log('\nduplicate h1 band labels: '+dupBand.length);
dupBand.forEach(d=>console.log('  '+d));

// SEO head-tag count per page
var counts={};
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var head=c.slice(c.indexOf('<head>'), c.indexOf('</head>'));
  var n=(head.match(/<(meta|link|title|script)\b/g)||[]).length;
  counts[n]=(counts[n]||0)+1;
});
console.log('\nhead-tag counts across guides: '+JSON.stringify(counts));