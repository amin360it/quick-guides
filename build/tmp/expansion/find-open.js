const fs = require("fs");
const h = fs.readFileSync("ui-ux-graphics.part3a", "utf8");
const opens = [...h.matchAll(/<div class="codeWrap"><pre><code>/g)].map((m) => m.index);
const closes = [...h.matchAll(/<\/code><\/pre><\/div>/g)].map((m) => m.index);
console.log("opens", opens.length, "closes", closes.length);
opens.forEach((o, i) => {
  const c = closes[i];
  if (c === undefined || o > c) {
    const p = h.slice(Math.max(0, o - 100), o + 300);
    console.log("OPEN without close at idx", o, "ctx:", JSON.stringify(p));
  }
});