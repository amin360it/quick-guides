// Regenerate searchindex.json in the repo root from every guide.
// Same shape as the original buildsearchindex.js, plus correct exclusions.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'searchindex.json');

const EXCLUDE = /^(index|topics|search|favorites|test)\.html$/;
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();

const strip = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&mdash;/g, '—')
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/[▸·•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const index = [];
for (const file of pages) {
  const t = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const title = (t.match(/<title>([^<]+)<\/title>/) || [, file])[1].trim();
  const desc = (t.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1].trim();

  const chapters = [];
  const re = /<h([23]) id="([^"]+)" data-toc>(.*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(t)) !== null) chapters.push({ level: +m[1], id: m[2], text: strip(m[3]) });

  const snippets = [];
  const dre = /<p class="topic-desc">([\s\S]*?)<\/p>/g;
  while ((m = dre.exec(t)) !== null) {
    const s2 = strip(m[1]).slice(0, 140);
    if (s2) snippets.push(s2);
  }

  const hay = (title + ' ' + desc + ' ' + chapters.map((c) => c.text).join(' ') + ' ' + snippets.join(' ')).toLowerCase();
  index.push({ file, title, desc, chapters, snippets: snippets.slice(0, 40), hay });
}

index.sort((a, b) => a.file.localeCompare(b.file));
const out = JSON.stringify(index);
JSON.parse(out); // self-check
fs.writeFileSync(OUT, out, 'utf8');
console.log(`searchindex.json: ${index.length} guides, ${Buffer.byteLength(out)} bytes`);
