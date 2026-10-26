// tags.js — tag-balance and heading list for the fragment
const fs = require("fs");
const html = fs.readFileSync("build/tmp/expansion/website-seo.txt", "utf8");

const re = /<(\/?)(h2|h3|h4|section|div|p|ul|li|ol|pre|code)(?:"[^"]*"|[^>])*>/g;
let stack = [], m;
while ((m = re.exec(html)) !== null) {
  const [, close, tag] = m;
  if (close) {
    const top = stack.pop();
    if (top !== tag) { console.log("MISMATCH: closing", tag, "top of stack is", top); stack.push(top); }
  } else {
    stack.push(tag);
  }
}
console.log(stack.length ? "UNCLOSED: " + stack.join(",") : "TAGS BALANCED");

console.log("\n--- h2 / h3 heading ids and titles ---");
const heads = [...html.matchAll(/<h([23]) id="(ch[^"]+)"[^>]*>(?:\s*)([^\n<]*)<\/h\1>/g)];
heads.forEach((x) => console.log(`h${x[1]} ${x[2]} — ${x[3].trim()}`));
console.log("total:", heads.length);