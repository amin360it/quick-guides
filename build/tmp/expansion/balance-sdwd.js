const fs = require('fs');
const html = fs.readFileSync('static-dynamic-website-development.txt', 'utf8');

// tag balance counting only real tags (not inside code blocks)
const codeBlocks = [...html.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)];
let plain = html;
codeBlocks.forEach((m, i) => {
  plain = plain.replace(m[0], 'CODEBLOCK' + i);
});

const tags = ['section', 'div', 'h2', 'h3', 'h4', 'p', 'pre', 'code', 'ul', 'li'];
let mismatch = false;
for (const t of tags) {
  const open = (plain.match(new RegExp('<' + t + '(\\s|>|/)', 'g')) || []).length;
  const close = (plain.match(new RegExp('</' + t + '>', 'g')) || []).length;
  const ok = open === close;
  if (!ok) mismatch = true;
  console.log(`${t}: open=${open} close=${close} ${ok ? 'OK' : '*** MISMATCH ***'}`);
}

// ensure chapter sections bracket correctly
const secs = (plain.match(/<section class="chapter">/g) || []).length;
const secClose = (plain.match(/<\/section>/g) || []).length;
console.log(`section: open=${secs} close=${secClose} ${secs === secClose ? 'OK' : '*** MISMATCH ***'}`);

// double-escape sieve across whole doc
const dbl = (html.match(/&amp;(?:amp|lt|gt|quot);/g) || []);
console.log('double-escapes:', dbl.length, dbl.length ? dbl.join(' ') : '(none)');

// stray tokens
for (const tok of ['${', '&hellip;', 'undefined', 'TODO', 'Lorem', '<style', 'onclick']) {
  const n = (html.split(tok).length - 1);
  if (n) console.log(`token ${JSON.stringify(tok)}: ${n}`);
}
console.log('total chars:', html.length);
console.log(mismatch ? 'TAG MISMATCH' : 'TAGS BALANCED');