// Validate hub.css against the same invariants check-css.js applies to shell.css.
const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.resolve(__dirname, '..', '..', 'assets', 'hub.css'), 'utf8');

const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
const open = (stripped.match(/{/g) || []).length;
const close = (stripped.match(/}/g) || []).length;
console.log('braces: { =', open, '} =', close, open === close ? 'OK' : 'MISMATCH');

const comments = css.match(/\/\*[\s\S]*?\*\//g) || [];
const braceInComment = comments.filter(c => /[{}]/.test(c));
console.log('comments containing { or }:', braceInComment.length);
braceInComment.forEach(c => console.log('   ', c.slice(0, 90).replace(/\n/g, ' ')));

const allowed = ['var(--radius)', 'var(--radius-xs)', 'var(--radius-lg)', '50%', '999px', '99px', '0'];
const radii = [...css.matchAll(/border-radius:\s*([^;}]+)/g)].map(m => m[1].trim());
const badR = radii.filter(r => !allowed.includes(r));
console.log('border-radius declarations:', radii.length, '| off-scale:', badR.length);
[...new Set(badR)].forEach(r => console.log('   ', r));

const hex = [];
[...stripped.matchAll(/([a-z-]+):\s*([^;}]+)/g)].forEach(m => {
  if (/#[0-9a-fA-F]{3,8}\b/.test(m[2])) hex.push(m[0].trim());
});
console.log('declarations with a literal hex:', hex.length);
hex.forEach(h => console.log('   ', h));

// empty rules
const emptyRules = [...stripped.matchAll(/([^{}]+)\{\s*\}/g)].map(m => m[1].trim());
console.log('empty rules:', emptyRules.length);
emptyRules.forEach(r => console.log('   ', r));

// every selector balanced parens
const badParen = [];
[...stripped.matchAll(/([^{}]+)\{/g)].forEach(m => {
  const sel = m[1].trim();
  const o = (sel.match(/\(/g) || []).length;
  const c = (sel.match(/\)/g) || []).length;
  if (o !== c) badParen.push(sel);
});
console.log('selectors with unbalanced parens:', badParen.length);
badParen.forEach(s => console.log('   ', s));
