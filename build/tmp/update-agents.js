var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');

// Replace the header line + the whole table (from the header line up to the
// first blank line after the table) with freshly measured values.
var table=fs.readFileSync('build/tmp/file-index-table.md','utf8');
var start=c.indexOf('94 pages, ~28 MB, 1267 chapters, 11061 code samples.');
if(start<0){ console.error('header line not found'); process.exit(1); }
var end=c.indexOf('\n\n', start);
var head='94 guides, 7744 topics, 11636 code samples, ~31 MB. The **Guide** column is the visible h1 band. Measured 2026-10-17 by `build/tmp/make-index.js`, which counts a topic as a chapter plus its subsections and a code sample as a well-formed `<div class="codeWrap"><pre><code>` block.\n\n'+table.replace(/\n$/,'');

var out=c.slice(0,start)+head+c.slice(end);
fs.writeFileSync(p,out,'utf8');
console.log('AGENTS.md File Index replaced ('+(end-start)+' -> '+(head.length)+' bytes)');