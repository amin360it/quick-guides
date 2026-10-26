// Recompute the visible band count string, and the count sentence embedded in the
// meta description, from each guide's real content. Dry-run unless --write.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BAK = path.join(ROOT, 'build', 'bak', 'counts');
const WRITE = process.argv.includes('--write');
const EXCLUDE = /^(index|topics|search|favorites|test)\.html$/;
const DOT = '(?:&middot;|·|&#183;)';

const n = (s, re) => (s.match(re) || []).length;
const plural = (v, one, many) => `${v} ${v === 1 ? one : many}`;

if (!WRITE) console.log('DRY RUN (pass --write to apply)\n');
if (WRITE) fs.mkdirSync(BAK, { recursive: true });

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
const bandRe = new RegExp(`(\\d+) chapters? ${DOT} (\\d+) topics ${DOT} (\\d+) code samples`);
const descRe = /(\d+) chapters?, (\d+) topics and (\d+) code/;

let bandFixed = 0;
let descFixed = 0;
const outOfRange = [];
for (const f of files) {
  let s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const orig = s;
  const sec = n(s, /<section class="chapter">/g);
  const h2 = n(s, /<h2[ >]/g);
  const h3 = n(s, /<h3[ >]/g);
  const code = n(s, /class="codeWrap"/g);

  const bandNew = `${plural(sec, 'chapter', 'chapters')} &middot; ${plural(h2 + h3, 'topic', 'topics')} &middot; ${plural(code, 'code sample', 'code samples')}`;
  let bandChanged = false;
  s = s.replace(bandRe, (whole, c, t, k) => {
    const want = `${+c === sec ? c : sec} chapter${sec === 1 ? '' : 's'} &middot; ${+t === h2 + h3 ? t : h2 + h3} topics &middot; ${+k === code ? k : code} code sample${code === 1 ? '' : 's'}`;
    if (want !== whole) bandChanged = true;
    return want;
  });
  if (bandChanged) bandFixed++;

  let descChanged = false;
  s = s.replace(descRe, (whole, c, t, k) => {
    const want = `${sec} chapter${sec === 1 ? '' : 's'}, ${h2 + h3} topics and ${code} code`;
    if (want !== whole) descChanged = true;
    return want;
  });
  if (descChanged) descFixed++;

  const dlen = (s.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1].length;
  if (dlen && (dlen < 148 || dlen > 156)) outOfRange.push(`${f} (${dlen})`);

  if (s !== orig) {
    console.log(`${bandChanged ? 'band' : '    '} ${descChanged ? 'desc' : '    '}  ${f.padEnd(32)} ${sec}/${h2 + h3}/${code}`);
    if (WRITE) {
      fs.copyFileSync(path.join(ROOT, f), path.join(BAK, f));
      fs.writeFileSync(path.join(ROOT, f), s, 'utf8');
    }
  }
}
console.log(`\nband fixed: ${bandFixed} | description count fixed: ${descFixed}`);
if (outOfRange.length) console.log(`description length out of 148-156: ${outOfRange.length}\n  ${outOfRange.join('\n  ')}`);
