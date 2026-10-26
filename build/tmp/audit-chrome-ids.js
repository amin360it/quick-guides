var fs = require('fs');
var c = fs.readFileSync('rust-programming.html', 'utf8');

// The ids/classes the guide-chrome block requires, per the reference guard:
var need = ['burger', 'sidebar', 'content', 'toc', 'tocCount', 'search', 'progressBar', 'searchWrap', 'toTop'];
console.log('=== required ids present in a guide ===');
need.forEach(function (id) {
  var found = new RegExp('id="' + id + '"').test(c);
  console.log('  ' + (id + '                         ').slice(0, 22) + (found ? 'yes' : 'NO'));
});

console.log('\n=== the sidebar / search markup ===');
var i = c.indexOf('<aside');
console.log(c.slice(i, i + 700));

console.log('\n=== topnav element ===');
console.log(JSON.stringify((c.match(/<nav id="topnav"[^>]*>[^<]*<\/nav>/) || c.match(/<nav id="topnav"[^>]*>/) || ['?'])[0]));

console.log('\n=== to-top button ===');
console.log(JSON.stringify((c.match(/<button id="toTop"[\s\S]{0,300}?<\/button>/) || ['?'])[0]));

console.log('\n=== is there a progressBar anywhere on the page? ===');
console.log('  progressBar: ' + (c.match(/progressBar/g) || []).length);
