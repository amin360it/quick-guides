'use strict';
/*
 repair-merged.js — rebuild a guide whose <main> has chapters merged into one
 <section> and/or duplicated (same h2 id appearing twice).

   node repair-merged.js <file.html> [--write]

 Strategy: split <main> into h2 blocks, dedupe by id keeping the richest block
 (most <h4>, then most bytes), order by the leading number in the h2 text
 (orientation = 0, appendix = 9999), and re-wrap each as its own
 <section class="chapter">. Refuses unless the result is strictly better:
 fewer-or-equal duplicate ids, and section/h2 parity.

 A backup goes to build/bak/merged/ before any write.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const write = args.includes('--write');
if (!file) { console.log('usage: node repair-merged.js <file.html> [--write]'); process.exit(1); }
const abs = path.join(ROOT, file);
let src = fs.readFileSync(abs, 'utf8');

const mStart = src.indexOf('<main id="content">');
const mEnd = src.lastIndexOf('</main>');
if (mStart < 0 || mEnd < 0) { console.error('no <main id="content">'); process.exit(2); }
const head = src.slice(0, mStart);
const mainInner = src.slice(mStart, mEnd);
const tail = src.slice(mEnd);

// everything from <main id="content"> up to the first chapter section is
// prefix (the opening tag + the .am-band h1); it must be preserved verbatim.
const firstSec = mainInner.indexOf('<section class="chapter">');
const prefix = firstSec >= 0 ? mainInner.slice(0, firstSec) : mainInner;

// strip the wrapping sections so h2 blocks are contiguous
const flat = mainInner
  .replace(/<section class="chapter">/g, '\n')
  .replace(/<\/section>/g, '\n');

const blockRe = /<h2 id="([^"]+)"[^>]*data-toc[\s\S]*?(?=<h2 id="|$)/g;
const blocks = [];
let m;
while ((m = blockRe.exec(flat))) {
  const body = m[0].trim();
  if (!body) continue;
  const id = m[1];
  const h3 = (body.match(/<h3[^>]*data-toc/g) || []).length;
  const h4 = (body.match(/<h4[ >]/g) || []).length;
  const bytes = Buffer.byteLength(body);
  const title = (body.match(/>([^<]*)<\/h2>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
  let num = 9999;
  if (/^0\b|orientation/i.test(title)) num = 0;
  else {
    const nm = title.match(/(\d+)/);
    if (nm) num = +nm[1];
  }
  if (/appendix/i.test(title)) num = 9999;
  blocks.push({ id, body, h3, h4, bytes, title, num });
}

if (!blocks.length) { console.error('no h2 blocks found'); process.exit(3); }

// dedupe by id: keep the richest
const best = new Map();
for (const b of blocks) {
  const prev = best.get(b.id);
  if (!prev || b.h4 > prev.h4 || (b.h4 === prev.h4 && b.bytes > prev.bytes)) best.set(b.id, b);
}
const kept = [...best.values()];

// order: by num then original encounter order
const order = new Map();
blocks.forEach((b, i) => { if (!order.has(b.id)) order.set(b.id, i); });
kept.sort((a, b) => a.num - b.num || order.get(a.id) - order.get(b.id));

const dupBefore = blocks.length - best.size;
const body = kept.map((b) => '<section class="chapter">\n' + b.body + '\n</section>').join('\n');
const out = head + prefix + body + '\n' + tail;

// assertions
const secOut = (out.match(/<section class="chapter">/g) || []).length;
const secClose = (out.match(/<\/section>/g) || []).length;
const h2Out = (out.match(/<h2[ >]/g) || []).length;
const idsOut = [...out.slice(out.indexOf('<main'), out.lastIndexOf('</main>')).matchAll(/<h2 id="([^"]+)"/g)].map((x) => x[1]);
const dupOut = idsOut.length - new Set(idsOut).size;

console.log(file + ': blocks ' + blocks.length + ' -> kept ' + kept.length + ' (dropped ' + dupBefore + ' duplicates)');
console.log('  order: ' + kept.map((b) => b.id + '(' + b.h4 + 'h4)').join(', '));
console.log('  sections ' + secOut + ' | sectionsClose ' + secClose + ' | h2 ' + h2Out + ' | dup ids ' + dupOut);
if (secOut !== secClose || secOut !== h2Out || dupOut !== 0) {
  console.error('refuse: result is not structurally sound');
  process.exit(4);
}
if (dupBefore <= 0) { console.error('refuse: no duplicates to repair'); process.exit(5); }

if (!write) { console.log('(dry run)'); process.exit(0); }
const bak = path.join(ROOT, 'build', 'bak', 'merged');
fs.mkdirSync(bak, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(path.join(bak, file.replace(/\.html$/, '') + '.' + stamp + '.html'), src);
fs.writeFileSync(abs, out);
console.log('  wrote ' + file + ' (backup in build/bak/merged/)');
