// Repair vue-nuxt-capacitor.html.
//
// Damage: chapters 1-6 exist twice. The second copy (ids suffixed "-u1") is
// corrupt -- it carries `NaN` artifacts, cross-guide headings leaked from other
// guides (or-1-*, app-1-*, ch4-1-*, ch5-1-*, ch6-1-*, ch7-1-*, ch2-1-*), generic
// filler paragraphs, and six `<section class="chapter">` openers whose `<section `
// was stripped (leaving `class="chapter">`). The nav references canonical ids
// (`ch1`, `ch1-spa`, ...) which no element has.
//
// Repair: keep the clean copy (chapters 1-13 + appendix, ids suffixed "-fix1"
// for ch1-6), keep the single orientation chapter, drop the corrupt copy, strip
// the leaked filler, normalise ids back to canonical, and re-wrap every chapter.
// Asserts its own effect and refuses to write on any mismatch. Dry-run unless --write.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'vue-nuxt-capacitor.html');
const WRITE = process.argv.includes('--write');

const src = fs.readFileSync(FILE, 'utf8');
const A = src.indexOf('  <section class="chapter">\n<h2 id="ch6-fix1-u1"');
const B = src.indexOf('<h2 id="orientation"');
const C = src.indexOf('  <section class="chapter">\n<h2 id="ch1-fix1"');
const D = src.lastIndexOf('</main>');
if (A < 0 || B < 0 || C < 0 || D < 0 || !(A < B && B < C && C < D)) {
  console.error(`anchors bad: A=${A} B=${B} C=${C} D=${D}`);
  process.exit(2);
}

let s = src.slice(0, A) + '<section class="chapter">\n' + src.slice(B, D) + src.slice(D);

// 1. strip leaked "Core Concept" / "Practical Application" filler headings + prose
s = s.replace(/\s*<h4 id="or-\d-\d-concept">Core Concept<\/h4>/g, '');
s = s.replace(/\s*<h4 id="or-\d-\d-application">Practical Application<\/h4>/g, '');
s = s.replace(/\s*<p>This section introduces the core concept covered in this orientation topic[\s\S]*?<\/p>/g, '');
s = s.replace(/\s*<p>This concept can be applied to real-world scenarios[\s\S]*?<\/p>/g, '');

// 2. normalise ids: strip the "-fix1" dedupe suffix from ch1-6 headings
s = s.replace(/id="(ch[1-6][^"]*?)-fix1"/g, 'id="$1"');

// ---- assertions ----
const fail = [];
const count = (re) => (s.match(re) || []).length;
if (count(/<section class="chapter">/g) !== 15) fail.push('sections != 15');
if (count(/<h2[ >]/g) !== 15) fail.push('h2 != 15');
if (count(/<h3[ >]/g) !== 83) fail.push('h3 != 83');
if (count(/<section class="chapter">\s*<h2/g) !== 15) fail.push('not every section opens with h2');
if (count(/class="chapter">/g) !== count(/<section class="chapter">/g)) fail.push('orphan class="chapter"');
if (/NaN/.test(s)) fail.push('NaN remains');
if (/-fix1/.test(s)) fail.push('-fix1 remains');
if (/id="(or|app)-1-/.test(s)) fail.push('leaked or-/app- ids remain');
if (/id="ch\d-1-\d/.test(s)) fail.push('leaked chN-1-x ids remain');
if (count(/<h4[ >]/g) === 0) fail.push('no h4 at all');
const mOpen = count(/<main id="content">/g);
const mClose = count(/<\/main>/g);
if (mOpen !== 1 || mClose !== 1) fail.push(`main open/close ${mOpen}/${mClose}`);

console.log(`size ${src.length} -> ${s.length}`);
console.log(
  `sections=${count(/<section class="chapter">/g)} h2=${count(/<h2[ >]/g)} h3=${count(/<h3[ >]/g)} h4=${count(/<h4[ >]/g)} code=${count(/class="codeWrap"/g)}`
);
if (fail.length) {
  console.error('REFUSING TO WRITE:\n - ' + fail.join('\n - '));
  process.exit(3);
}

if (WRITE) {
  fs.mkdirSync(path.join(ROOT, 'build', 'bak', 'vnc'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'build', 'bak', 'vnc', 'vue-nuxt-capacitor.html'), src);
  fs.writeFileSync(FILE, s);
  console.log('written (backup in build/bak/vnc/)');
} else console.log('dry run — pass --write to apply');
