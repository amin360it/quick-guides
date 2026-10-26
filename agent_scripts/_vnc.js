'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const f = path.join(ROOT, 'vue-nuxt-capacitor.html');
const s = fs.readFileSync(f, 'utf8');
const lineOf = (i) => s.slice(0, i).split('\n').length;

console.log('FILE bytes:', s.length);
console.log('\n---- H1 ----');
for (const m of s.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)) console.log(`${lineOf(m.index)}: ${m[1].replace(/\s+/g, ' ').trim()}`);

console.log('\n---- H2 (data-toc or not) ----');
for (const m of s.matchAll(/<h2([^>]*)>([\s\S]*?)<\/h2>/g)) {
  const id = (m[1].match(/id="([^"]+)"/) || [])[1] || 'NO-ID';
  const toc = /\bdata-toc\b/.test(m[1]) ? 'toc' : '---';
  console.log(`${lineOf(m.index)}  ${toc}  ${id.padEnd(22)} ${m[2].replace(/\s+/g, ' ').trim().slice(0, 60)}`);
}

console.log('\n---- H3 count by id-suffix ----');
const h3 = [...s.matchAll(/<h3([^>]*)>/g)].map((m) => (m[1].match(/id="([^"]+)"/) || [])[1] || 'NO-ID');
console.log('h3 total:', h3.length, '| with -u1:', h3.filter((x) => x.endsWith('-u1')).length, '| without:', h3.filter((x) => !x.endsWith('-u1')).length);

console.log('\n---- section.chapter count ----');
console.log((s.match(/<section class="chapter">/g) || []).length);

console.log('\n---- nav#toc links (first 40) ----');
const nav = s.slice(s.indexOf('<nav id="toc"'), s.indexOf('</nav>', s.indexOf('<nav id="toc"')));
console.log('nav links:', (nav.match(/<a /g) || []).length);
console.log([...nav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).join(' ') || '(none)');

console.log('\n---- duplicate ids (repo-wide in this file) ----');
const counts = {};
for (const m of s.matchAll(/\bid="([^"]+)"/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
const dup = Object.entries(counts).filter(([, n]) => n > 1);
console.log(dup.length ? dup.map(([k, n]) => `${k}(${n})`).join(' ') : '(none)');
