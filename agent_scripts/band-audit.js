// Audit the visible band count string and the description count string against
// the page's real content, for every guide.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\.html$/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
const n = (s, re) => (s.match(re) || []).length;

let bad = 0;
let badDesc = 0;
const rows = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const sec = n(s, /<section class="chapter">/g);
  const h2 = n(s, /<h2[ >]/g);
  const h3 = n(s, /<h3[ >]/g);
  const code = n(s, /class="codeWrap"/g);
  const topics = h2 + h3;
  const band = (s.match(/<span class="am-band-s">([^<]*)<\/span>/) || [, ''])[1];
  const bm = band.match(/(\d+) chapters? &middot; (\d+) topics &middot; (\d+) code samples/);
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
  const dm = desc.match(/(\d+) chapters?, (\d+) topics and (\d+) code/);
  if (!band) { rows.push({ f, note: 'NO BAND' }); bad++; continue; }
  if (!bm) { rows.push({ f, note: 'BAND UNPARSED: ' + band.slice(0, 60) }); bad++; continue; }
  const ok = +bm[1] === sec && +bm[2] === topics && +bm[3] === code;
  let descOk = true;
  if (dm) descOk = +dm[1] === sec && +dm[2] === topics && +dm[3] === code;
  if (!ok) bad++;
  if (dm && !descOk) badDesc++;
  rows.push({ f, ok, sec, topics, code, bm, dm, descOk });
}
for (const r of rows) {
  if (r.note) { console.log('!', r.f.padEnd(34), r.note); continue; }
  const b = `${r.bm[1]}/${r.bm[2]}/${r.bm[3]}`;
  const a = `${r.sec}/${r.topics}/${r.code}`;
  const descFlag = r.dm ? (r.descOk ? 'desc:ok ' : 'desc:BAD') : 'desc:none';
  if (!r.ok || (r.dm && !r.descOk)) console.log('!', r.f.padEnd(34), 'band', b.padEnd(14), 'actual', a.padEnd(14), descFlag);
}
console.log(`\n${files.length} guides | band wrong: ${bad} | description count wrong: ${badDesc}`);
