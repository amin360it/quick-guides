// Rebuild the guide topic trees in topics.html from every guide's headings.
// Also refreshes the topic total and guide count in the title, h1, meta and JSON-LD.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://amin360it.github.io/quick-guides';
const FILE = path.join(ROOT, 'topics.html');

// ---- catalog (order + labels + category) from shell.js ----
const shell = fs.readFileSync(path.join(ROOT, 'assets', 'shell.js'), 'utf8');
const ci = shell.indexOf('GUIDES_CATALOG =');
const cj = shell.indexOf('];', ci);
if (ci < 0 || cj < 0) throw new Error('GUIDES_CATALOG not found');
const GUIDES_CATALOG = eval(shell.slice(ci + 'GUIDES_CATALOG ='.length, cj + 1));

const EXCLUDE = /^(index|topics|search|favorites|test)\.html$/;
const onDisk = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f));
const inCatalog = new Set();
for (const g of GUIDES_CATALOG) for (const [f] of g.guides) inCatalog.add(f);
const missing = onDisk.filter((f) => !inCatalog.has(f));
if (missing.length) console.warn('WARNING not in catalog:', missing.join(', '));

// ---- helpers ----
const escText = (t) => String(t).replace(/<[^>]+>/g, '').trim();
const escAttr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headings(file) {
  const t = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const main = t.slice(t.indexOf('<main id='), t.lastIndexOf('</main>'));
  const out = [];
  const re = /<h([234]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(main)) !== null) out.push({ level: +m[1], id: m[2], text: escText(m[3]) });
  return out;
}

function buildTree(items) {
  const root = [];
  const stack = [];
  for (const it of items) {
    const node = { ...it, children: [] };
    while (stack.length && stack[stack.length - 1].level >= node.level) stack.pop();
    if (stack.length) stack[stack.length - 1].children.push(node);
    else root.push(node);
    stack.push(node);
  }
  return root;
}

function render(nodes, depth, file) {
  let out = '';
  for (const n of nodes) {
    const pad = ' '.repeat(8 + 4 * depth);
    out += `${pad}<li><a href="${file}#${n.id}">${n.text}</a>`;
    if (n.children.length) {
      out += '\n' + ' '.repeat(10 + 4 * depth) + '<ul>\n';
      out += render(n.children, depth + 1, file);
      out += ' '.repeat(10 + 4 * depth) + '</ul>\n';
      out += pad + '</li>\n';
    } else {
      out += '</li>\n';
    }
  }
  return out;
}

const blocks = [];
let total = 0;
for (const g of GUIDES_CATALOG) {
  for (const [file, label] of g.guides) {
    const items = headings(file);
    const count = items.filter((x) => x.level <= 3).length;
    total += count;
    blocks.push(
      `<details class="am-tg" data-cat="${g.id}">\n` +
        `      <summary class="am-tg-sum"><span class="am-tg-t">${escAttr(label)}</span><span class="am-tg-n">${count}</span></summary>\n` +
        `      <ul class="am-tlist">\n` +
        render(buildTree(items), 0, file) +
        `      </ul>\n` +
        `    </details>`
    );
  }
}
const guideCount = GUIDES_CATALOG.reduce((a, g) => a + g.guides.length, 0);

// ---- splice ----
let s = fs.readFileSync(FILE, 'utf8');
const OPEN = '<div class="am-tgroups" id="tgroups">';
const open = s.indexOf(OPEN);
if (open < 0) throw new Error('tgroups not found');
const openEnd = open + OPEN.length;
const close = (() => {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = open;
  let depth = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m[0] === '</div>') { depth--; if (depth === 0) return m.index; }
    else depth++;
  }
  return -1;
})();
if (close < 0) throw new Error('unbalanced tgroups');
const inner = s.slice(openEnd, close);
const indent = (inner.match(/\n([ \t]*)$/) || [, '  '])[1];
s = s.slice(0, openEnd) + '\n' + blocks.join('\n') + '\n' + indent + s.slice(close);

// ---- counts ----
const totalFmt = total.toLocaleString('en-US');
s = s.replace(/(\d{1,3}(?:,\d{3})*) topics/g, `${totalFmt} topics`);
s = s.replace(/\d+ offline developer guides/g, `${guideCount} offline developer guides`);

// ---- inline stats paragraph (guides / chapters / subsections / topics / sub-headings) ----
let chapters = 0;
let subs = 0;
let subheads = 0;
for (const f of onDisk) {
  const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
  chapters += (t.match(/<h2[ >]/g) || []).length;
  subs += (t.match(/<h3[ >]/g) || []).length;
  subheads += (t.match(/<h4[ >]/g) || []).length;
}
const F = (n) => n.toLocaleString('en-US');
s = s.replace(
  /<p><b>\d[\d,]* guides<\/b> &middot; [\d,]+ chapters &middot; [\d,]+ subsections &middot; [\d,]+ topics &middot; [\d,]+ sub-headings\.<\/p>/,
  `<p><b>${F(guideCount)} guides</b> &middot; ${F(chapters)} chapters &middot; ${F(subs)} subsections &middot; ${totalFmt} topics &middot; ${F(subheads)} sub-headings.</p>`
);

// ---- JSON-LD ItemList ----
const ilAt = s.indexOf('"@type":"ItemList"');
if (ilAt > 0) {
  const arrAt = s.indexOf('"itemListElement":[', ilAt);
  if (arrAt > 0) {
    const start = s.indexOf('[', arrAt);
    let depth = 0;
    let end = -1;
    let inStr = false;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (ch === '\\') i++;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') inStr = true;
      else if (ch === '[') depth++;
      else if (ch === ']') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end < 0) throw new Error('ItemList array not closed');
    const entries = [];
    let pos = 1;
    for (const g of GUIDES_CATALOG)
      for (const [file, label] of g.guides)
        entries.push(`{"@type":"ListItem","position":${pos++},"name":${JSON.stringify(label)},"url":"${SITE}/${file}"}`);
    s = s.slice(0, start) + '[' + entries.join(',') + ']' + s.slice(end + 1);
    s = s.replace(/"numberOfItems":\d+/, `"numberOfItems":${guideCount}`);
  }
}

fs.writeFileSync(FILE, s, 'utf8');
console.log(`topics.html rebuilt: ${guideCount} guides, ${totalFmt} topics`);
