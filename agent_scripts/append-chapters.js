'use strict';
/*
 append-chapters.js — append new chapters (from a fragment) to an existing guide,
 inserting them BEFORE the appendix chapter, then regenerate nav/ch-toc/band.

   node append-chapters.js <guide.html> <fragment.html> [--write]

 Safety:
   - refuses if any id in the fragment already exists in the guide;
   - refuses if the fragment has no <h2> chapters;
   - requires every fragment chapter to carry <h2 ... data-toc>;
   - backs the guide up to build/bak/append/ before writing;
   - asserts the section/h3/code counts moved by exactly the fragment's counts;
   - runs finalize-guide.js --no-head to rebuild the mechanical parts.
 Dry-run unless --write.
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const guide = positional[0];
const frag = positional[1];
const write = args.includes('--write');
if (!guide || !frag) { console.log('usage: node append-chapters.js <guide.html> <fragment.html> [--write]'); process.exit(1); }

const gAbs = path.join(ROOT, guide);
const fAbs = path.join(ROOT, frag);
if (!fs.existsSync(gAbs)) { console.error('no guide: ' + guide); process.exit(2); }
if (!fs.existsSync(fAbs)) { console.error('no fragment: ' + frag); process.exit(2); }

let src = fs.readFileSync(gAbs, 'utf8');
const rawFrag = fs.readFileSync(fAbs, 'utf8');

const count = (t, re) => (t.match(re) || []).length;
const secRe = /<section class="chapter">/g;

// ---- normalise the fragment into one <section class="chapter"> per <h2> ----
function normalizeChapters(f) {
  let x = f
    .replace(/<div class="ch-toc">[\s\S]*?<\/div><\/div>/g, '') // drop stale ch-toc
    .replace(/<section class="chapter"[^>]*>/g, '\n')
    .replace(/<\/section>/g, '\n');
  const parts = x.split(/(?=<h2\b)/);
  const out = [];
  for (const p of parts) {
    if (!/<h2\b/.test(p)) continue;
    out.push('<section class="chapter">\n' + p.trim() + '\n</section>\n');
  }
  if (!out.length) { console.error('refuse: fragment has no <h2> chapters'); process.exit(3); }
  return out;
}
const newBlocks = normalizeChapters(rawFrag);

// ---- id-collision check --------------------------------------------------
const idsIn = (t) => [...t.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const guideIds = new Set(idsIn(src));
const collisions = [];
for (const b of newBlocks) for (const id of idsIn(b)) if (guideIds.has(id)) collisions.push(id);
if (collisions.length) {
  console.error('refuse: fragment id(s) already in the guide: ' + [...new Set(collisions)].join(', '));
  process.exit(4);
}

// every fragment chapter must have h2[data-toc]
for (const b of newBlocks) {
  if (!/<h2 id="[^"]+"[^>]*data-toc/.test(b)) {
    console.error('refuse: a fragment chapter has no <h2 ... data-toc>');
    process.exit(5);
  }
}

// ---- find the insertion point (before appendix, else end of main) --------
const mStart = src.indexOf('<main id="content">');
const mEnd = src.lastIndexOf('</main>');
if (mStart < 0 || mEnd < 0) { console.error('refuse: no <main id="content">'); process.exit(6); }

const apx = src.search(/<section class="chapter">\s*<h2 id="appendix"/);
let insertAt;
if (apx >= 0 && apx > mStart && apx < mEnd) {
  insertAt = apx;
} else {
  insertAt = src.lastIndexOf('</main>');
}
// walk back over whitespace so we insert cleanly
while (insertAt > mStart && /\s/.test(src[insertAt - 1])) insertAt--;

const added = newBlocks.join('');
const before = {
  sec: count(src, secRe),
  h3: count(src, /<h3[^>]*data-toc/g),
  h4: count(src, /<h4[ >]/g),
  code: count(src, /class="codeWrap"/g),
};
const add = {
  sec: count(added, secRe),
  h3: count(added, /<h3[^>]*data-toc/g),
  h4: count(added, /<h4[ >]/g),
  code: count(added, /class="codeWrap"/g),
};

let out = src.slice(0, insertAt) + '\n' + added + src.slice(insertAt);

const after = {
  sec: count(out, secRe),
  h3: count(out, /<h3[^>]*data-toc/g),
  h4: count(out, /<h4[ >]/g),
  code: count(out, /class="codeWrap"/g),
};
const ok =
  after.sec === before.sec + add.sec &&
  after.h3 === before.h3 + add.h3 &&
  after.h4 === before.h4 + add.h4 &&
  after.code === before.code + add.code;
console.log(guide + ' + ' + frag);
console.log('  chapters ' + before.sec + ' -> ' + after.sec + ' (add ' + add.sec + ')');
console.log('  h3       ' + before.h3 + ' -> ' + after.h3 + ' (add ' + add.h3 + ')');
console.log('  h4       ' + before.h4 + ' -> ' + after.h4 + ' (add ' + add.h4 + ')');
console.log('  code     ' + before.code + ' -> ' + after.code + ' (add ' + add.code + ')');
if (!ok) { console.error('refuse: count delta does not equal the fragment counts'); process.exit(7); }

if (!write) { console.log('(dry run)'); process.exit(0); }

const bak = path.join(ROOT, 'build', 'bak', 'append');
fs.mkdirSync(bak, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(path.join(bak, guide.replace(/\.html$/, '') + '.' + stamp + '.html'), src);
fs.writeFileSync(gAbs, out);
console.log('  wrote ' + guide + ' (backup in build/bak/append/)');

// regenerate nav / ch-toc / band via the shared finalizer
const r = cp.spawnSync(process.execPath, [path.join(__dirname, 'finalize-guide.js'), guide, '--no-head', '--write'], {
  cwd: ROOT,
  encoding: 'utf8',
});
process.stdout.write(r.stdout || '');
if (r.status !== 0) { process.stderr.write(r.stderr || ''); process.exit(r.status || 8); }
