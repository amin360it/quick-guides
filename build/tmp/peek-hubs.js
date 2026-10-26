var fs = require('fs');
var c = fs.readFileSync('index.html','utf8');
// what is the main landmark on the hubs?
console.log('=== <main ...> tags in index.html ===');
console.log(JSON.stringify((c.match(/<main[^>]*>/g)||[])));
console.log('=== ids that look like a content anchor ===');
console.log(JSON.stringify([...new Set((c.match(/id="(content|main|top|browse|guides)"/g)||[]))]));
console.log('=== first 400 chars after <body> ===');
var b=c.indexOf('<body');
console.log(JSON.stringify(c.slice(b, b+400)));
console.log('=== same for topics.html ===');
var t = fs.readFileSync('topics.html','utf8');
console.log(JSON.stringify((t.match(/<main[^>]*>/g)||[])));
var b2=t.indexOf('<body');
console.log(JSON.stringify(t.slice(b2, b2+400)));