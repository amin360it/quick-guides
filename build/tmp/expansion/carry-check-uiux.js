// carry-check-uiux.js — confirm original page material survived into the fragment
const fs = require("fs");
const frag = fs.readFileSync("ui-ux-graphics.txt", "utf8");
const carry = [
  // from the orientation chapter
  "4.5:1  normal text              (WCAG AA)",
  "Grey-on-grey is the single most common",
  "320 px viewport",
  "Design tokens in version control beat any tool's export",
  // from original ch1 visual hierarchy
  "LEVEL 1  the page's single purpose: the main heading",
  "32px is read before 16px, always",
  "it is how you group a label with its input",
  '&lt;label&gt;Email address&lt;/label&gt;',
  ".container { max-width: 1248px; margin-inline: auto; padding-inline: 24px; }",
  "grid-template-columns: repeat(12, minmax(0, 1fr));",
  ".table[data-density=\"compact\"] td { padding-block: 6px; }",
  ".icon-btn { width: 44px; height: 44px; display: grid; place-items: center; }",
  "a circle with a 40px gap reads as \"a circle\", not \"an arc\"",
  "the 5-second test: show someone the page for 5 seconds",
  "13px here, 16px there, 11px somewhere else",
  "SPACIOUS   landing pages, marketing, reading, onboarding",
  "if the text wraps to more than two lines, left it",
  // from original ch2 colour
  "A PALETTE is what you picked. A SYSTEM is what each colour DOES.",
  "content/on-primary",
  "surface/sunken",
  "the steps are perceptually even, so 500 and 600 read as",
  "--brand-500: oklch(0.62 0.19 255);",
  "function contrast(hex1: string, hex2: string): number",
  "contrast('#64748b', '#ffffff');   // 4.76:1  passes for body text",
  "browsers render it at ~54% opacity by",
  "[data-theme=\"dark\"] { --color-bg: oklch(0.16 0.01 250); --color-accent: oklch(0.72 0.14 255); }",
  "red = error, green = success, with no other difference",
  "1 in 12 men and 1 in 200 women",
  '"slate": { "50": "#f8fafc"',  // token file JSON
  '"accent-hover":"{blue.400}"', // dark block
  "--color-bg: #f8fafc;",          // generated CSS
  // from original ch3 typography
  "BASE 16px, RATIO 1.25 (minor third)",
  "12   14   16   20   24   32   40   48   64",
  "large text needs LESS relative leading",
  "h1      { font-size: 2.5rem; line-height: 1.15; }  /* 46px */",
  "max-width: 65ch;",
  "font-display: swap;      /* show fallback immediately, swap in when",
  "size-adjust: 107%;",
  "h1 { font-size: 3rem; letter-spacing: -0.025em; }",
  "font-variant-numeric: tabular-nums;",
  "clamp(1.75rem, 1.1rem + 3.2vw, 3.5rem)",
  "orphans: 2; widows: 2;  /* CSS, worth knowing about */",
  "Test type at 200% zoom before you ship",
];
let missing = 0;
for (const n of carry) {
  const f = frag.includes(n);
  if (!f) { missing++; console.log("MISSING:", JSON.stringify(n.slice(0, 70))); }
}
console.log(`carried ${carry.length - missing}/${carry.length} original-content needles`);

// whole-file double-escape scan (prose + code)
for (const bad of ["&amp;amp;", "&amp;lt;", "&amp;gt;", "&amp;quot;", "&amp;#"]) {
  const idx = frag.indexOf(bad);
  console.log(idx === -1 ? "ok  : no " + bad : "FAIL: " + bad + " at " + idx);
}
process.exit(missing ? 1 : 0);