var fs = require('fs');
var c = fs.readFileSync('rust-programming.html','utf8');
// themeBtn with any attributes, then its element
var i = c.indexOf('themeBtn');
console.log('themeBtn at ' + i);
console.log(JSON.stringify(c.slice(Math.max(0,i-260), i+420)));
console.log('');
console.log('=== is there a skip link of any kind? ===');
var links = [...c.matchAll(/<a\s[^>]*href="#([a-z-]+)"[^>]*>([\s\S]{0,60}?)</g)].map(function(m){
  return { href:m[1], text:m[2].replace(/<[^>]*>/g,'').trim().slice(0,40) };
}).filter(function(x){ return x.text; });
console.log(JSON.stringify(links.slice(0,8), null, 1));
console.log('');
console.log('=== .vh (visually hidden) usage ===');
console.log(JSON.stringify((c.match(/class="vh"[^>]*>[^<]*/g)||[]).slice(0,5)));