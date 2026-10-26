const fs = require('fs');
const s = fs.readFileSync(process.argv[2] || 'nextjs.html', 'utf8');

// repeats: no code sample contains a 2nd copy of its own first 200 chars
const re = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, n = 0, dup = 0;
while ((m = re.exec(s))) {
  n++;
  const t = m[1];
  const head = t.slice(0, 200);
  if (head.length >= 40 && t.indexOf(head, 40) !== -1) {
    dup++;
    console.log('DUPLICATE-CANDIDATE sample', n, JSON.stringify(head.slice(0, 60)));
  }
}
console.log('samples:', n, 'duplicate-suspect:', dup);

// structural counts
const count = (re) => (s.match(re) || []).length;
console.log('main open/close:', count(/<main id="content">/g), count(/<\/main>/g));
console.log('sections:', count(/<section class="chapter">/g));
console.log('h1:', count(/<h1\b/g), 'h2:', count(/<h2\b/g), 'h3:', count(/<h3\b/g), 'h4:', count(/<h4\b/g));
console.log('ch-toc blocks:', count(/<div class="ch-toc">/g));
console.log('codeWrap open/close:', count(/<div class="codeWrap">/g), count(/<\/div>/g) /*all divs*/);

// first heading in main is h1
const mainStart = s.indexOf('<main id="content">');
const firstH = s.slice(mainStart).match(/<h[1-6]\b[^>]*>/);
console.log('first heading in main:', firstH && firstH[0]);

// tag balance for structural tags
for (const tag of ['div','section','pre','code','nav','aside','main','p','h4','h3','h2']) {
  const open = (s.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>', 'g')) || []).length;
  const close = (s.match(new RegExp('</' + tag + '>', 'g')) || []).length;
  if (open !== close) console.log('IMBALANCE', tag, open, close);
}
console.log('tag balance check done');
