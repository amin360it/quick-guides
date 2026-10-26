'use strict';
/*
 fix-dupheadings.js — remove duplicate <h4 id="..."> blocks.

 Some guides carry the same h4 (id and body) emitted twice on consecutive (or
 near-consecutive) lines. This keeps the longest copy of each id and drops the
 rest. Refuses to write unless duplicate ids fall and the h4 count drops by
 exactly the number of lines removed.

   node fix-dupheadings.js <file.html> [--write]
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');
if (!positional.length) { console.log('usage: node fix-dupheadings.js <file.html> [--write]'); process.exit(1); }

for (const f of positional) {
  const abs = path.join(ROOT, f);
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split('\n');

  const byId = new Map();
  lines.forEach((l, i) => {
    const m = l.match(/<h4\s+id="([^"]+)"/);
    if (m) {
      if (!byId.has(m[1])) byId.set(m[1], []);
      byId.get(m[1]).push(i);
    }
  });

  const remove = new Set();
  for (const [id, idxs] of byId) {
    if (idxs.length < 2) continue;
    let keep = idxs[0];
    for (const i of idxs) if (lines[i].length > lines[keep].length) keep = i;
    for (const i of idxs) if (i !== keep) remove.add(i);
  }
  if (!remove.size) { console.log(f + ': no duplicate h4 ids'); continue; }

  const out = lines.filter((_, i) => !remove.has(i)).join('\n');
  const h4a = (src.match(/<h4[ >]/g) || []).length;
  const h4b = (out.match(/<h4[ >]/g) || []).length;

  const dupId = (t) => {
    const ids = [...t.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const seen = new Map();
    for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
    return [...seen.entries()].filter(([, n]) => n > 1).length;
  };
  console.log(f + ': remove ' + remove.size + ' duplicate h4 line(s) | h4 ' + h4a + ' -> ' + h4b + ' | dup ids ' + dupId(src) + ' -> ' + dupId(out) + ' | bytes ' + src.length + ' -> ' + out.length);
  if (h4b !== h4a - remove.size) { console.error('refuse: h4 count did not drop as expected'); process.exit(2); }
  if (dupId(out) >= dupId(src)) { console.error('refuse: duplicates did not fall'); process.exit(3); }
  if (out.length >= src.length) { console.error('refuse: file did not shrink'); process.exit(4); }
  if (!write) continue;
  const bak = path.join(ROOT, 'build', 'bak', 'duph4');
  fs.mkdirSync(bak, { recursive: true });
  fs.writeFileSync(path.join(bak, f), src);
  fs.writeFileSync(abs, out);
  console.log('  wrote ' + f + ' (backup in build/bak/duph4/)');
}
