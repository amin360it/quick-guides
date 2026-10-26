// SEO audit across every page in the library.
// Reports per-page head-tag presence, uniqueness problems, and cross-file wiring.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Every .html in the repo root, excluding backups/artifacts
const ARTIFACTS = new Set(['favorites.html', 'test.html', 'search.html']);
const pages = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !ARTIFACTS.has(f))
  .filter((f) => !/\.bak$/.test(f));

const rows = [];
const titleSeen = new Map();
const descSeen = new Map();
const canonicalSeen = new Map();
const problems = [];

for (const f of pages) {
  const s = read(f);
  const head = s.slice(0, s.indexOf('</head>'));
  const get = (re) => (head.match(re) || [])[1] || '';

  const title = get(/<title>([\s\S]*?)<\/title>/).trim();
  const desc = get(/<meta\s+name="description"\s+content="([^"]*)"/);
  const canonical = get(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  const ogTitle = get(/<meta\s+property="og:title"\s+content="([^"]*)"/);
  const twTitle = get(/<meta\s+name="twitter:title"\s+content="([^"]*)"/);
  const ogImage = get(/<meta\s+property="og:image"\s+content="([^"]*)"/);
  const jsonld = (head.match(/application\/ld\+json/g) || []).length;
  const ogCount = (head.match(/property="og:/g) || []).length;
  const twCount = (head.match(/name="twitter:/g) || []).length;
  const themeColor = (head.match(/name="theme-color"/g) || []).length;
  const viewport = head.includes('name="viewport"');
  const charset = head.includes('charset');
  const icon = head.includes('rel="icon"');
  const manifest = head.includes('rel="manifest"');
  const robots = get(/<meta\s+name="robots"\s+content="([^"]*)"/);
  const hasH1 = /<h1[\s>]/.test(s);
  const h1BeforeH2 = (() => {
    const i1 = s.search(/<h1[\s>]/);
    const i2 = s.search(/<h2[\s>]/);
    return i1 !== -1 && (i2 === -1 || i1 < i2);
  })();

  if (!title) problems.push(`${f}: missing <title>`);
  if (!desc) problems.push(`${f}: missing description`);
  if (!canonical) problems.push(`${f}: missing canonical`);
  if (!ogTitle) problems.push(`${f}: missing og:title`);
  if (!twTitle) problems.push(`${f}: missing twitter:title`);
  if (!ogImage) problems.push(`${f}: missing og:image`);
  if (!viewport) problems.push(`${f}: missing viewport`);
  if (!charset) problems.push(`${f}: missing charset`);
  if (!icon) problems.push(`${f}: missing favicon`);
  if (!manifest) problems.push(`${f}: missing manifest link`);
  if (jsonld === 0) problems.push(`${f}: no JSON-LD`);
  if (!hasH1) problems.push(`${f}: no <h1>`);
  if (hasH1 && !h1BeforeH2) problems.push(`${f}: h1 not before first h2`);

  if (title) {
    const k = title.toLowerCase();
    titleSeen.has(k) ? titleSeen.get(k).push(f) : titleSeen.set(k, [f]);
  }
  if (desc) {
    const k = desc.toLowerCase();
    descSeen.has(k) ? descSeen.get(k).push(f) : descSeen.set(k, [f]);
  }
  if (canonical) {
    canonicalSeen.has(canonical)
      ? canonicalSeen.get(canonical).push(f)
      : canonicalSeen.set(canonical, [f]);
  }

  rows.push({
    f,
    title,
    tLen: title.length,
    dLen: desc.length,
    og: ogCount,
    tw: twCount,
    jsonld,
    tc: themeColor,
  });
}

for (const [k, arr] of titleSeen) if (arr.length > 1) problems.push(`DUPLICATE title: ${arr.join(', ')}`);
for (const [k, arr] of descSeen) if (arr.length > 1) problems.push(`DUPLICATE description: ${arr.join(', ')}`);
for (const [k, arr] of canonicalSeen) if (arr.length > 1) problems.push(`DUPLICATE canonical (${k}): ${arr.join(', ')}`);

// sitemap coverage
const sitemap = read('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const locNames = new Set(locs.map((u) => u.split('/').pop()));
const missingFromSitemap = pages.filter((f) => !locNames.has(f));
if (missingFromSitemap.length) problems.push(`NOT in sitemap: ${missingFromSitemap.join(', ')}`);

// sitemap well-formedness
const urlOpen = (sitemap.match(/<url>/g) || []).length;
const urlClose = (sitemap.match(/<\/url>/g) || []).length;
if (urlOpen !== urlClose) problems.push(`sitemap: <url> ${urlOpen} vs </url> ${urlClose}`);
const locCount = locs.length;
if (urlOpen !== locCount) problems.push(`sitemap: ${urlOpen} <url> blocks but ${locCount} <loc>`);

// manifest
try {
  JSON.parse(read('manifest.json'));
} catch (e) {
  problems.push(`manifest.json invalid JSON: ${e.message}`);
}

// index / topics link coverage
const index = read('index.html');
const topics = read('topics.html');
const notIndexed = pages.filter((f) => !index.includes(f));
if (notIndexed.length) problems.push(`NOT linked from index.html: ${notIndexed.join(', ')}`);
const notInTopics = pages.filter((f) => !topics.includes(f));
if (notInTopics.length) problems.push(`NOT linked from topics.html: ${notInTopics.join(', ')}`);

// searchindex
try {
  const si = JSON.parse(read('searchindex.json'));
  const arr = Array.isArray(si) ? si : si.guides || si.items || [];
  const idxFiles = new Set(
    (Array.isArray(arr) ? arr : Object.values(arr))
      .map((x) => (typeof x === 'string' ? x : x.file || x.url || x.href || ''))
      .map((u) => u.split('/').pop())
      .filter(Boolean)
  );
  // hubs are not guide-search entries; the index powers guide search only
  const HUBS = new Set(['index.html', 'topics.html']);
  const missSearch = pages.filter((f) => !idxFiles.has(f) && !HUBS.has(f));
  if (missSearch.length) problems.push(`NOT in searchindex.json: ${missSearch.join(', ')}`);
} catch (e) {
  problems.push(`searchindex.json unreadable: ${e.message}`);
}

console.log(`pages audited: ${rows.length}`);
console.log('');
console.log('file'.padEnd(40), 'tLen', 'dLen', 'og', 'tw', 'ld', 'tc');
for (const r of rows) {
  console.log(
    r.f.padEnd(40),
    String(r.tLen).padStart(4),
    String(r.dLen).padStart(4),
    String(r.og).padStart(2),
    String(r.tw).padStart(2),
    String(r.jsonld).padStart(2),
    String(r.tc).padStart(2)
  );
}
console.log('\n===== PROBLEMS (' + problems.length + ') =====');
for (const p of problems) console.log(' - ' + p);
