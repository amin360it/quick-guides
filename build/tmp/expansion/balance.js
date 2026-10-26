const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'rust-programming.txt'), 'utf8');

const tags = ['section', 'div', 'h2', 'h3', 'h4', 'p', 'pre', 'code', 'button'];
for (const t of tags) {
  const open = (html.match(new RegExp('<' + t + '(\\s|>)', 'g')) || []).length;
  const close = (html.match(new RegExp('</' + t + '>', 'g')) || []).length;
  console.log(`${t}: open=${open} close=${close} ${open === close ? 'OK' : '*** MISMATCH ***'}`);
}

const dbl = (html.match(/&amp;(?:amp|lt|gt|quot);/g) || []);
console.log('double-escapes:', dbl.length, dbl.length ? dbl.join(' ') : '(none)');

const nonAscii = [...new Set(html.replace(/[\x00-\x7F]/g, '').split(''))].sort();
console.log('non-ascii chars:', nonAscii.map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}(${c})`).join(' '));

// stray tokens
for (const tok of ['${', '&hellip;', 'undefined', 'TODO', 'Lorem']) {
  const n = (html.split(tok).length - 1);
  if (n) console.log(`token ${JSON.stringify(tok)}: ${n}`);
}
console.log('total chars:', html.length);