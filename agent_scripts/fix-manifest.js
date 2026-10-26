// Rewrite manifest.json with valid JSON and an accurate guide count.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const ARTIFACTS = new Set(['index.html', 'topics.html', 'search.html', 'favorites.html', 'test.html']);
const guides = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !ARTIFACTS.has(f))
  .filter((f) => !/\.bak$/.test(f));

const manifest = {
  name: 'Amin360iT Quick Guides',
  short_name: 'Amin360iT',
  description: `Amin360iT Quick Guides — ${guides.length} offline developer guides.`,
  start_url: 'index.html',
  scope: './',
  display: 'standalone',
  background_color: '#03122f',
  theme_color: '#03122f',
  lang: 'en',
  dir: 'ltr',
  icons: [
    {
      src: 'assets/brand/logo.png',
      sizes: '179x160',
      type: 'image/png',
      purpose: 'any',
    },
  ],
};

const out = JSON.stringify(manifest, null, 2) + '\n';
JSON.parse(out); // self-check
fs.writeFileSync(path.join(ROOT, 'manifest.json'), out);
console.log('manifest.json rewritten; guides =', guides.length);
