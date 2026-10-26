const fs = require('fs');
const h = fs.readFileSync(process.argv[2] || 'build/bak/react.html.orig', 'utf8');
const body = h.slice(h.indexOf('<body'));
const main = body.slice(body.indexOf('<main'), body.indexOf('</main>'));
const count = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const variants = {
  'tags-to-nothing': main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ''),
  'tags-space-normalized': main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  'strip-codeblocks': main.replace(/<div class="codeWrap">[\s\S]*?<\/div>/g, '').replace(/<[^>]+>/g, ' '),
  'body-no-script': body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  'main-entities-decoded': main.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&middot;/g, '·'),
};
for (const k in variants) {
  const c = count(variants[k]);
  console.log(k, c, c === 18972 ? '<== MATCH' : '');
}
console.log('target 18972');
