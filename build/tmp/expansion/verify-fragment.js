const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'rust-programming.txt');
const html = fs.readFileSync(file, 'utf8');

const problems = [];
const counts = { h2: 0, h3: 0, h4: 0, code: 0, tip: 0, warn: 0, note: 0 };

counts.h2 = (html.match(/<h2 id="ch\d+" data-toc>/g) || []).length;
counts.h3 = (html.match(/<h3 id="ch\d+-\d+" data-toc>/g) || []).length;
counts.h4 = (html.match(/<h4 /g) || []).length;
counts.code = (html.match(/<div class="codeWrap"><pre><code>/g) || []).length;
counts.tip = (html.match(/<div class="tip">/g) || []).length;
counts.warn = (html.match(/<div class="warn">/g) || []).length;
counts.note = (html.match(/<div class="note">/g) || []).length;

// --- ids ---
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
if (dupIds.length) problems.push('DUPLICATE ids: ' + dupIds.join(', '));

const h2s = [...html.matchAll(/<h2 id="(ch\d+)" data-toc>([^<]*)<\/h2>/g)].map(m => ({ id: m[1], title: m[2] }));
const h2ids = h2s.map(h => h.id);
if (h2ids.join(',') !== 'ch1,ch2,ch3,ch4,ch5,ch6,ch7') problems.push('h2 ids wrong: ' + h2ids.join(','));
if (!h2s.every(h => new RegExp('^' + h.id.slice(2) + ' \u25B8 ').test(h.title)))
  problems.push('h2 title formatting (N ▸ ...) not followed: ' + h2s.map(h => JSON.stringify(h.title)).join(' '));

const h3s = [...html.matchAll(/<h3 id="(ch\d+-\d+)" data-toc>([^<]*)<\/h3>/g)].map(m => ({ id: m[1], title: m[2] }));
const numOf = id => id.replace(/^ch/, '').replace('-', '.');
if (!h3s.every(h => h.title.startsWith(numOf(h.id) + ' ')))
  problems.push('h3 title numbering mismatch: ' + h3s.filter(h => !h.title.startsWith(numOf(h.id) + ' ')).map(h => JSON.stringify(h.title)).join(' '));

const byCh = {};
for (const h of h3s) { const ch = h.id.split('-')[0]; byCh[ch] = (byCh[ch] || 0) + 1; }
for (const [ch, n] of Object.entries(byCh)) {
  if (n < 3 || n > 5) problems.push(`chapter ${ch} has ${n} h3 (want 3-5)`);
}

const h4ids = [...html.matchAll(/<h4 id="([^"]+)">/g)].map(m => m[1]);
const badH4 = h4ids.filter(id => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id));
if (badH4.length) problems.push('h4 ids not kebab-case: ' + badH4.join(', '));

// ch-toc placeholder directly after each chapter h2
const chTocOk = html.split('<section class="chapter">').slice(1).every(sec => /^\s*<h2 id="ch\d+" data-toc>[^<]*<\/h2>\s*<div class="ch-toc"><\/div><\/div>/.test(sec));
if (!chTocOk) problems.push('ch-toc placeholder missing/malformed after an h2');

// per-h3: split bodies robustly with distinct markers
const h3Positions = [...html.matchAll(/<h3 id="(ch\d+-\d+)" data-toc>/g)].map(m => ({ id: m[1], start: m.index }));
const sectionStarts = [...html.matchAll(/<section class="chapter">/g)].map(m => m.index);
h3Positions.forEach((h, i) => {
  const end = h3Positions[i + 1] ? h3Positions[i + 1].start : html.length;
  const body = html.slice(h.start, end);
  const n = (body.match(/<h4 /g) || []).length;
  if (n < 2 || n > 4) problems.push(`${h.id}: ${n} h4 (want 2-4)`);
  if (!/<div class="codeWrap">/.test(body)) problems.push(`${h.id}: no code block`);
});

// per-chapter code totals >= 4 and h4 3-5 h3
const chapterStarts = [...html.matchAll(/<h2 id="(ch\d+)" data-toc>/g)].map(m => ({ id: m[1], start: m.index }));
chapterStarts.forEach((ch, i) => {
  const end = chapterStarts[i + 1] ? chapterStarts[i + 1].start : html.length;
  const body = html.slice(ch.start, end);
  const c = (body.match(/<div class="codeWrap">/g) || []).length;
  if (c < 4) problems.push(`chapter ${ch.id} has ${c} code blocks (want >= 4)`);
});

// --- code block invariants ---
const blocks = [...html.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)].map(m => m[1]);
if (blocks.length !== counts.code) problems.push('code block parse mismatch');
blocks.forEach((b, i) => {
  // Only escaped angle brackets may appear: the raw check below is
  // authoritative. (Unescaping &lt; would re-introduce a legal "<".)
  const rawLt = b.match(/</);
  if (rawLt) problems.push(`code #${i + 1}: raw "<" present`);
  const badAmp = b.match(/&(?!amp;|lt;|gt;|quot;|#123;|nbsp;)/);
  if (badAmp) problems.push(`code #${i + 1}: bare "&" (${JSON.stringify(badAmp[0])})`);
  if (/&amp;amp;/.test(b)) problems.push(`code #${i + 1}: &amp;amp;`);
  if (/&amp;lt;/.test(b)) problems.push(`code #${i + 1}: &amp;lt;`);
  if (/&amp;gt;/.test(b)) problems.push(`code #${i + 1}: &amp;gt;`);
  const head = b.slice(0, 200).trim();
  if (head.length > 20 && b.slice(200).includes(head)) problems.push(`code #${i + 1}: repeats its own opening`);
});

// bare & anywhere in the doc (prose must use &amp; etc.)
const proseAmp = html.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;|middot;|hellip;|rsquo;|ldquo;|rdquo;)/);
if (proseAmp) problems.push('bare & outside allowed entities: ' + JSON.stringify(proseAmp[0]));

// headings must not contain literal < >
h2s.concat(h3s).forEach(h => {
  if (/[<>]/.test(h.title)) problems.push('heading contains literal angle bracket: ' + JSON.stringify(h.title));
});

console.log(JSON.stringify(counts, null, 2));
console.log('h2: ' + h2ids.join(','));
console.log('h3 per chapter: ' + JSON.stringify(byCh));
if (problems.length) {
  console.log('\nPROBLEMS:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
} else {
  console.log('\nALL CHECKS PASSED');
}