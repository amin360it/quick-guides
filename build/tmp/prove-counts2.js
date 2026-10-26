var fs = require('fs');
var OPENER = '<div class="codeWrap">';
console.log('OPENER.length =', OPENER.length);
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);
var bad=[];
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var re=new RegExp(OPENER.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),m;
  var badHere=0, ex=null;
  while((m=re.exec(c))){
    var after=c.slice(m.index+OPENER.length, m.index+OPENER.length+11);
    if(after!=='<pre><code>'){ badHere++; if(!ex) ex=m.index; }
  }
  if(badHere) bad.push(f+' : '+badHere+' malformed, first @'+ex);
});
console.log('=== guides with a codeWrap div NOT immediately followed by <pre><code> ===');
console.log(bad.length ? bad.join('\n') : '  NONE - all codeWrap divs are well-formed');