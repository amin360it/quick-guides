var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);
// group by head-tag count and diff which tag is present
var byCount={};
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var head=c.slice(c.indexOf('<head>'), c.indexOf('</head>'));
  var n=(head.match(/<(meta|link|title|script)\b/g)||[]).length;
  (byCount[n]=byCount[n]||[]).push(f);
});
Object.keys(byCount).sort().forEach(function(n){
  console.log('count '+n+': '+byCount[n].length+' files');
  console.log('   '+byCount[n].slice(0,6).join(', ')+(byCount[n].length>6?' ...':''));
});
// diff tags between a 33 and a 34
function tags(f){
  var c=fs.readFileSync(f,'utf8');
  var head=c.slice(c.indexOf('<head>'), c.indexOf('</head>'));
  return (head.match(/<(?:meta|link|title|script)\b[^>]*>/g)||[]).map(t=>t.replace(/content="[^"]*"/,'content=".."'));
}
var a=byCount['33'][0], b=byCount['34'][0];
console.log('\ncompare '+a+' (33) vs '+b+' (34)');
var ta=tags(a), tb=tags(b);
tb.filter(t=>ta.indexOf(t)<0).forEach(t=>console.log('  only in 34-file: '+t));
ta.filter(t=>tb.indexOf(t)<0).forEach(t=>console.log('  only in 33-file: '+t));
console.log('\nsearch.html desc:');
var s=fs.readFileSync('search.html','utf8');
console.log('  '+(s.match(/<meta name="description" content="([^"]*)"/)||[])[1]);