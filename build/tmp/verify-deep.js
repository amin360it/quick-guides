const fs = require('fs');
const s = fs.readFileSync('build/tmp/pkg-ch10-11.deep.html', 'utf8');

function count(re) { return (s.match(re) || []).length; }

console.log('sections:', count(/<section class="chapter">/g));
console.log('h3 total:', count(/<h3 /g));
console.log('h2 total:', count(/<h2 /g));
console.log('h4 total:', count(/<h4/g));
console.log('codeWrap total:', count(/<div class="codeWrap">/g));

// per-h3 analysis by splitting on h3 boundaries and chapter boundaries
const lines = s.split(/\r?\n/);
// ids uniqueness
const ids = [];
const idRe = /id="([^"]+)"/g; let m;
while ((m = idRe.exec(s))) ids.push(m[1]);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
console.log('ids total:', ids.length, 'duplicate ids:', JSON.stringify([...new Set(dup)]));

// prefixed?
const badPrefix = ids.filter(id => !(id === 'ch10' || id === 'ch11' || id.startsWith('ch10-') || id.startsWith('ch11-')));
console.log('ids without ch10-/ch11- prefix:', JSON.stringify(badPrefix));

// drift in cwd? check glyphs
console.log('has U+00B7 middot in h2:', /\u00B7/.test(s));
console.log('has U+2014 emdash:', /\u2014/.test(s));
console.log('has replacement char:', /\uFFFD/.test(s));
console.log('mojibake U+252C / U+2556:', /\u252C|\u2556/.test(s));

// escaping checks
console.log('contains &amp;lt;:', s.includes('&amp;lt;'));
console.log('contains &amp;amp;:', s.includes('&amp;amp;'));

// callout classes
const callouts = s.match(/<div class="(tip|warn|note|ex)">/g) || [];
const badCallouts = s.match(/<div class="(?!codeWrap|tip|warn|note|ex)[a-zA-Z-]+">/g) || [];
console.log('callouts:', callouts.length, JSON.stringify(callouts));
console.log('non-callout/non-codeWrap divs with class:', JSON.stringify([...new Set(badCallouts)]));

// h4 without id
const h4tags = s.match(/<h4[^>]*>/g) || [];
console.log('h4 without id:', h4tags.filter(t => !/id="/.test(t)).length);

// per-h3 counts
const h3Blocks = s.split(/(?=<h3 )/).slice(1);
let totalH4 = 0, totalCW = 0, minProse = Infinity, minProseId = '', problems = [];
for (const blk of h3Blocks) {
  const idm = blk.match(/<h3 id="([^"]+)"/);
  const id = idm ? idm[1] : '??';
  // stop at next chapter marker if any (h3 blocks already split)
  const h4 = (blk.match(/<h4/g) || []).length;
  const cw = (blk.match(/<div class="codeWrap">/g) || []).length;
  totalH4 += h4; totalCW += cw;
  // prose = text inside <p> tags, excluding code
  let prose = 0;
  const pRe = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g; let pm;
  while ((pm = pRe.exec(blk))) {
    prose += Buffer.byteLength(pm[1].replace(/<[^>]+>/g, ''), 'utf8');
  }
  if (prose < minProse) { minProse = prose; minProseId = id; }
  if (h4 < 2) problems.push(id + ' h4=' + h4);
  if (cw < 2) problems.push(id + ' codeWrap=' + cw);
  if (prose < 1500) problems.push(id + ' prose=' + prose);
  console.log(`  ${id} h4=${h4} codeWrap=${cw} prose=${prose}`);
}
console.log('TOTAL h4:', totalH4, '(need >=36)');
console.log('TOTAL codeWrap:', totalCW, '(need >=36)');
console.log('min prose:', minProse, 'at', minProseId, '(need >=1500 per h3)');
console.log('problems:', problems.length ? JSON.stringify(problems) : 'none');

// ch-toc and topic-desc preserved
console.log('ch-toc:', count(/class="ch-toc"/g), 'topic-desc:', count(/class="topic-desc"/g));
