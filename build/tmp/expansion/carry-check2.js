// carry-check2.js
const fs = require("fs");
const html = fs.readFileSync("build/tmp/expansion/website-seo.txt", "utf8");
console.log("N-ever stuff keywords (case-insensitive):", /never stuff keywords/i.test(html));
console.log("stale 'chapter 13' reference gone:", !/chapter 13/i.test(html));
console.log("stale 'chapters 5–9' reference gone:", !/chapters 5\u20139|chapters 5-9/i.test(html));
console.log("new 'jump straight to chapter 8' present:", /jump straight to chapter 8/i.test(html));
console.log("two-axis 'works offline' style count preserved: n/a (page-level)");
process.exit(0);
