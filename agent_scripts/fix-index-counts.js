// Sync every aggregate count rendered in index.html with the real content:
// the hero stats, the four pillars, the eleven category tiles, each guide card's
// topic count, and the global count phrases in the head/JSON-LD.
// Dry-run unless --write.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WRITE = process.argv.includes('--write');
const EXCLUDE = /^(index|topics|search|favorites|test|searchindex)\b/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();

const fmt = (v) => v.toLocaleString('en-US');

// per-guide topics = <h2>/<h3> carrying data-toc
const per = {};
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const main = s.slice(s.indexOf('<main id='), s.lastIndexOf('</main>'));
  per[f] = (main.match(/<h[23][^>]*\bdata-toc\b/g) || []).length;
}
const S = {
  guides: files.length,
  chapters: files.reduce((a, f) => a + ((fs.readFileSync(path.join(ROOT, f), 'utf8').match(/<h2[ >]/g) || []).length), 0),
  sub: files.reduce((a, f) => a + ((fs.readFileSync(path.join(ROOT, f), 'utf8').match(/<h3[ >]/g) || []).length), 0),
  topics: files.reduce((a, f) => a + per[f], 0),
  code: files.reduce((a, f) => a + ((fs.readFileSync(path.join(ROOT, f), 'utf8')).match(/class="codeWrap"/g) || []).length, 0),
  ex: files.reduce((a, f) => a + ((fs.readFileSync(path.join(ROOT, f), 'utf8')).match(/<div class="ex">/g) || []).length, 0),
};

const P = path.join(ROOT, 'index.html');
let s = fs.readFileSync(P, 'utf8');
const log = [];
const sub = (re, to, label) => {
  let n = 0;
  s = s.replace(re, (...a) => { n++; return typeof to === 'function' ? to(...a) : to; });
  if (n) log.push(`${label}: ${n}`);
};

// ---- 1. global phrases ----
sub(/\b\d[\d,]* self-contained HTML guides\b/g, `${S.guides} self-contained HTML guides`, 'desc guides');
sub(/\b\d[\d,]* chapters\b/g, `${fmt(S.chapters)} chapters`, 'chapters');
sub(/\b\d[\d,]* sub-sections\b/g, `${fmt(S.sub)} sub-sections`, 'sub-sections');
sub(/\b\d[\d,]* linked topics\b/g, `${fmt(S.topics)} linked topics`, 'linked topics');
sub(/\b\d[\d,]* code samples\b/g, `${fmt(S.code)} code samples`, 'code samples');
sub(/\b\d[\d,]* topics and \d[\d,]* exercise sets\b/g, `${fmt(S.topics)} topics and ${fmt(S.ex)} exercise sets`, 'topics+ex');
sub(/\b\d[\d,]* Offline Developer Guides\b/g, `${S.guides} Offline Developer Guides`, 'title');
sub(/\b\d[\d,]* HTML Guides\b/g, `${S.guides} HTML Guides`, 'html guides');
sub(/\b\d[\d,]* complete guides\b/g, `${S.guides} complete guides`, 'complete guides');
sub(/Search \d[\d,]* guides\b/g, `Search ${S.guides} guides`, 'search');
sub(/"numberOfItems":\d+/g, `"numberOfItems":${S.guides}`, 'numberOfItems');

// ---- 2. hero stat list ----
for (const [label, val] of [['guides', S.guides], ['chapters', S.chapters], ['sub-sections', S.sub], ['linked topics', S.topics], ['topics', S.topics], ['code samples', S.code], ['exercise sets', S.ex]]) {
  sub(new RegExp(`<b>[\\d,]+</b>(<span>)${label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}</span>`), `<b>${fmt(val)}</b>$1${label}</span>`, 'hero ' + label);
}

// ---- 3. category tiles (eleven) ----
const cats = {};
{
  const re = /data-cat="([^"]+)" data-file="([^"]+)"/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const c = m[1], f = m[2];
    cats[c] = cats[c] || { n: 0, topics: 0 };
    cats[c].n++; cats[c].topics += per[f] || 0;
  }
}
sub(/(<a class="am-tile" href="#cat-([a-z-]+)"[\s\S]*?<span class="am-tile-n">)[^<]*(<\/span>)/g, (w, p1, c, p2) => {
  const v = cats[c];
  return v ? `${p1}${v.n} guides &middot; ${fmt(v.topics)} topics${p2}` : w;
}, 'tiles');

// ---- 4. four pillars (Software, Web, Mobile, Digital) ----
const GROUP = {
  Software: ['languages', 'foundations', 'frameworks'],
  Web: ['frontend', 'web-basics'],
  Mobile: ['mobile'],
  Digital: ['data', 'devops', 'architecture', 'wordpress', 'ai'],
};
const pillarVals = {};
for (const [name, members] of Object.entries(GROUP)) {
  pillarVals[name] = {
    n: members.reduce((a, c) => a + (cats[c] ? cats[c].n : 0), 0),
    topics: members.reduce((a, c) => a + (cats[c] ? cats[c].topics : 0), 0),
  };
}
let pi = 0;
const order = ['Software', 'Web', 'Mobile', 'Digital'];
sub(/(<a class="am-pillar"[\s\S]*?<span class="am-pillar-n">)[^<]*(<\/span>)/g, (w, p1, p2) => {
  const name = order[pi++];
  const v = pillarVals[name];
  return v ? `${p1}${v.n} guides &middot; ${fmt(v.topics)} topics${p2}` : w;
}, 'pillars');

// ---- 5. per-card topic counts ----
sub(/(<article class="am-card" data-cat="[^"]+" data-file="([^"]+)"[\s\S]*?<span class="am-card-f"><span>)[^<]*(<\/span>)/g, (w, p1, f, p2) => {
  return per[f] != null ? `${p1}${per[f]} topics${p2}` : w;
}, 'cards');

console.log('stats:', JSON.stringify(S));
for (const l of log) console.log('  ' + l);
if (s !== fs.readFileSync(P, 'utf8')) {
  console.log('index.html changed');
  if (WRITE) fs.writeFileSync(P, s);
} else console.log('index.html unchanged');
