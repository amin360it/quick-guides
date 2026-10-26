var fs = require('fs');
var c = fs.readFileSync('idea-to-deploy.html','utf8');

// Are the three affected headings in the sidebar?
['ch2-spikes','ch2-buildbuy','ch2-risk'].forEach(function(id){
  var inSidebar=/<li class="chapter open">[\s\S]*?data-target="([^"]+)"/.exec(c);
  var nav=c.match(/<nav id="toc"[\s\S]*?<\/nav>/)[0];
  var has=nav.indexOf('data-target="'+id+'"')>=0;
  console.log(id+': in sidebar = '+has);
});

// how many sidebar entries does the file claim?
var nav=c.match(/<nav id="toc"[\s\S]*?<\/nav>/)[0];
var tops=[...nav.matchAll(/<li class="chapter open">[\s\S]*?data-target="([^"]+)"/g)].map(function(m){return m[1];});
var subs=[...nav.matchAll(/<li><a href="#[^"]+" data-target="([^"]+)"/g)].map(function(m){return m[1];});
console.log('\nsidebar: '+tops.length+' chapters, '+subs.length+' subsections');
var all=[].concat(tops,subs);
console.log('total sidebar links: '+all.length);

// what the document actually has
var h2=[...c.matchAll(/<h2 id="([^"]+)"[^>]*data-toc>/g)].map(function(m){return m[1];});
var h3=[...c.matchAll(/<h3 id="([^"]+)"[^>]*\bdata-toc[\s>]/g)].map(function(m){return m[1];});
var h3all=[...c.matchAll(/<h3 id="([^"]+)"/g)].map(function(m){return m[1];});
console.log('document: '+h2.length+' h2[data-toc], '+h3.length+' h3[data-toc], '+h3all.length+' h3 total');
console.log('h3 without data-toc: '+h3all.filter(function(x){return h3.indexOf(x)<0;}).join(', '));

// band claim
console.log('\nband: '+(c.match(/<span class="am-band-s">[\s\S]*?<\/span>/)||[])[0]);