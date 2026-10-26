// index.html: CSS class coverage + count consistency vs disk.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const s = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const hub = fs.readFileSync(path.join(root, 'assets', 'hub.css'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'assets', 'shell.css'), 'utf8');
const css = hub + '\n' + shell;

const out = [];
const say = (...a) => out.push(a.join(' '));

// classes used in markup
const used = new Set();
const stripped = s
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '');
for (const m of stripped.matchAll(/class="([^"]+)"/g)) {
  for (const c of m[1].trim().split(/\s+/)) if (c) used.add(c);
}
const defined = new Set();
for (const m of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) defined.add(m[1]);
const cssOnly = [...used].filter(c => !defined.has(c)).sort();
say('# classes used but NOT in hub.css/shell.css:', cssOnly.length);
cssOnly.forEach(c => say('   ', c));

// generated-at-runtime classes come from hub.js / shell.js — list them
const js = fs.readFileSync(path.join(root, 'assets', 'hub.js'), 'utf8');
const jscls = new Set();
for (const m of js.matchAll(/class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) jscls.add(c);
for (const m of js.matchAll(/classList\.(?:add|toggle)\('([^']+)'/g)) jscls.add(m[1]);
const reallyMissing = cssOnly.filter(c => !jscls.has(c));
say('# -- not emitted by JS either:', reallyMissing.length);
reallyMissing.forEach(c => say('   ', c));

// section ids present
const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
say('# ids:', ids.length);
say('# has cat-* anchors:', ids.filter(i => i.startsWith('cat-')).length);

// category guide counts claimed vs cards per section
const sections = [...s.matchAll(/<section[^>]*id="(cat-[^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
say('# category sections:', sections.length);
for (const [, id, inner] of sections) {
  const cards = (inner.match(/data-file="/g) || []).length;
  const claimM = inner.match(/class="am-pillar-n">([^<]+)</) || inner.match(/([\d,]+)\s*guides/);
  const head = inner.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  say('   ', id, '| cards=' + cards, '| head=' + (head ? head[1].replace(/<[^>]+>/g, '').trim() : '?'));
}

// number consistency
say('');
say('# --- numeric claims ---');
const claims = [];
for (const m of s.matchAll(/([\d,]{2,})\s*(?:guides?|chapters?|topics?|sub-sections?|code samples?|exercise sets?|samples?)/gi)) {
  claims.push(m[0].replace(/\s+/g, ' '));
}
const uniq = {};
for (const c of claims) uniq[c] = (uniq[c] || 0) + 1;
Object.entries(uniq).sort().forEach(([c, n]) => say('   ', c, 'x' + n));

console.log(out.join('\n'));
