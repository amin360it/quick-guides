const fs = require('fs');
const t = fs.readFileSync('webapp-design.html', 'utf8');
const main = t.slice(t.indexOf('<main id='), t.lastIndexOf('</main>'));
const out = [];
const re = /<h([234]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
let m;
while ((m = re.exec(main)) !== null) out.push({ level: +m[1], id: m[2], text: m[3].replace(/<[^>]+>/g, '').trim() });
console.log('items:', out.length);
console.log(out.slice(0, 8).map((x) => x.level + ' | ' + x.id + ' | ' + x.text).join('\n'));

// tree
const root = [];
const stack = [];
for (const it of out) {
  const node = { ...it, children: [] };
  while (stack.length && stack[stack.length - 1].level >= node.level) stack.pop();
  if (stack.length) stack[stack.length - 1].children.push(node);
  else root.push(node);
  stack.push(node);
}
console.log('root nodes:', root.length, 'first root children:', root[0] && root[0].children.length);
