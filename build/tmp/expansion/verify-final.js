// verify-final.js — full check on the assembled ui-ux-graphics.txt
const fs = require("fs");
const html = fs.readFileSync("ui-ux-graphics.txt", "utf8");
let problems = 0;
const say = (bad, msg) => { if (bad) { problems++; console.log("FAIL:", msg); } else { console.log("ok  :", msg); } };

// 1. start / end shape
say(!html.trimStart().startsWith('<section class="chapter">'), "starts with <section class=\"chapter\">");
say(!html.trimEnd().endsWith("</section>"), "ends with </section>");

// 2. no <style>, no span highlighting
say(html.includes("<style"), "no <style> emitted");
say(/<span class="[csnk]"/.test(html), "no hand-highlight spans");

// 3. tag balance (the ch-toc sentinel "<div class=\"ch-toc\"></div></div>"
//    is an unbalanced placeholder BY DESIGN — the splice tool replaces it)
const balanced = html.replace(/<div class="ch-toc"><\/div><\/div>/g, "<div class=\"ch-toc-N\"></div>");
const re = /<(\/?)(section|h2|h3|h4|div|p|ul|li|ol|pre|code|a)(?:"[^"]*"|[^>])*>/g;
let stack = [], m;
const matches = [...balanced.matchAll(re)];
for (const mm of matches) {
  const [, close, tag] = mm;
  if (close) { const top = stack.pop(); if (top !== tag) { problems++; console.log("MISMATCH: closing", tag, "top:", top); stack.push(top); } }
  else stack.push(tag);
}
say(stack.length > 0, "tags balanced (unclosed: " + stack.join(",") + ")");

// 4. headings: conventions and uniqueness
const heads = [...html.matchAll(/<h([23]) id="([^"]+)" data-toc>([^\n<]*)<\/h\1>/g)];
say(heads.length === 0, `h2/h3 count = ${heads.length}`);
const seen = new Set();
let dupes = [];
for (const h of heads) { if (seen.has(h[2])) dupes.push(h[2]); seen.add(h[2]); }
say(dupes.length > 0, "h2/h3 ids unique (dupes: " + dupes.join(",") + ")");

const h2s = heads.filter((h) => h[1] === "2");
const h3s = heads.filter((h) => h[1] === "3");
say(h2s.length !== 8, "exactly 8 chapters, got " + h2s.length);
// h2 titles: id chN and title starts "N ▸"
let h2bad = [];
h2s.forEach((h) => {
  const id = h[2], t = h[3].trim();
  const num = t.match(/^(\d+) ▸/) && t.match(/^(\d+) ▸/)[1];
  if (id !== "ch" + num) h2bad.push(id + " vs " + t);
});
say(h2bad.length > 0, "h2 ids match 'N ▸' titles (" + h2bad.join("; ") + ")");
// h3 titles N.M and ids chN-M
let h3bad = [];
h3s.forEach((h) => {
  const id = h[2], t = h[3].trim();
  const num = t.match(/^(\d)\.(\d)/);
  const want = "ch" + (num ? num[1] : "?") + "-" + (num ? num[2] : "?");
  if (!num || id !== want) h3bad.push(id + " vs " + t);
});
say(h3bad.length > 0, "h3 ids match 'N.M' titles (" + h3bad.join("; ") + ")");
// per-chapter h3 counts between 3 and 5
let perCh = {};
for (const h of h3s) { const ch = h[2].split("-")[0]; perCh[ch] = (perCh[ch] || 0) + 1; }
let chBad = Object.entries(perCh).filter(([, n]) => n < 3 || n > 5);
say(chBad.length > 0, "3-5 h3 per chapter (" + JSON.stringify(perCh) + ")");

// 5. h4 ids unique kebab-case
const h4s = [...html.matchAll(/<h4 id="([^"]+)">/g)];
const seen4 = new Set(); let d4 = [];
for (const h of h4s) { if (seen4.has(h[1])) d4.push(h[1]); seen4.add(h[1]); }
say(d4.length > 0, "h4 ids unique (dupes: " + d4.join(",") + ")");
let bad4 = h4s.map((h) => h[1]).filter((x) => !/^ch\d+-\d+-[a-z0-9-]+$/.test(x));
say(bad4.length > 0, "h4 ids kebab-chN-M-* (" + bad4.join(",") + ")");
saw("h4 count", h4s.length);

// 6. every h3 has at least one code block before the next h3/h2/section end
const bodyParts = html.split(/<h[23] id="/);
let h3Missing = [];
let h4count = 0;
const h3Blocks = html.split("<h3 ").slice(1);
h3Blocks.forEach((seg, i) => {
  const idm = seg.match(/id="([^"]+)"/);
  if (!idm) return;
  const id = idm[1];
  const end = seg.indexOf("</section>");
  const chunk = seg.slice(0, end === -1 ? seg.length : end);
  const blocks = (chunk.match(/<div class="codeWrap">/g) || []).length;
  const h4sIn = (chunk.match(/<h4 id="/g) || []).length;
  h4count += h4sIn;
  if (blocks < 1) h3Missing.push(id + ":" + blocks + " blocks, " + h4sIn + " h4");
  // also warn if h4 count outside 2-4
});
say(h3Missing.length > 0, "each h3 has >=1 code block (missing: " + h3Missing.join(",") + ")");
console.log("      h4 total:", h4count, " h3 total:", h3s.length);

// 7. code block escaping
const blocks = [...html.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)];
say(blocks.length < 40, `code block count = ${blocks.length} (target >= 40)`);
blocks.forEach((m, i) => {
  const code = m[1];
  if (/<(?![\/a-zA-Z!])/.test(code)) { problems++; console.log(`  FAIL block ${i} raw < :`, JSON.stringify(code.match(/<(?![\/a-zA-Z!])[^<\n]{0,30}/)[0])); }
  if (/<[a-zA-Z]/.test(code)) { problems++; console.log(`  FAIL block ${i} raw tag :`, JSON.stringify(code.match(/<[a-zA-Z][^<\n>]*>/)[0])); }
  if (/&amp;(lt|gt|amp|quot|#)/.test(code)) { problems++; console.log(`  FAIL block ${i} double escape`); }
  for (const bm of code.matchAll(/&/g)) {
    const ctx = code.slice(bm.index, bm.index + 9);
    if (!/^&(amp|lt|gt|quot|#\d+|nbsp|#x[0-9a-fA-F]+);/.test(ctx)) { problems++; console.log(`  FAIL block ${i} bare &:`, JSON.stringify(ctx)); }
  }
  const head = code.slice(0, 200);
  if (head.length >= 50) {
    const second = code.indexOf(head, 100);
    if (second !== -1 && second !== code.length - head.length) { problems++; console.log(`  FAIL block ${i} repeated own opening`); }
  }
});
console.log("      (code blocks with entity OK)");

// 8. callouts
const tip = (html.match(/class="tip"/g) || []).length;
const warn = (html.match(/class="warn"/g) || []).length;
const note = (html.match(/class="note"/g) || []).length;
say(false, `callouts tip=${tip} warn=${warn} note=${note}`);
// 9. ch-toc placeholder per chapter
const tocPh = (html.match(/<div class="ch-toc"><\/div><\/div>/g) || []).length;
say(tocPh !== 8, `ch-toc placeholders = ${tocPh} (expect 8)`);
// 10. prose with <code> inline is fine; no <strong> inside code already covered

console.log("\nPROBLEMS:", problems);
process.exit(problems ? 1 : 0);

function saw(label, n) { console.log("      " + label + ":", n); }