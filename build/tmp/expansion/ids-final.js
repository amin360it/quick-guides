const fs = require("fs");
const h = fs.readFileSync("ui-ux-graphics.txt", "utf8");
const h2 = [...h.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
const h3 = [...h.matchAll(/<h3 id="([^"]+)"/g)].map((m) => m[1]);
const h4 = [...h.matchAll(/<h4 id="([^"]+)"/g)].map((m) => m[1]);
console.log("h2 (" + h2.length + "): " + h2.join(" "));
console.log();
const perCh = {};
for (const id of h3) { const ch = id.split("-")[0]; (perCh[ch] = perCh[ch] || []).push(id); }
for (const ch of Object.keys(perCh)) console.log("h3 " + ch + "(" + perCh[ch].length + "): " + perCh[ch].join(" "));
console.log();
const h4new = h4.filter((id) => id.startsWith("ch7-4") || id.startsWith("ch8"));
console.log("new h4 ids (" + h4new.length + "): " + h4new.join(" "));
console.log("total ids:", h2.length + h3.length + h4.length);
const all = [...h2, ...h3, ...h4];
console.log("unique page-wide:", new Set(all).size === all.length ? "yes" : "NO");