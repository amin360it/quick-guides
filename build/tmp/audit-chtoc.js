var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f) && NON.indexOf(f)<0; });

// ---- 1. per-chapter .ch-toc completeness ----
// Every h3[data-toc] in a chapter must appear exactly once in that chapter's
// .ch-toc-list, in document order.
var chTocProblems=[];
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var secs=c.match(/<section class="chapter">[\s\S]*?<\/section>/g)||[];
  secs.forEach(function(sec,si){
    var h3s=[...sec.matchAll(/<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g)];
    var toc=sec.match(/<div class="ch-toc-list">([\s\S]*?)<\/div>/);
    if(h3s.length && !toc){
      chTocProblems.push(f+' ch'+(si+1)+': has '+h3s.length+' h3 but no .ch-toc-list');
      return;
    }
    if(!toc) return;
    var links=[...toc[1].matchAll(/href="#([^"]+)"/g)].map(function(m){return m[1];});
    var ids=h3s.map(function(m){return m[1];});
    var missing=ids.filter(function(id){ return links.indexOf(id)<0; });
    var extra=links.filter(function(l){ return ids.indexOf(l)<0; });
    var dupes=links.filter(function(l,i){ return links.indexOf(l)!==i; });
    var orderOk=true;
    for(var i=1;i<ids.length;i++){
      var prev=links.indexOf(ids[i-1]), cur=links.indexOf(ids[i]);
      if(prev>=0&&cur>=0&&cur<prev) orderOk=false;
    }
    if(missing.length) chTocProblems.push(f+' ch'+(si+1)+': toc missing '+missing.slice(0,4).join(',')+(missing.length>4?' +'+(missing.length-4):''));
    if(extra.length)   chTocProblems.push(f+' ch'+(si+1)+': toc has extra '+extra.slice(0,4).join(','));
    if(dupes.length)   chTocProblems.push(f+' ch'+(si+1)+': toc duplicate '+[...new Set(dupes)].slice(0,4).join(','));
    if(!orderOk)       chTocProblems.push(f+' ch'+(si+1)+': toc order differs from document order');
  });
});
console.log('=== ch-toc problems: '+chTocProblems.length+' ===');
[...new Set(chTocProblems)].slice(0,25).forEach(function(p){ console.log('  '+p); });

// ---- 2. sidebar nav#toc completeness ----
var navProblems=[];
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var nav=c.match(/<nav id="toc"[\s\S]*?<\/nav>/);
  if(!nav){ navProblems.push(f+': no nav#toc'); return; }
  var h2s=[...c.matchAll(/<h2 id="([^"]+)"[^>]*data-toc>/g)].map(function(m){return m[1];});
  var navTops=[...nav[0].matchAll(/<li class="chapter open">[\s\S]*?data-target="([^"]+)"/g)].map(function(m){return m[1];});
  var missing=h2s.filter(function(h){ return navTops.indexOf(h)<0; });
  if(missing.length) navProblems.push(f+': sidebar missing '+missing.length+' chapters');
  // every nav href must resolve to a real id
  var ids=new Set([...c.matchAll(/id="([^"]+)"/g)].map(function(m){return m[1];}));
  var dead=[...nav[0].matchAll(/href="#([^"]+)"/g)].map(function(m){return m[1];}).filter(function(h){ return !ids.has(h); });
  if(dead.length) navProblems.push(f+': sidebar dead anchors '+[...new Set(dead)].slice(0,3).join(','));
});
console.log('\n=== sidebar problems: '+navProblems.length+' ===');
[...new Set(navProblems)].slice(0,20).forEach(function(p){ console.log('  '+p); });