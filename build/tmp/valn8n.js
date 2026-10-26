const fs = require('fs');
const p = 'build/newguides/n8n.main.html';
const s = fs.readFileSync(p, 'utf8');
const errs = [];
const warns = [];

// 1. ids unique + URL-safe
const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const seen = new Map();
for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
for (const [id, n] of seen) if (n > 1) errs.push(`dup id: ${id} (${n})`);
for (const id of ids) if (!/^[a-z0-9-]+$/.test(id)) errs.push(`bad id: ${id}`);

// 2. headings
const h2 = [...s.matchAll(/<h2 id="([^"]+)" data-toc>([^<]*)<\/h2>/g)].map(m => ({ id: m[1], t: m[2], at: m.index }));
const h3 = [...s.matchAll(/<h3 id="([^"]+)" data-toc>([^<]*)<\/h3>/g)].map(m => ({ id: m[1], t: m[2], at: m.index }));
const h4 = [...s.matchAll(/<h4 id="([^"]+)"[^>]*>([^<]*)<\/h4>/g)].map(m => ({ id: m[1], t: m[2], at: m.index }));
console.log('h2', h2.length, 'h3', h3.length, 'h4', h4.length);

// every h3 must have >=1 h4 before next h3 or </section>
const boundaries = [...h3.map(x => x.at), s.length].sort((a, b) => a - b);
for (let i = 0; i < h3.length; i++) {
  const next = (i + 1 < h3.length) ? h3[i + 1].at : s.length;
  const seg = s.slice(h3[i].at, next);
  const n = (seg.match(/<h4 /g) || []).length;
  if (n < 1) errs.push(`h3 ${h3[i].id} has ${n} h4`);
}

// 3. numbering: h3 "c.n" matches chapter number from h2 "c · ..."
const chNum = {};
let curCh = null;
const events = [...h2.map(x => ({ ...x, kind: 'h2' })), ...h3.map(x => ({ ...x, kind: 'h3' })), ...h4.map(x => ({ ...x, kind: 'h4' }))].sort((a, b) => a.at - b.at);
for (const e of events) {
  if (e.kind === 'h2') {
    const m = e.t.match(/^(\d+)\s*·/);
    if (!m) errs.push(`h2 title not numbered: ${e.t}`);
    curCh = m ? m[1] : null;
  } else if (e.kind === 'h3') {
    const m = e.t.match(/^(\d+)\.(\d+)\s/);
    if (!m) errs.push(`h3 title not numbered: ${e.t}`);
    else if (m[1] !== curCh) errs.push(`h3 ${e.t} under chapter ${curCh}`);
  }
}

// 4. code blocks: no raw < inside code content, no double escapes
const codes = [...s.matchAll(/<code>([\s\S]*?)<\/code>/g)];
console.log('code blocks', codes.length);
for (const m of codes) {
  const body = m[1];
  if (/<[a-zA-Z/]/.test(body)) errs.push(`raw < in code near: ${body.slice(0, 60).replace(/\n/g, ' ')}`);
  if (/&amp;lt;/.test(body)) warns.push(`double-escaped &lt; in code`);
  if (/&amp;amp;/.test(body)) errs.push(`double-escaped &amp; near: ${body.slice(0, 60)}`);
}
if (/&amp;lt;/.test(s)) warns.push('global &amp;lt; found');
if (/&amp;amp;/.test(s)) errs.push('global &amp;amp; found');

// 5. callout classes
const callouts = [...s.matchAll(/<div class="([^"]+)">/g)].map(m => m[1]);
const allowed = new Set(['codeWrap', 'tip', 'warn', 'note', 'ex', 'chapter']);
const bad = [...new Set(callouts)].filter(c => !c.split(/\s+/).every(x => x === 'chapter' || allowed.has(x)));
for (const b of bad) errs.push(`unexpected div class: ${b}`);

// 6. prose bytes per h3 (strip code, tables, tags)
let minB = 1e9, minId = '', tiny = [];
for (let i = 0; i < h3.length; i++) {
  const next = (i + 1 < h3.length) ? h3[i + 1].at : s.length;
  let seg = s.slice(h3[i].at, next);
  seg = seg.replace(/<div class="codeWrap">[\s\S]*?<\/div>/g, '');
  seg = seg.replace(/<table>[\s\S]*?<\/table>/g, '');
  seg = seg.replace(/<[^>]+>/g, ' ');
  const len = seg.replace(/\s+/g, ' ').trim().length;
  if (len < minB) { minB = len; minId = h3[i].id; }
  if (len < 1500) tiny.push(`${h3[i].id}=${len}`);
}
console.log('min prose bytes/h3:', minB, minId);
if (tiny.length) warns.push('under 1500B: ' + tiny.join(', '));

// 7. tag balance stack
const VOID = new Set(['br', 'hr', 'img', 'meta', 'link', 'input', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr']);
const stack = [];
const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
let m2, mis = 0;
while ((m2 = tagRe.exec(s))) {
  const close = m2[1] === '/';
  const tag = m2[2].toLowerCase();
  if (VOID.has(tag)) continue;
  if (m2[3].endsWith('/')) continue;
  if (!close) stack.push({ tag, at: m2.index });
  else {
    const top = stack[stack.length - 1];
    if (!top || top.tag !== tag) { errs.push(`tag mismatch </${tag}> at ${m2.index}, stack top ${top ? top.tag : 'none'}`); if (++mis > 5) break; }
    else stack.pop();
  }
}
if (stack.length) errs.push('unclosed tags: ' + stack.map(x => x.tag).join(', '));

console.log('\n--- ERRORS (' + errs.length + ') ---');
errs.slice(0, 40).forEach(e => console.log('E: ' + e));
console.log('--- WARNINGS (' + warns.length + ') ---');
warns.slice(0, 40).forEach(e => console.log('W: ' + e));
