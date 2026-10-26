'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS = new Set(['favorites.html', 'test.html', 'search.html']);
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !ARTIFACTS.has(f) && !/\.bak$/.test(f));
let bad = 0;
for (const f of pages) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const m = s.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) { console.log('NO JSON-LD: ' + f); bad++; continue; }
  try {
    const o = JSON.parse(m[1]);
    const g = o['@graph'] || [];
    const types = g.map((n) => n['@type']).join(',');
    const art = g.find((n) => n['@type'] === 'TechArticle');
    if (art && (!art.headline || !art.name || !Array.isArray(art.hasPart))) {
      console.log('WEAK: ' + f + ' headline=' + !!art.headline + ' name=' + !!art.name + ' hasPart=' + (art.hasPart || []).length);
      bad++;
    }
  } catch (e) {
    console.log('INVALID JSON-LD: ' + f + ' -> ' + e.message);
    bad++;
  }
}
console.log(`\n${pages.length} pages | json-ld problems: ${bad}`);
