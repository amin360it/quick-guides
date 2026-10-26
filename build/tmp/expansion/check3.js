const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');
let problems = 0;
const fail = (m) => { problems++; console.log('FAIL: ' + m); };

const sectionRe = /<section class="chapter">([\s\S]*?)\n  <\/section>/g;
const chapters = {};
let m;
while ((m = sectionRe.exec(html)) !== null) {
  const h2 = /<h2 id="([^"]+)"[^>]*>/.exec(m[1]);
  if (h2) chapters[h2[1]] = m[1];
}

let totalSections = 0, totalH4 = 0, totalCode = 0;
for (const ch of ['ch10', 'ch11', 'ch12']) {
  const inner = chapters[ch];
  if (!inner) { fail('missing ' + ch); continue; }
  const parts = inner.split(/<h3 id="([^"]+)"[^>]*>/);
  for (let i = 1; i < parts.length; i += 2) {
    totalSections++;
    const id = parts[i], body = parts[i + 1];
    const h4s = (body.match(/<h4 id="/g) || []).length;
    const code = (body.match(/<div class="codeWrap">/g) || []).length;
    totalH4 += h4s; totalCode += code;
    if (h4s < 2 || code < 2) fail(`${id}: h4=${h4s} code=${code}`);
  }
}
console.log(`scope: ${totalSections} h3 sections, ${totalH4} h4 added, ${totalCode} code samples`);

// id uniqueness across the whole page
const all = [...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
const dupe = {};
for (const id of all) dupe[id] = (dupe[id] || 0) + 1;
const dupes = Object.entries(dupe).filter(([, n]) => n > 1);
if (dupes.length) dupes.forEach(([id, n]) => fail(`duplicate id ${id} x${n}`));
else console.log('all ids unique:', all.length);

// h4 id format
const h4ids = [...html.matchAll(/<h4 id="([^"]+)"/g)].map((x) => x[1]);
const bad = h4ids.filter((id) => !/^(ch1[0-2])-[a-z0-9-]+$/.test(id));
if (bad.length) fail('h4 id format: ' + bad.join(', '));
console.log('h4 total:', h4ids.length);

// invariants untouched
for (const s of [
  '<h2 id="ch10" data-toc>10 · gRPC and Protobuf</h2>',
  '<h2 id="ch11" data-toc>11 · Choosing a Protocol, and Combining Them</h2>',
  '<h2 id="ch12" data-toc>12 · Performance and Latency Budgets</h2>',
  'Contents · gRPC and protobuf',
  'Contents · Choosing a protocol, and combining them',
  'Contents · Performance and latency budgets',
]) if (!html.includes(s)) fail('missing invariant: ' + s);

// heading ids for my chapters appear exactly once
for (const ch of ['ch10', 'ch11', 'ch12']) {
  const inner = chapters[ch];
  for (const id of [...inner.matchAll(/<h3 id="([^"]+)"/g)].map((x) => x[1])) {
    const n = (html.match(new RegExp('<h3 id="' + id + '"', 'g')) || []).length;
    if (n !== 1) fail(`h3 id ${id} appears ${n}`);
  }
}
console.log('\nproblems:', problems);
process.exit(problems ? 1 : 0);
