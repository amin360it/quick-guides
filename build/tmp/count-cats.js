// Per-category guide + topic counts, measured from disk, vs what index.html claims.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// topics per guide, measured
const skip = new Set(['index.html', 'topics.html', 'search.html', 'favorites.html']);
const topicsOf = {};
for (const f of fs.readdirSync(root).filter(f => f.endsWith('.html') && !skip.has(f))) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  const h2 = (s.match(/<h2 [^>]*\sdata-toc(?=[\s>])/g) || []).length;
  const h3 = (s.match(/<h3 [^>]*\sdata-toc(?=[\s>])/g) || []).length;
  topicsOf[f] = h2 + h3;
}

// categories from the card sections
const cats = [];
for (const m of idx.matchAll(/<section class="am-band" id="(cat-[^"]+)" data-cat="([^"]+)"[\s\S]*?<\/section>/g)) {
  const id = m[1], key = m[2];
  const inner = m[0];
  const files = [...inner.matchAll(/data-file="([^"]+)"/g)].map(x => x[1]);
  cats.push({ key, id, files });
}

const total = { guides: 0, topics: 0 };
console.log('category            cards  topics(real)');
for (const c of cats) {
  const t = c.files.reduce((a, f) => a + (topicsOf[f] || 0), 0);
  total.guides += c.files.length; total.topics += t;
  const claimedChip = (idx.match(new RegExp('data-filter="' + c.key + '"[\\s\\S]{0,120}?am-chip-n">([\\d,]+)<')) || [])[1];
  const claimedTile = (idx.match(new RegExp('<strong>[^<]*</strong><span class="am-tile-n">(\\d+) guides[^<]*?([\\d,]+) topics')) || []);
  console.log(
    c.key.padEnd(20),
    String(c.files.length).padStart(3),
    String(t).padStart(9),
    '| chip says', String(claimedChip).padStart(3)
  );
}
console.log('TOTAL', total.guides, 'guides /', total.topics, 'topics');

// tiles: name -> guide/topic claim
console.log('\n--- category tiles as written ---');
for (const m of idx.matchAll(/<span class="am-tile-b">\s*<strong>([^<]+)<\/strong>\s*<span class="am-tile-n">([\d,]+) guides &middot; ([\d,]+) topics/g)) {
  console.log(' ', m[1].padEnd(26), m[2].padStart(2), 'guides', m[3].padStart(6), 'topics');
}
console.log('\n--- pillars as written ---');
for (const m of idx.matchAll(/<strong>([^<]+)<\/strong>\s*<span class="am-pillar-l">[^<]*<\/span>\s*<span class="am-pillar-n">([\d,]+) guides &middot; ([\d,]+) topics/g)) {
  console.log(' ', m[1].padEnd(12), m[2].padStart(2), 'guides', m[3].padStart(6), 'topics');
}
