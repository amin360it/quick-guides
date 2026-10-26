// Scratch verifier for api-design.html ch10-ch12 deepening.
// Scoped, read-only: reports structure per h3, id collisions, code-block
// escaping (raw <, bare &, double-escape, duplicated first-200-chars).
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', '..', 'api-design.html');
const html = fs.readFileSync(file, 'utf8');

let problems = 0;
const fail = (msg) => { problems++; console.log('FAIL: ' + msg); };

// --- 1. Split into chapters ---
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const chapters = {};
let m;
while ((m = sectionRe.exec(html)) !== null) {
  const inner = m[1];
  const h2 = /<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/.exec(inner);
  if (!h2) continue;
  const id = h2[1];
  chapters[id] = inner;
}
console.log('Chapters found:', Object.keys(chapters).join(', '));

// --- 2. Per h3 in scope ---
const scopeH3 = [];
for (const ch of ['ch10', 'ch11', 'ch12']) {
  const inner = chapters[ch];
  if (!inner) { fail('missing chapter ' + ch); continue; }
  const parts = inner.split(/<h3 id="([^"]+)"[^>]*>/);
  // parts[0] = preamble, then [id, body, id, body, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const id = parts[i];
    const body = parts[i + 1];
    const h4s = (body.match(/<h4 id="/g) || []).length;
    const codeWraps = (body.match(/<div class="codeWrap">/g) || []).length;
    const h4Ids = [...body.matchAll(/<h4 id="([^"]+)"/g)].map((x) => x[1]);
    scopeH3.push({ id, h4s, codeWraps, h4Ids });
  }
}
console.log('\nSections in scope:', scopeH3.length);
for (const s of scopeH3) {
  const ok4 = s.h4s >= 2;
  const okc = s.codeWraps >= 2;
  if (!ok4 || !okc) {
    fail(`${s.id}: h4s=${s.h4s} (need>=2), codeWraps=${s.codeWraps} (need>=2)`);
  } else {
    console.log(`ok  ${s.id}: h4=${s.h4s} code=${s.codeWraps}`);
  }
}

// --- 3. h4 id uniqueness page-wide ---
const allH4 = [...html.matchAll(/<h4 id="([^"]+)"/g)].map((x) => x[1]);
const seen = new Map();
for (const id of allH4) seen.set(id, (seen.get(id) || 0) + 1);
for (const [id, n] of seen) if (n > 1) fail(`duplicate h4 id: ${id} x${n}`);
const allIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((x) => x[1]));
for (const id of allH4) if (!allIds.has(id)) fail(`h4 id missing from id set: ${id}`);
// cross-scope collision: my ids vs any other headings in the page
const scopeIds = new Set(scopeH3.flatMap((s) => s.h4Ids));
const otherIds = new Set(allH4.filter((x) => !scopeIds.has(x)));
for (const id of scopeIds) if (otherIds.has(id)) fail(`h4 collides with another h4: ${id}`);
console.log(`\nh4 count: ${allH4.length}, unique: ${new Set(allH4).size}`);

// --- 4. Code block escaping ---
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let blocks = 0;
while ((m = codeRe.exec(html)) !== null) {
  blocks++;
  const code = m[1];
  // raw < not part of an entity
  const rawLt = code.match(/</);
  if (rawLt) fail(`code block has raw < := ` + JSON.stringify(code.slice(0, 60)));
  // bare & not part of an allowed entity
  const bareAmp = code.match(/&(?!(amp|lt|gt|quot|#\d+|nbsp);)/);
  if (bareAmp) fail(`code block has bare & := ` + JSON.stringify(code.slice(bareAmp.index - 10, bareAmp.index + 15)));
  // double-escape
  if (/&amp;lt;|&amp;amp;/.test(code)) fail('code block double-escaped: ' + code.slice(0, 60));
  // duplicate first 200 chars
  const first = code.slice(0, 200);
  if (first.length > 80 && code.indexOf(first, 80) !== -1) fail('code block repeats its own opening');
}
console.log(`\ncode blocks: ${blocks}`);

// --- 5. Malformed leftover: stray <pre><code> opener without wrapper ---
const stray = html.match(/<<pre><code>/);
if (stray) fail('stray `<<pre><code>` opener found: ' + stray.index);

// --- 6. Tag balance for the three chapters (naive counters) ---
for (const ch of ['ch10', 'ch11', 'ch12']) {
  const inner = chapters[ch];
  const count = (re) => (inner.match(re) || []).length;
  const divOpen = count(/<div\b/g), divClose = count(/<\/div>/g);
  const preOpen = count(/<pre>/g), preClose = count(/<\/pre>/g);
  const codeOpen = count(/<code>/g), codeClose = count(/<\/code>/g);
  const secOpen = count(/<section/g), secClose = count(/<\/section>/g);
  const h2 = count(/<h2\b/g), h3 = count(/<h3\b/g), h4 = count(/<h4\b/g), p = count(/<p\b/g), pClose = count(/<\/p>/g);
  if (divOpen !== divClose) fail(`${ch}: div ${divOpen}/${divClose}`);
  if (preOpen !== preClose) fail(`${ch}: pre ${preOpen}/${preClose}`);
  if (codeOpen !== codeClose) fail(`${ch}: code ${codeOpen}/${codeClose}`);
  if (secOpen !== 1 || secClose !== 1) fail(`${ch}: section ${secOpen}/${secClose}`);
  console.log(`${ch}: h2=${h2} h3=${h3} h4=${h4} p=${p}/${pClose} div=${divOpen}/${divClose} pre=${preOpen}/${preClose} code=${codeOpen}/${codeClose}`);
}

// --- 7. Byte-identical guards: headings, ch-toc, topic-desc, band ---
const mustContain = [
  '<h2 id="ch10" data-toc>10 · gRPC and Protobuf</h2>',
  '<h2 id="ch11" data-toc>11 · Choosing a Protocol, and Combining Them</h2>',
  '<h2 id="ch12" data-toc>12 · Performance and Latency Budgets</h2>',
  '<h3 id="ch10-when" data-toc>When gRPC is the right answer</h3>',
  '<h3 id="ch12-tail" data-toc>The tail, and why it dominates</h3>',
  'Contents · gRPC and protobuf',
  'Contents · Choosing a protocol, and combining them',
  'Contents · Performance and latency budgets',
  'Topics · ',
];
for (const s of mustContain) {
  if (!html.includes(s)) fail('missing expected invariant string: ' + s);
}
if (!html.includes('class="am-band"')) fail('no band');

console.log('\nTotal problems: ' + problems);
process.exit(problems ? 1 : 0);