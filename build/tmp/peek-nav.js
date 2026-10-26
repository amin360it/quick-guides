var fs = require('fs');
var c = fs.readFileSync('rust-programming.html','utf8');
var i = c.indexOf('<nav id="toc"');
console.log('nav#toc at ' + i);
if (i < 0) {
  // what IS the sidebar element?
  var m = c.match(/<aside[\s\S]{0,200}/);
  console.log('aside: ' + JSON.stringify(m && m[0]));
  var m2 = c.match(/<nav[^>]*>/g);
  console.log('nav tags: ' + JSON.stringify(m2));
  var m3 = c.match(/class="chapter open"/g);
  console.log('chapter open count: ' + (m3 ? m3.length : 0));
  var m4 = c.match(/data-target=/g);
  console.log('data-target count: ' + (m4 ? m4.length : 0));
  var m5 = c.match(/<a href="#[^"]+"[^>]*>/g);
  console.log('sidebar anchors: ' + JSON.stringify((m5||[]).slice(0,6)));
} else {
  console.log(c.slice(i, i+900));
}