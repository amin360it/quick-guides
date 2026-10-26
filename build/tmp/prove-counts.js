var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);

var naiveBad=[], trueBad=[];
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var naive=(c.match(/class="codeWrap"/g)||[]).length;

  // TRUE count: an opener immediately followed by <pre><code>
  var OPEN='<div class="codeWrap"><pre><code>'; var p=0,t=0;
  while((p=c.indexOf(OPEN,p))!==-1){t++;p+=OPEN.length;}

  var band=(c.match(/<span class="am-band-s">([\s\S]*?)<\/span>/)||[])[1];
  if(!band) return;
  var mk=band.replace(/&middot;/g,'.').replace(/,/g,'').match(/(\d+)\s*code samples?/);
  if(!mk) return;
  var claim=+mk[1];
  if(claim!==naive) naiveBad.push(f+'  band='+claim+'  naive='+naive+'  delta='+(naive-claim));
  if(claim!==t)     trueBad.push(f+'  band='+claim+'  TRUE='+t);
});
console.log('=== band vs NAIVE class="codeWrap" (current checker): '+naiveBad.length+' mismatch ===');
naiveBad.forEach(x=>console.log('  '+x));
console.log('\n=== band vs TRUE blocks (correct count): '+trueBad.length+' mismatch ===');
trueBad.forEach(x=>console.log('  '+x));