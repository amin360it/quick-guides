const s = require('fs').readFileSync('index.html', 'utf8');
const want = ['nodejs', 'bun', 'java', 'fontawesome-icons', 'docker-compose', 'n8n', 'chatgpt', 'midjourney', 'claude', 'static-dynamic-website-development'];
let miss = 0;
for (const f of want) {
  const needle = `data-file="${f}.html"`;
  const i = s.indexOf(needle);
  if (i < 0) { miss++; console.log(f.padEnd(34), 'MISSING'); continue; }
  // print the card, from the article open to </article>
  const start = s.lastIndexOf('<article', i);
  const end = s.indexOf('</article>', i) + 10;
  const card = s.slice(start, end).replace(/\n\s*/g, ' ').trim();
  console.log(f.padEnd(34), card.slice(0, 240));
}
console.log('\nmissing:', miss);
