// carry-check.js
const fs = require("fs");
const html = fs.readFileSync("build/tmp/expansion/website-seo.txt", "utf8");
const frag = html.slice(html.indexOf("<section"), html.lastIndexOf("</section>") + 10);
const carry = [
  "10 Best Espresso Machines",
  "Espresso Machine X1",
  "professional barista since 2012",
  "cuisinart espresso machine how to clean",
  'rel="alternate" hreflang="en-US"',
  "Screaming Frog",
  "data over intuition",
  "branded   62%",
  "Sitemap: https://example.com/sitemap.xml",
  "never stuff keywords",
];
let ok = true;
for (const needle of carry) {
  const found = html.includes(needle);
  if (!found) ok = false;
  console.log((found ? "KEPT  " : "MISSING") + "  " + needle);
}
console.log("\nstarts with <section class=\"chapter\">:", html.startsWith("<section class=\"chapter\">"));
console.log("ends with </section>:", html.trimEnd().endsWith("</section>"));
console.log("bytes:", Buffer.byteLength(html, "utf8"));
process.exit(ok ? 0 : 1);
