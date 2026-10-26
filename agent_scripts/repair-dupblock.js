'use strict';
/*
 repair-dupblock.js — remove a block that a tool duplicated into the middle of a
 code sample.

 The damage is always the same shape. A heading block

     <h4 id="X">Title</h4><p>Prose</p><div class="codeWrap"><pre><code>// first line

 was emitted twice, and the code block's opening line was emitted a third time:

     HEAD + UNIT + UNIT(+extra) + <div class="codeWrap"><pre><code>// first line
                                   <continuation of the real code>

 The correct text is HEAD + UNIT + continuation. For every duplicated id we keep
 the first UNIT, drop everything from the second copy up to and including the
 last repeated code-opening line, and leave the continuation untouched.

   node repair-dupblock.js <file.html> [--write]
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');
const skipArg = process.argv.find((a) => a.startsWith('--skip='));
const SKIP = new Set(skipArg ? skipArg.slice('--skip='.length).split(',').filter(Boolean) : []);
if (!positional.length) { console.log('usage: node repair-dupblock.js <file.html> [--skip=id,id] [--write]'); process.exit(1); }

for (const f of positional) {
  const abs = path.join(ROOT, f);
  const src = fs.readFileSync(abs, 'utf8');

  // anchor on the tag itself, so the "unit" starts at <h4 (not at the space in it)
  const ids = [...src.matchAll(/<h4\s+id="([^"]+)"/g)].map((m) => ({ id: m[1], at: m.index }));
  const counts = new Map();
  for (const { id } of ids) counts.set(id, (counts.get(id) || 0) + 1);
  const dups = [...counts.entries()].filter(([, n]) => n === 2).map(([id]) => id).filter((id) => !SKIP.has(id));

  const spans = [];
  for (const id of dups) {
    const occ = ids.filter((x) => x.id === id);
    const A = occ[0].at, A2 = occ[1].at;
    const unit = src.slice(A, A2);
    const mIdx = unit.lastIndexOf('<div class="codeWrap"><pre><code>');
    if (mIdx < 0) { console.error('refuse: no code-open before second ' + id); process.exit(2); }
    const marker = unit.slice(mIdx);
    // search only up to the next h3 (the site is one sub-section)
    const nextH3 = src.indexOf('<h3 ', A2);
    const limit = nextH3 < 0 ? src.length : nextH3;
    let E = -1, from = A2;
    for (;;) {
      const at = src.indexOf(marker, from);
      if (at < 0 || at + marker.length > limit) break;
      E = at + marker.length;
      from = at + 1;
    }
    if (E < 0) { console.error('refuse: no repeated code-open after ' + id); process.exit(3); }
    if (!src.slice(A2).startsWith('<h4')) { console.error('refuse: second ' + id + ' is not an h4 block'); process.exit(4); }
    spans.push({ id, from: A2, to: E, marker });
  }

  spans.sort((a, b) => b.from - a.from);
  let out = src;
  let removedCode = 0;
  for (const sp of spans) {
    removedCode += (src.slice(sp.from, sp.to).match(/<div class="codeWrap">/g) || []).length;
    out = out.slice(0, sp.from) + out.slice(sp.to);
  }

  const h4 = (t) => (t.match(/<h4[ >]/g) || []).length;
  const code = (t) => (t.match(/<div class="codeWrap">/g) || []).length;
  const dupAfter = (() => {
    const c = new Map();
    for (const m of out.matchAll(/\sid="([^"]+)"/g)) c.set(m[1], (c.get(m[1]) || 0) + 1);
    return [...c.entries()].filter(([id, n]) => n > 1 && !SKIP.has(id)).length;
  })();

  console.log(f + ': ' + spans.length + ' duplicated block(s)');
  for (const sp of spans) {
    const seg = src.slice(sp.from, sp.to);
    console.log('  - ' + sp.id + '  remove ' + (sp.to - sp.from) + ' chars | h4=' + (seg.match(/<h4[ >]/g) || []).length + ' | code=' + (seg.match(/<div class="codeWrap">/g) || []).length);
  }
  console.log('  h4 ' + h4(src) + ' -> ' + h4(out) + ' | code ' + code(src) + ' -> ' + code(out) + ' | dup ids ' + dups.length + ' -> ' + dupAfter + ' | bytes ' + src.length + ' -> ' + out.length);

  if (dupAfter !== 0) { console.error('refuse: duplicates remain'); process.exit(5); }
  if (h4(out) !== h4(src) - spans.length) { console.error('refuse: h4 count did not drop by ' + spans.length); process.exit(6); }
  if (out.length >= src.length) { console.error('refuse: file did not shrink'); process.exit(7); }

  if (!write) { console.log('  (dry run)'); continue; }
  const bak = path.join(ROOT, 'build', 'bak', 'dupblock');
  fs.mkdirSync(bak, { recursive: true });
  fs.writeFileSync(path.join(bak, f), src);
  fs.writeFileSync(abs, out);
  console.log('  wrote ' + f + ' (backup in build/bak/dupblock/)');
}
