var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);
var has=[],miss=[];
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var head=c.slice(c.indexOf('<head>'), c.indexOf('</head>'));
  var cs=/<meta name="color-scheme"/.test(head);
  var tc=(head.match(/<meta name="theme-color"/g)||[]).length;
  var ms=(head.match(/<meta name="color-scheme"[^>]*>/g)||[]);
  if(cs) has.push(f+'  theme-color x'+tc+'  '+ms[0]);
  else miss.push(f+'  theme-color x'+tc);
});
console.log('WITH color-scheme: '+has.length);
has.slice(0,3).forEach(x=>console.log('   '+x));
console.log('\nWITHOUT color-scheme: '+miss.length);
miss.slice(0,5).forEach(x=>console.log('   '+x));

// do the ones without it still have both theme-color tags?
console.log('\ntheme-color tag counts among the 66 without color-scheme:');
var counts={};
miss.forEach(function(x){var n=x.match(/x(\d+)/)[1];counts[n]=(counts[n]||0)+1;});
console.log('   '+JSON.stringify(counts));