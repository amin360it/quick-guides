// check-parts.js — verify code blocks in the part files are clean
const fs = require("fs");
const files = ["ui-ux-graphics.part1", "ui-ux-graphics.part2", "ui-ux-graphics.part3a"];
let problems = 0;

for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const blocks = [...html.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)];
  console.log(`\n== ${f}: ${blocks.length} code blocks ==`);
  blocks.forEach((m, i) => {
    const code = m[1];
    // raw < inside code (excluding entity-escaped)
    if (/<(?![\/a-zA-Z!])/.test(code)) {
      const mm = code.match(/<(?![\/a-zA-Z!])[^<]{0,40}/);
      problems++;
      console.log(`  [${i}] RAW < in code: ${JSON.stringify(mm && mm[0])}`);
    }
    if (/<[a-zA-Z]/.test(code)) {
      // any raw HTML tag that is not an entity
      const mm = code.match(/<[a-zA-Z][^>]*>/);
      problems++;
      console.log(`  [${i}] RAW TAG in code: ${JSON.stringify(mm && mm[0])}`);
    }
    // double escapes
    if (/&amp;(lt|gt|amp|quot|#)/.test(code)) {
      problems++;
      console.log(`  [${i}] DOUBLE ESCAPE: ${JSON.stringify(code.match(/&amp;(lt|gt|amp|quot|#)[^\s]*/))}`);
    }
    // bare & not part of allowed entities
    for (const bm of code.matchAll(/&/g)) {
      const ctx = code.slice(bm.index, bm.index + 8);
      if (!/^&(amp|lt|gt|quot|#\d+|nbsp|#x[0-9a-fA-F]+);/.test(ctx)) {
        problems++;
        console.log(`  [${i}] BARE &: ${JSON.stringify(ctx)}`);
      }
    }
    // repeat of own first 200 chars
    const head = code.slice(0, 200);
    if (head.length >= 50 && code.indexOf(head, 100) !== -1 && code.indexOf(head, 100) !== code.length - head.length) {
      problems++;
      console.log(`  [${i}] REPEATED opening (possible duplication)`);
    }
  });
}
console.log(`\nproblems: ${problems}`);
process.exit(problems ? 1 : 0);