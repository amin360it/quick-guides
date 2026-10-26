const fs = require("fs");
const h = fs.readFileSync("ui-ux-graphics.txt", "utf8");
console.log("no raw <strong>:", h.indexOf("<strong>") === -1 ? "ok" : "FAIL");
console.log("no raw 'ALL CAPS < 16':", h.indexOf("ALL CAPS < 16") === -1 ? "ok" : "FAIL");
const t = h.match(/<h2 id="ch\d" data-toc>[^\n]+/g) || [];
t.forEach((x) => console.log(x.trim()));
console.log("h2 count:", t.length);