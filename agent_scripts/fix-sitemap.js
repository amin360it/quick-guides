// Rebuild sitemap.xml as well-formed XML.
// - preserves the <lastmod> of URLs already present (except a malformed one)
// - drops the malformed orphan </url> block
// - adds every real page that is missing
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://amin360it.github.io/quick-guides';
const TODAY = '2026-10-14';

const ARTIFACTS = new Set(['search.html', 'favorites.html', 'test.html']);
const pages = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !ARTIFACTS.has(f))
  .filter((f) => !/\.bak$/.test(f))
  .sort();

// preserve existing lastmod map
const old = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const lastmod = new Map();
for (const m of old.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
  lastmod.set(m[1].split('/').pop(), m[2]);
}

const prio = (f) => (f === 'index.html' ? '1.0' : f === 'topics.html' ? '0.6' : '0.8');
const freq = (f) => (f === 'index.html' ? 'weekly' : 'monthly');

// index first, topics second, then the rest alphabetically
const order = (f) => (f === 'index.html' ? 0 : f === 'topics.html' ? 1 : 2);
pages.sort((a, b) => order(a) - order(b) || a.localeCompare(b));

const urls = pages.map((f) => {
  const lm = lastmod.get(f) || TODAY;
  return (
    '  <url>\n' +
    `    <loc>${SITE}/${f}</loc>\n` +
    `    <lastmod>${lm}</lastmod>\n` +
    `    <changefreq>${freq(f)}</changefreq>\n` +
    `    <priority>${prio(f)}</priority>\n` +
    '  </url>'
  );
});

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.join('\n') +
  '\n</urlset>\n';

// self-check: balanced, one loc per url
const open = (xml.match(/<url>/g) || []).length;
const close = (xml.match(/<\/url>/g) || []).length;
const locs = (xml.match(/<loc>/g) || []).length;
if (open !== close || open !== locs) {
  throw new Error(`sitemap self-check failed: url=${open}/${close} loc=${locs}`);
}
if (!xml.includes(`<loc>${SITE}/index.html</loc>`)) throw new Error('index missing');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml rewritten: ${open} URLs`);
