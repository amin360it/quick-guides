/* ------------------------------------------------------------------
   fixmoji.js - repair double-mojibake (UTF-8 read as CP1252) in HTML.

   The library was at some point re-encoded twice: a real UTF-8 sequence
   such as the em dash (E2 80 94) was read as CP1252, producing "â€”",
   and that string was then written as UTF-8 and read as CP1252 again,
   producing "Ã¢â‚¬â€". The reverse is therefore two CP1252 -> byte ->
   UTF-8 decodes.

   Only runs of non-ASCII characters are touched, and a run is left
   exactly as found unless the decode produces valid UTF-8 with no
   U+FFFD replacement character. That keeps a legitimate non-ASCII
   character (which is not valid UTF-8 when its own byte is decoded
   alone) from being damaged.

   Usage:  node fixmoji.js            (dry run, report only)
           node fixmoji.js --write    (rewrite in place)
   ------------------------------------------------------------------ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WRITE = process.argv.includes('--write');

/* CP1252 code point -> byte, for the 0x80-0x9F range it fills in. */
const CP = {
  0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,
  0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,
  0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,
  0x0153:0x9C,0x017E:0x9E,0x0178:0x9F
};

function cp1252Bytes(str) {
  const out = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp <= 0xFF) out.push(cp);
    else if (CP[cp] !== undefined) out.push(CP[cp]);
    else return null;
  }
  return Buffer.from(out);
}

/* Decode one run up to a few passes, stopping as soon as a pass is not a
   clean improvement. Returns the best string found. */
function fixRun(run) {
  let cur = run;
  for (let i = 0; i < 4; i++) {
    const b = cp1252Bytes(cur);
    if (!b) break;
    const d = b.toString('utf8');
    if (d.includes('\uFFFD')) break;   // not clean mojibake at this pass
    if (d === cur) break;              // stable
    cur = d;
  }
  return cur;
}

function fixText(text) {
  let changed = 0;
  const out = text.replace(/[^\x00-\x7F]+/g, (run) => {
    const fixed = fixRun(run);
    if (fixed !== run) changed++;
    return fixed;
  });
  return { out, changed };
}

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'build' || name === '.git' || name === 'node_modules') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(html|css|js|json|txt|xml|md)$/.test(name)) acc.push(p);
  }
  return acc;
}

const files = walk(ROOT, []).sort();
let totalChanged = 0, filesChanged = 0;
const report = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const { out, changed } = fixText(src);
  if (changed > 0 && out !== src) {
    filesChanged++;
    totalChanged += changed;
    report.push(`  ${path.relative(ROOT, file)}  runs=${changed}`);
    if (WRITE) fs.writeFileSync(file, out, 'utf8');
  }
}

console.log(`Scanned ${files.length} HTML files`);
console.log(`Files with mojibake: ${filesChanged}   runs fixed: ${totalChanged}`);
if (report.length) console.log(report.slice(0, 100).join('\n'));
if (!WRITE) console.log('\n(dry run - re-run with --write to apply)');
else console.log('\nWritten.');
