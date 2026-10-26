const fs = require("fs");
const h = fs.readFileSync("ui-ux-graphics.txt", "utf8");
const seams = (h.match(/<\/section>\s*<section class="chapter">/g) || []).length;
console.log("chapter-section seams:", seams, "(expected 7)");
const lines = h.split("\n");
console.log("lines:", lines.length);
for (let n = 0; n < lines.length; n++) {
  if (/<h3 id="ch7-3"/.test(lines[n])) console.log("ch7-3 at line", n + 1);
  if (/<h3 id="ch7-4"/.test(lines[n])) console.log("ch7-4 at line", n + 1);
  if (/<h2 id="ch8"/.test(lines[n])) console.log("ch8 at line", n + 1);
  if (/<h2 id="ch3"/.test(lines[n])) console.log("ch3 at line", n + 1);
}
// show the exact seam content around ch7-4 (my splice point)
const marker = '<h3 id="ch7-4"';
const at = h.indexOf(marker);
console.log("--- seam before ch7-4 ---");
console.log(JSON.stringify(h.slice(at - 160, at + 60)));
const h8 = h.indexOf('<h2 id="ch8"');
console.log("--- seam before ch8 ---");
console.log(JSON.stringify(h.slice(h8 - 140, h8 + 40)));