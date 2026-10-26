'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS = new Set(['favorites.html', 'test.html', 'search.html']);
const pages = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && !ARTIFACTS.has(f) && !/\.bak$/.test(f))
  .sort();
const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].split('/').pop());
const set = new Set(locs);
const missing = pages.filter((f) => !set.has(f));
const extra = locs.filter((f) => !pages.includes(f));
console.log('pages:', pages.length, '| sitemap locs:', locs.length);
console.log('missing from sitemap:', missing.join(', ') || '(none)');
console.log('extra in sitemap:', extra.join(', ') || '(none)');
const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
console.log('manifest fields:', Object.keys(man).join(', '));
console.log('manifest icons:', (man.icons || []).length, '| shortcuts:', (man.shortcuts || []).length);
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
console.log('robots references sitemap:', /Sitemap:/i.test(robots));
