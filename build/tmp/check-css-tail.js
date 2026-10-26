var fs = require('fs');
var css=fs.readFileSync('assets/shell.css','utf8');
var marker='mode-pop::-webkit-scrollbar';
var tail=css.slice(css.indexOf(marker));
console.log('bytes from the marker to EOF: '+tail.length);
console.log('--- last 600 chars of shell.css ---');
console.log(css.slice(-600));