// audit.js — check the fragment for escaping, structure and counts
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');

// ---- structural counts
const sections = (src.match(/<section class="chapter">/g) || []).length;
const closes = (src.match(/<\/section>/g) || []).length;
const h2 = [...src.matchAll(/<h2 id="([^"]+)" data-toc>/g)].map(m => m[1]);
const h3 = [...src.matchAll(/<h3 id="([^"]+)" data-toc>/g)].map(m => m[1]);
const h4 = (src.match(/<h4>/g) || []).length;
const codeWrap = (src.match(/<div class="codeWrap">/g) || []).length;

console.log('sections', sections, 'closes', closes);
console.log('h2', h2.length, 'h3', h3.length, 'h4', h4, 'codeWrap', codeWrap);

// unique ids
const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
console.log('ids', ids.length, 'duplicate ids:', [...new Set(dup)]);
const badId = ids.filter(id => !/^[a-z0-9-]+$/.test(id));
console.log('non URL-safe ids:', badId);

// h2 id must match chN-
const badH2 = h2.filter(id => !/^ch\d+-[a-z0-9-]+$/.test(id));
console.log('bad h2 ids:', badH2);

// chapter numbering: h2 text
const h2text = [...src.matchAll(/<h2 id="[^"]+" data-toc>([^<]+)<\/h2>/g)].map(m => m[1]);
console.log('h2 titles:', h2text.join(' | '));

// h3 numbering check
const h3text = [...src.matchAll(/<h3 id="[^"]+" data-toc>(\d+)\.(\d+)\s/g)];
const badH3 = h3text.filter(m => {
  const ch = Number(m[1]); const sub = Number(m[2]);
  return !(sub >= 1 && sub <= 5);
});
console.log('h3 numbered', h3text.length, 'out of range', badH3.length);

// every h3 has at least one h4 before the next h3/h2
const chunks = src.split(/<h3 id=/).slice(1);
let noH4 = [];
chunks.forEach((c, i) => {
  if (!/<h4>/.test(c.split(/<h3 id=/)[0])) noH4.push(h3[i]);
});
console.log('h3 without h4:', noH4);

// ---- code block escaping
const codeBlocks = [...src.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)];
console.log('parsed code blocks:', codeBlocks.length);
let issues = [];
codeBlocks.forEach((m, i) => {
  const body = m[1];
  // bare < that is not a valid entity-escape and not a real tag
  const lt = body.match(/</g) || [];
  const ltEsc = body.match(/&lt;/g) || [];
  // a literal < is only legal if followed by a tag-ish char we wrote intentionally?
  // we never intentionally write tags inside code, so ANY < is suspicious
  const strayLt = [...body.matchAll(/</g)];
  if (strayLt.length || lt.length) {
    // report context
    strayLt.slice(0, 5).forEach(s => {
      const at = s.index;
      issues.push({ block: i, kind: '<', ctx: body.slice(Math.max(0, at - 40), at + 40).replace(/\n/g, '\\n') });
    });
  }
  // bare & not part of an entity
  const amps = [...body.matchAll(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g)];
  amps.slice(0, 5).forEach(a => {
    issues.push({ block: i, kind: '&', ctx: body.slice(Math.max(0, a.index - 40), a.index + 40).replace(/\n/g, '\\n') });
  });
  if (/&amp;lt;/.test(body)) issues.push({ block: i, kind: 'double-escape', ctx: '&amp;lt;' });
});

console.log('--- escaping issues:', issues.length);
issues.forEach(i => console.log(`block ${i.block} [${i.kind}] ...${i.ctx}...`));

// ---- callout classes
const callouts = [...src.matchAll(/<div class="(tip|warn|note|ex)">/g)].map(m => m[1]);
console.log('callouts', callouts.length, [...new Set(callouts)]);

// unknown div classes
const classes = [...new Set([...src.matchAll(/<div class="([^"]+)"/g)].map(m => m[1]))];
console.log('div classes:', classes.join(', '));

// prose per h3 (rough): strip code + tags
const proseSections = src.split(/<h3 id=/).slice(1).map(c => {
  const body = c.split(/<h3 id=/)[0];
  const stripped = body
    .replace(/<div class="codeWrap">[\s\S]*?<\/code><\/pre><\/div>/g, '')
    .replace(/<table>[\s\S]*?<\/table>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  return stripped.length;
});
const short = proseSections.map((n, i) => ({ id: h3[i], n })).filter(x => x.n < 1500);
console.log('h3 under 1500 prose bytes:', short.length);
short.forEach(s => console.log('  ', s.id, s.n));
