// Repo-wide internal link + anchor integrity.
// For every page: every relative href must resolve to a file that exists, and every
// #fragment must resolve to an id (or name) in the target .html file. Code samples,
// external, mailto, javascript:, data:, site-absolute and bare "#" links are ignored.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS = new Set(['favorites.html', 'test.html', 'search.html']);
const pages = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && !ARTIFACTS.has(f) && !/\.bak$/.test(f))
  .sort();

const stripCode = (s) => s.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code[\s\S]*?<\/code>/g, '');

const ids = new Map();
const hrefs = new Map();
for (const f of pages) {
  const raw = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const s = stripCode(raw);
  const set = new Set();
  for (const m of raw.matchAll(/\bid="([^"]+)"/g)) set.add(m[1]);
  for (const m of raw.matchAll(/\bname="([^"]+)"/g)) set.add(m[1]);
  ids.set(f, set);
  const list = [];
  const lineOf = (i) => s.slice(0, i).split('\n').length;
  for (const m of s.matchAll(/\bhref="([^"]*)"/g)) list.push({ raw: m[1], line: lineOf(m.index) });
  hrefs.set(f, list);
}

const exists = (rel) => {
  try {
    return fs.existsSync(path.join(ROOT, rel));
  } catch {
    return false;
  }
};
const dec = (t) => {
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
};

let bad = 0;
let checked = 0;
const skip = (raw) =>
  !raw ||
  raw.startsWith('http') ||
  raw.startsWith('//') ||
  raw.startsWith('/') ||
  raw.startsWith('?') ||
  raw.startsWith('mailto:') ||
  raw.startsWith('tel:') ||
  raw.startsWith('javascript:') ||
  raw.startsWith('data:') ||
  raw === '#';

for (const f of pages) {
  for (const { raw, line } of hrefs.get(f)) {
    if (skip(raw)) continue;
    let target = f;
    let frag = '';
    if (raw.startsWith('#')) frag = dec(raw.slice(1));
    else {
      const [p, q] = raw.split('#');
      target = dec(p);
      frag = q ? dec(q) : '';
      if (!exists(target)) {
        console.log(`MISSING FILE   ${f}:${line}  -> ${raw}`);
        bad++;
        continue;
      }
    }
    checked++;
    if (frag && target.endsWith('.html') && pages.includes(target) && !ids.get(target).has(frag)) {
      console.log(`MISSING ANCHOR ${f}:${line}  -> ${raw}`);
      bad++;
    }
  }
}
console.log(`\n${pages.length} pages | ${checked} internal links checked | problems: ${bad}`);
