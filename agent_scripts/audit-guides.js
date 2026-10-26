'use strict';
/*
 audit-guides.js — run the check-guide checks over every guide and summarise.

   node audit-guides.js            (all guides)
   node audit-guides.js --verbose  (print every problem)
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\b/;
const verbose = process.argv.includes('--verbose');

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
const ct = (re, t) => (t.match(re) || []).length;

let clean = 0;
const failures = [];
for (const file of files) {
  const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const problems = [];
  const main = s.slice(s.indexOf('<main id="content">'), s.lastIndexOf('</main>'));
  if (s.indexOf('<main id="content">') < 0) problems.push('NO <main id="content">');
  if (s.lastIndexOf('</main>') < 0) problems.push('NO </main>');

  const h1 = ct(/<h1[ >]/g, s);
  const h2all = ct(/<h2[ >]/g, main);
  const h2toc = ct(/<h2 [^>]*data-toc/g, main);
  const h3all = ct(/<h3[ >]/g, main);
  const h3toc = ct(/<h3 [^>]*data-toc/g, main);
  const sec = ct(/<section class="chapter">/g, main);
  const secClose = ct(/<\/section>/g, main);
  const chToc = ct(/<div class="ch-toc">/g, main);
  const code = ct(/class="codeWrap"/g, main);

  if (h1 !== 1) problems.push('h1 count = ' + h1);
  if (h2all !== sec) problems.push('h2(' + h2all + ') != sections(' + sec + ')');
  if (sec !== secClose) problems.push('section open ' + sec + ' != close ' + secClose);
  if (h2all !== h2toc) problems.push((h2all - h2toc) + ' <h2> missing data-toc');
  if (h3all !== h3toc) problems.push((h3all - h3toc) + ' <h3> missing data-toc');
  if (chToc !== sec) problems.push('ch-toc ' + chToc + ' != sections ' + sec);
  if (ct(/<nav id="toc"/g, s) !== 1) problems.push('nav#toc count != 1');

  const malformed = (s.match(/<h([2-6])[^>]*>(?:(?!<\/h[2-6]>)[\s\S])*?<\/h([2-6])>/g) || []).filter((m) => {
    const a = m.match(/^<h([2-6])/)[1];
    const b = m.match(/<\/h([2-6])>$/)[1];
    return a !== b;
  });
  if (malformed.length) problems.push(malformed.length + ' headings closed by wrong tag');

  const ids = [...s.matchAll(/<([a-z0-9]+)[^>]*\sid="([^"]+)"/g)].map((m) => m[2]);
  const seen = new Map();
  for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
  const dups = [...seen.entries()].filter(([, n]) => n > 1);
  if (dups.length) problems.push('duplicate ids: ' + dups.slice(0, 6).map(([i, n]) => i + '(' + n + ')').join(', '));

  const dbl = ct(/&amp;(amp|lt|gt|quot|middot|nbsp|mdash);/g, s);
  if (dbl) problems.push(dbl + ' double-escaped entities');

  const nav = s.slice(s.indexOf('<nav id="toc"'), s.indexOf('</nav>', s.indexOf('<nav id="toc"')));
  const navTop = ct(/class="chapter open"/g, nav);
  if (navTop !== h2all) problems.push('sidebar chapters ' + navTop + ' != h2 ' + h2all);

  const band = (s.match(/<span class="am-band-s">([^<]*)<\/span>/) || [, ''])[1];
  const bn = band.match(/(\d+) chapters &middot; (\d+) topics &middot; (\d+) code samples/);
  if (!bn) problems.push('band count string missing');
  else {
    if (+bn[1] !== sec) problems.push('band chapters ' + bn[1] + ' != ' + sec);
    if (+bn[2] !== h2all + h3all) problems.push('band topics ' + bn[2] + ' != ' + (h2all + h3all));
    if (+bn[3] !== code) problems.push('band code ' + bn[3] + ' != ' + code);
  }

  const title = (s.match(/<title>([^<]*)<\/title>/) || [, ''])[1];
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
  if (!title) problems.push('no <title>');
  if (desc.length < 140 || desc.length > 160) problems.push('description length ' + desc.length);

  if (problems.length) failures.push({ file, problems });
  else clean++;
}

console.log('guides scanned: ' + files.length + ' | clean: ' + clean + ' | with problems: ' + failures.length);
for (const f of failures) {
  console.log('\n' + f.file);
  for (const p of f.problems) console.log('  - ' + p);
  if (!verbose && f.problems.length > 4) console.log('  (… run with --verbose for all)');
}
process.exit(failures.length ? 1 : 0);
