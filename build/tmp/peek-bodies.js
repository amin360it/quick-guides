var fs = require('fs');
var pages = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });
var shapes = {};
pages.forEach(function(f){
  var c = fs.readFileSync(f,'utf8');
  var b = c.match(/<body[^>]*>\s*/);
  var after = c.slice(c.indexOf(b[0]) + b[0].length, c.indexOf(b[0]) + b[0].length + 30).replace(/\r/g,'');
  var key = b[0].replace(/\s+/g,' ') + '||' + JSON.stringify(after.slice(0,20));
  (shapes[key] = shapes[key] || []).push(f);
});
console.log('distinct <body> openings: ' + Object.keys(shapes).length);
Object.keys(shapes).forEach(function(k){
  console.log('  ' + k);
  console.log('     ' + shapes[k].length + ' pages: ' + shapes[k].slice(0,4).join(', '));
});