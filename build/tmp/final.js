const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');

console.log('starts with section:', /^<section class="chapter">/.test(s.trimStart()));
console.log('ends with </section>:', /<\/section>\s*$/.test(s));
for (const bad of ['<!DOCTYPE', '<html', '<head', '<body', '<main', '<h1', '<script', '<aside', '<footer', 'style=', '<span class=']) {
  if (s.toLowerCase().includes(bad.toLowerCase())) console.log('FORBIDDEN PRESENT:', bad);
}
console.log('data-toc total:', (s.match(/data-toc/g) || []).length);
console.log('&amp;lt; present:', /&amp;lt;/.test(s));
console.log('topic-desc count:', (s.match(/class="topic-desc"/g) || []).length);

// every h4 followed by prose before the next heading or code block
const nodes = [...s.matchAll(/<(h4|h3|h2)>|<h3 id="[^"]+" data-toc>|<h2 id="[^"]+" data-toc>|<div class="codeWrap">|<p/g)];
const order = [];
for (const m of s.matchAll(/<h4>|<h3 id="[^"]+" data-toc>|<h2 id="[^"]+" data-toc>|<div class="codeWrap">|<p class="topic-desc">|<p>|<table>/g)) {
  order.push(m[0].slice(0, 12));
}
let bad = 0;
for (let i = 0; i < order.length; i++) {
  if (order[i] === '<h4>') {
    const nxt = order[i + 1];
    if (!nxt || nxt.startsWith('<p')) continue;
    bad++; console.log('h4 not followed by prose:', i, nxt);
  }
}
console.log('h4-without-prose:', bad);

// chapters and per-chapter h3 counts
const secs = s.split('<section class="chapter">').slice(1);
secs.forEach((sec, i) => {
  const h2 = (sec.match(/<h2 id="([^"]+)"/) || [])[1];
  const n3 = (sec.match(/<h3 id="[^"]+" data-toc>/g) || []).length;
  const ncode = (sec.match(/<div class="codeWrap">/g) || []).length;
  console.log(`ch${i} ${h2}: h3=${n3} code=${ncode}`);
});
