// Repair mis-closed headings introduced by earlier automated h4 insertions.
//
//   P1  <h3 id data-toc><h4>Key details</h4>TITLE</h3>
//       -> <h3 id data-toc>TITLE</h3>\n<h4>Key details</h4>
//   P2  <h3 id data-toc>TITLE</h4>\n<h4 id data-toc>SUB</h4>
//       -> <h3 id data-toc>TITLE</h3>\n<h4 id>SUB</h4>          (data-toc removed from the h4)
//   P3  <h4 id>TITLE</h3|/h2|/h5>
//       -> <h4 id>TITLE</h4>
//
// Guarantees, because a repair tool that is wrong is worse than the fault:
//   * a full snapshot is taken before any write
//   * heading and section COUNTS must not change
//   * the observed byte delta must equal the delta the edits imply
//   * a re-scan must find zero mismatched heading closes, or the file is left alone
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BAK = path.join(ROOT, 'build', 'bak', 'headings');
const WRITE = process.argv.includes('--write');
const EXCLUDE = /^(index|topics|search|favorites|test|docker-compose)\.html$/; // docker-compose is rebuilt from a fragment

const NOT_HEADING = '(?:(?!</?h\\d)[\\s\\S])*?';
const P1 = new RegExp(`<h3\\b([^>]*?data-toc[^>]*)><h4>(${NOT_HEADING})<\\/h4>(${NOT_HEADING})<\\/h3>`, 'g');
const P2 = new RegExp(`<h3\\b([^>]*?data-toc[^>]*)>(${NOT_HEADING})<\\/h4>\\s*<h4\\b([^>]*)>(${NOT_HEADING})<\\/h4>`, 'g');
const P3 = new RegExp(`<h4\\b([^>]*)>(${NOT_HEADING})<\\/h([1-6])>`, 'g');
const P4 = new RegExp(`<h4\\b([^>]*)>(${NOT_HEADING})<\\/p>`, 'g');

const count = (s, re) => (s.match(re) || []).length;
const stripToc = (attrs) => attrs.replace(/\s*data-toc\b/, '').replace(/\s+>/, '>');

// Apply one pattern with a function replacer; report how many edits and how many bytes they imply.
function applyOne(s, re, build) {
  const out = s.replace(re, (...a) => {
    const whole = a[0];
    const repl = build(...a);
    if (repl === null) return whole;
    edits.push({ from: whole, to: repl });
    return repl;
  });
  return out;
}
let edits = [];
let pat = { P1: 0, P2: 0, P3: 0, P4: 0 };
function applyTagged(s, re, build, key) {
  const out = s.replace(re, (...a) => {
    const whole = a[0];
    const repl = build(...a);
    if (repl === null) return whole;
    pat[key]++;
    edits.push({ from: whole, to: repl });
    return repl;
  });
  return out;
}

function mismatches(s) {
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h([1-6])>/g;
  let m;
  const bad = [];
  while ((m = re.exec(s)) !== null) if (m[1] !== m[3]) bad.push(m[0].slice(0, 80));
  return bad;
}

if (!WRITE) console.log('DRY RUN (pass --write to apply)\n');
if (WRITE) fs.mkdirSync(BAK, { recursive: true });

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
let grand = 0;
for (const f of files) {
  const p = path.join(ROOT, f);
  const s = fs.readFileSync(p, 'utf8');
  const before = {
    h2: count(s, /<h2[ >]/g), h3: count(s, /<h3[ >]/g), h4: count(s, /<h4[ >]/g),
    sec: count(s, /<section class="chapter">/g), bad: mismatches(s).length,
  };
  if (!before.bad) continue;

  edits = [];
  pat = { P1: 0, P2: 0, P3: 0, P4: 0 };
  let out = applyTagged(s, P1, (w, at, sub, title) => `<h3${at}>${title}</h3>\n<h4>${sub}</h4>`, 'P1');
  out = applyTagged(out, P2, (w, at, title, h4at, sub) => `<h3${at}>${title}</h3>\n<h4${stripToc(h4at)}>${sub}</h4>`, 'P2');
  out = applyTagged(out, P3, (w, at, title, close) => (close === '4' ? null : `<h4${at}>${title}</h4>`), 'P3');
  out = applyTagged(out, P4, (w, at, title) => `<h4${at}>${title}</h4>`, 'P4');

  const n = edits.length;
  const expected = edits.reduce((a, e) => a + e.to.length - e.from.length, 0);
  const actual = out.length - s.length;
  const after = {
    h2: count(out, /<h2[ >]/g), h3: count(out, /<h3[ >]/g), h4: count(out, /<h4[ >]/g),
    sec: count(out, /<section class="chapter">/g), bad: mismatches(out).length,
  };

  const fails = [];
  if (actual !== expected) fails.push(`byte delta ${actual} != expected ${expected}`);
  if (after.h2 !== before.h2) fails.push(`h2 ${before.h2}->${after.h2}`);
  if (after.h3 !== before.h3) fails.push(`h3 ${before.h3}->${after.h3}`);
  if (after.h4 !== before.h4) fails.push(`h4 ${before.h4}->${after.h4}`);
  if (after.sec !== before.sec) fails.push(`sections ${before.sec}->${after.sec}`);
  if (after.bad !== 0) fails.push(`${after.bad} mismatched closes remain`);

  const tag = fails.length ? 'REFUSE' : 'ok';
  console.log(`${tag.padEnd(6)} ${f.padEnd(24)} edits=${String(n).padStart(3)} (P1=${pat.P1} P2=${pat.P2} P3=${pat.P3} P4=${pat.P4}) bad ${before.bad}->${after.bad} delta=${actual}`);
  for (const x of fails) console.log(`        ! ${x}`);

  if (!fails.length) {
    grand += n;
    if (WRITE) {
      fs.copyFileSync(p, path.join(BAK, f));
      fs.writeFileSync(p, out, 'utf8');
    }
  }
}
console.log(`\n${grand} edits ${WRITE ? 'written' : 'pending'}`);
