// Check one finished guide: structure, TOC parity, ids, escaping, band.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2];
if (!file) { console.log('usage: node check-guide.js <file.html>'); process.exit(1); }
const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
const problems = [];
const main = s.slice(s.indexOf('<main id="content">'), s.lastIndexOf('</main>'));
if (s.indexOf('<main id="content">') < 0) problems.push('NO <main id="content">');
if (s.lastIndexOf('</main>') < 0) problems.push('NO </main>');

const ct = (re, t = s) => (t.match(re) || []).length;
const h1 = ct(/<h1[ >]/g);
const h2all = ct(/<h2[ >]/g);
// The attribute must END at whitespace or `>`. `/data-toc/` matched the prefix
// of `data-toc"`, which a browser reads as an attribute literally named
// `data-toc"` — so hasAttribute('data-toc') is false and any runtime
// [data-toc] query misses the heading. Three such headings shipped in
// idea-to-deploy.html and every check here reported them as present.
const h2toc = ct(/<h2 [^>]*\sdata-toc(?=[\s>])/g);
const h3all = ct(/<h3[ >]/g);
const h3toc = ct(/<h3 [^>]*\sdata-toc(?=[\s>])/g);
const h4 = ct(/<h4[ >]/g);
const sec = ct(/<section class="chapter">/g);
const secClose = ct(/<\/section>/g);
const chToc = ct(/<div class="ch-toc">/g);
const navCount = ct(/<nav id="toc"/g);
// Count real code blocks, not the literal string. A guide that shows the
// library's own anatomy as a sample contains an escaped <div class="codeWrap">
// inside a code block; matching /class="codeWrap"/ counted that too and
// reported a phantom extra block (package-publishing: band 356, counted 357).
// The opener must also be immediately followed by <pre><code>, which is what
// catches a malformed opener such as a duplicated '<'.
const code = ct(/<div class="codeWrap"><pre><code>/g);

if (h1 !== 1) problems.push(`h1 count = ${h1} (want 1)`);
if (h2all !== sec) problems.push(`h2(${h2all}) != sections(${sec})`);
if (sec !== secClose) problems.push(`section open ${sec} != close ${secClose}`);
if (h2all !== h2toc) problems.push(`${h2all - h2toc} <h2> missing data-toc`);
if (h3all !== h3toc) problems.push(`${h3all - h3toc} <h3> missing data-toc`);
if (chToc !== sec) problems.push(`ch-toc ${chToc} != sections ${sec}`);
if (navCount !== 1) problems.push(`nav#toc count = ${navCount}`);

// malformed: h3 closed by </h4> etc.
const malformed = (s.match(/<h([2-6])[^>]*>(?:(?!<\/h[2-6]>)[\s\S])*?<\/h([2-6])>/g) || []).filter((m) => {
  const a = m.match(/^<h([2-6])/)[1];
  const b = m.match(/<\/h([2-6])>$/)[1];
  return a !== b;
});
if (malformed.length) problems.push(`${malformed.length} headings closed by the wrong tag`);

// duplicate ids (real elements only: id="..." not inside a code sample is hard; approximate)
const ids = [...s.matchAll(/<([a-z0-9]+)[^>]*\sid="([^"]+)"/g)].map((m) => m[2]);
const seen = new Map();
for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
const dups = [...seen.entries()].filter(([, n]) => n > 1);
if (dups.length) problems.push(`duplicate element ids: ${dups.map(([i, n]) => i + '(' + n + ')').join(', ')}`);

// Double escaping. A sample that DEMONSTRATES escaped output has to write its
// entities doubly, so a bare count cannot tell a real defect from the lesson.
// Only flag one that is in running prose and not inside a <code> span: that is
// the case where the reader sees literal "&amp;" on the page for no reason.
// (AGENTS.md, "Never double-escape entities".)
const dblRe = /&amp;(amp|lt|gt|quot|middot|nbsp|mdash);/g;
let dblBad = 0, dblOk = 0;
for (const m of s.matchAll(dblRe)) {
  // enclosing element: is it a <code>...</code> span?
  const before = s.lastIndexOf('<code>', m.index);
  const beforeClose = s.lastIndexOf('</code>', m.index);
  const inCodeSpan = before > beforeClose;
  // enclosing code sample
  const lastOpen = s.lastIndexOf('<div class="codeWrap"><pre><code>', m.index);
  const lastClose = s.lastIndexOf('</code></pre></div>', m.index);
  const inSample = lastOpen > lastClose;
  if (inCodeSpan || inSample) dblOk++;
  else dblBad++;
}
if (dblBad) problems.push(`${dblBad} double-escaped entities in prose (outside <code> and code samples)`);
const dbl = dblBad + dblOk;

// sidebar parity: count nav entries
const nav = s.slice(s.indexOf('<nav id="toc"'), s.indexOf('</nav>', s.indexOf('<nav id="toc"')));
const navTop = ct(/class="chapter open"/g, nav);
const navLinks = ct(/<a href="#[^"]+" data-target=/g, nav);
if (navTop !== h2all) problems.push(`sidebar chapters ${navTop} != h2 ${h2all}`);

// band
const band = (s.match(/<span class="am-band-s">([^<]*)<\/span>/) || [, ''])[1];
const bandNums = band.match(/(\d+) chapters &middot; (\d+) topics &middot; (\d+) code samples/);
if (!bandNums) problems.push('band count string missing/wrong format');
else if (+bandNums[1] !== sec) problems.push(`band chapters ${bandNums[1]} != ${sec}`);
else if (+bandNums[2] !== h2all + h3all) problems.push(`band topics ${bandNums[2]} != h2+h3 ${h2all + h3all}`);
else if (+bandNums[3] !== code) problems.push(`band code ${bandNums[3]} != ${code}`);

// title/description
const title = (s.match(/<title>([^<]*)<\/title>/) || [, ''])[1];
const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
if (!title) problems.push('no <title>');
if (desc.length < 140 || desc.length > 160) problems.push(`description length ${desc.length}`);

console.log(file);
console.log(`  h1=${h1} sections=${sec} h2=${h2all} h3=${h3all} h4=${h4} code=${code} bytes=${Buffer.byteLength(s)}`);
if (dbl) console.log(`  double-escaped: ${dbl} (${dblOk} deliberate demonstrations, ${dblBad} defects)`);
console.log(`  sidebar chapters=${navTop} links=${navLinks} ch-toc=${chToc}`);
console.log(`  band: ${band}`);
console.log(`  title: ${title}`);
console.log(`  desc(${desc.length}): ${desc}`);
console.log(problems.length ? '\n  PROBLEMS:\n   - ' + problems.join('\n   - ') : '\n  OK');
process.exit(problems.length ? 1 : 0);
