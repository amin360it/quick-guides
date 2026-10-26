/* buildsearchindex.js — generate build/tmp/searchindex.json from all HTML
 * guides. Every guide contributes: file, title, description, chapter list
 * (h2 + h3 anchors), and a lowercase haystack of its headings + topic-desc
 * paragraphs. The search page loads this single JSON and does everything
 * client-side — no server, no network.
 *
 * Run: node build/tmp/buildsearchindex.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, 'searchindex.json');

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !/^(index|topics|search)\.html$/.test(f));

const strip = s => s
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&mdash;/g, '—').replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ')
  .replace(/[▸·•]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const index = [];
for (const file of pages) {
  const t = fs.readFileSync(path.join(ROOT, file), 'utf8');

  const title = (t.match(/<title>([^<]+)<\/title>/) || [, file])[1].trim();
  const desc = (t.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1].trim();

  /* Chapters = h2[data-toc], sections = h3[data-toc] */
  const chapters = [];
  const re = /<h([23]) id="([^"]+)" data-toc>(.*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const text = strip(m[3]);
    chapters.push({ level: +m[1], id: m[2], text: text });
  }

  /* Topic-desc paragraphs as searchable snippets */
  const snippets = [];
  const dre = /<p class="topic-desc">([\s\S]*?)<\/p>/g;
  while ((m = dre.exec(t)) !== null) {
    const s = strip(m[1]).slice(0, 140);
    if (s) snippets.push(s);
  }

  const hay = (title + ' ' + desc + ' ' + chapters.map(c => c.text).join(' ') + ' ' + snippets.join(' ')).toLowerCase();

  index.push({
    file: file,
    title: title,
    desc: desc,
    chapters: chapters,
    snippets: snippets.slice(0, 40),
    hay: hay
  });
}

index.sort((a, b) => a.file.localeCompare(b.file));
fs.writeFileSync(OUT, JSON.stringify(index), 'utf8');
console.log('OK: searchindex.json — ' + index.length + ' guides, ' +
  fs.statSync(OUT).size + ' bytes → ' + path.relative(ROOT, OUT));
