// Focused audit of index.html rendering integrity.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const file = path.join(root, 'index.html');
const s = fs.readFileSync(file, 'utf8');

const out = [];
const say = (...a) => out.push(a.join(' '));

// ---- 1. duplicate ids -------------------------------------------------
const idRe = /<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*\sid="([^"]+)"/g;
const ids = new Map();
for (const m of s.matchAll(idRe)) {
  const id = m[2];
  ids.set(id, (ids.get(id) || 0) + 1);
}
const dupIds = [...ids].filter(([, n]) => n > 1);
say('# duplicate ids:', dupIds.length);
dupIds.forEach(([id, n]) => say('   ', id, 'x' + n));

// ---- 2. href / src resolution ---------------------------------------
const anchors = new Set(ids.keys());
const refRe = /(?:href|src)="([^"]+)"/g;
const missingFile = new Map();
const missingAnchor = new Map();
for (const m of s.matchAll(refRe)) {
  const ref = m[1];
  if (/^(https?:|data:|mailto:|javascript:)/i.test(ref)) continue;
  const [p, hash] = ref.split('#');
  if (p) {
    const clean = p.split('?')[0];
    if (clean && !fs.existsSync(path.join(root, clean))) {
      missingFile.set(clean, (missingFile.get(clean) || 0) + 1);
    }
    // fragment in another file: cannot check cheaply without parsing it
  }
  if (hash && (!p || p === 'index.html')) {
    if (!anchors.has(hash)) missingAnchor.set(hash, (missingAnchor.get(hash) || 0) + 1);
  }
}
say('# missing files:', missingFile.size);
[...missingFile].forEach(([f, n]) => say('   ', f, 'x' + n));
say('# missing local anchors:', missingAnchor.size);
[...missingAnchor].forEach(([f, n]) => say('   ', '#' + f, 'x' + n));

// ---- 3. tag balance --------------------------------------------------
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const stack = [];
const faults = [];
const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
// strip comments and scripts/styles carefully
let body = s.replace(/<!--[\s\S]*?-->/g, '');
let m;
while ((m = tagRe.exec(body))) {
  const [, close, rawName, attrs, selfClose] = m;
  const name = rawName.toLowerCase();
  if (VOID.has(name) || selfClose === '/') continue;
  if (!close) stack.push({ name, at: m.index });
  else {
    if (!stack.length) { faults.push({ kind: 'extra-close', name, at: m.index }); continue; }
    const top = stack[stack.length - 1];
    if (top.name === name) stack.pop();
    else {
      faults.push({ kind: 'mismatch', want: top.name, got: name, at: m.index });
      // resync
      let k = stack.length - 1;
      while (k >= 0 && stack[k].name !== name) k--;
      if (k >= 0) { stack.length = k; } else { /* stray */ }
    }
  }
}
say('# unclosed at eof:', stack.length, stack.map(n => n.name).join(','));
say('# nesting faults:', faults.length);
faults.slice(0, 20).forEach(f => {
  const line = s.slice(0, f.at).split('\n').length;
  say('   ', 'line', line, JSON.stringify(f));
});

// ---- 4. required markers -------------------------------------------
const markers = {
  'skip link': /<a class="am-skip" href="#content">/,
  'main#content': /<main id="content"/,
  'shell.css': /<link rel="stylesheet" href="assets\/shell.css">/,
  'hub.css': /<link rel="stylesheet" href="assets\/hub.css">/,
  'shell.js': /<script src="assets\/shell.js" defer><\/script>/,
  'hub.js': /<script src="assets\/hub.js" defer><\/script>/,
  'one h1': null,
};
for (const [k, re] of Object.entries(markers)) {
  if (!re) continue;
  if (!re.test(s)) say('# MISSING marker:', k);
}
const h1 = [...s.matchAll(/<h1\b[^>]*>/g)];
say('# h1 count:', h1.length);

// ---- 5. counts consistency -----------------------------------------
const nums = {};
for (const re of [/([\d,]+)\s*(?:guides|guide)/gi]) {
  for (const m of s.matchAll(re)) nums[m[1]] = (nums[m[1]] || 0) + 1;
}
const statPairs = [...s.matchAll(/<b>([\d,]+)<\/b><span>([^<]+)<\/span>/g)].map(m => m[1] + ' ' + m[2]);
say('# hero stats:', JSON.stringify(statPairs));

// count cards
const cards = [...s.matchAll(/class="am-card[^"]*"\s+data-file="([^"]+)"/g)].map(m => m[1]);
const cards2 = [...s.matchAll(/data-file="([^"]+)"/g)].map(m => m[1]);
say('# am-card data-file:', cards.length, '| all data-file:', cards2.length, '| unique:', new Set(cards2).size);

console.log(out.join('\n'));
