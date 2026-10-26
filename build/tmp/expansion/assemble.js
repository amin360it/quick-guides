// assemble.js — build the final ui-ux-graphics.txt fragment from parts + tail
const fs = require("fs");

const p1 = fs.readFileSync("ui-ux-graphics.part1", "utf8");
let p2raw = fs.readFileSync("ui-ux-graphics.part2", "utf8");
let p3raw = fs.readFileSync("ui-ux-graphics.part3a", "utf8");
const tail = fs.readFileSync("ui-ux-graphics.tail.txt", "utf8");

// --- fixes to the part files ---

// part2: raw "<" inside a code block (letter-spacing block, ch5-4)
const p2Before = p2raw;
p2raw = p2raw.split("ALL CAPS < 16px    do not use            unreadable")
              .join("ALL CAPS &lt; 16px    do not use            unreadable");
console.log("part2 fix applied:", p2raw !== p2Before ? "yes" : "NO — PATTERN MISSING");

// part3a: stray <strong> inside a code block (ch6-3 microinteraction checklist)
const p3Before = p3raw;
p3raw = p3raw.split("one eas<strong>ing</strong> per product, listed in the motion tokens")
              .join("one easing per product, listed in the motion tokens");
console.log("part3a strong fix applied:", p3raw !== p3Before ? "yes" : "NO — PATTERN MISSING");

// part3a: keep everything up to (but not including) h3 id="ch7-4"
const cut = p3raw.indexOf('<h3 id="ch7-4"');
if (cut < 0) { console.error("ch7-4 marker not found in part3a"); process.exit(1); }
const p3head = p3raw.slice(0, cut);
console.log("part3a head keeps ch6 + 7.1-7.3, cut at", cut, "chars; tail kept:", p3raw.length - cut, "chars");

// --- assemble ---
const out = p1 + "\n" + p2raw + "\n" + p3head + "\n" + tail;
fs.writeFileSync("ui-ux-graphics.txt", out);
console.log("written ui-ux-graphics.txt, bytes:", Buffer.byteLength(out, "utf8"));

// quick sanity head/tail
const t = out.trimStart();
console.log("starts with:", JSON.stringify(t.slice(0, 28)));
const tt = out.trimEnd();
console.log("ends with:", JSON.stringify(tt.slice(-12)));