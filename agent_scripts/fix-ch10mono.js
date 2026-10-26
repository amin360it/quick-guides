'use strict';
/*
 fix-ch10mono.js — repair the one duplication repair-dupblock.js cannot do
 generically, because a legitimate h4 (ch10-mono-changesets) sits between the
 duplicate and the last repeated code-opening line.

 Wrong (observed):
   ...</p><div class="codeWrap"><pre><code>// WHAT A CORRECT TOOL DOES, and the reasoning matters
   <h4 id="ch10-mono-changelogs">Per-package changelogs</h4><p>A monorepo changelog is useless. ...</p>
   <div class="codeWrap"><pre><code>// THE PROBLEM
   <h4 id="ch10-mono-changesets">Changeset flow for independent releases</h4><p>A changeset is ...</p>
   <div class="codeWrap"><pre><code>// WHAT A CORRECT TOOL DOES, and the reasoning matters
       <div class="codeWrap"><pre><code>// THE PROBLEM
      40 packages in one repository...

 Right:
   ...</p><h4 id="ch10-mono-changesets">Changeset flow for independent releases</h4><p>A changeset is ...</p>
   <div class="codeWrap"><pre><code>// THE PROBLEM
      40 packages in one repository...

   node fix-ch10mono.js [--write]
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILE = 'package-publishing.html';
const abs = path.join(ROOT, FILE);
const src = fs.readFileSync(abs, 'utf8');
const write = process.argv.includes('--write');

const M = '<div class="codeWrap"><pre><code>// WHAT A CORRECT TOOL DOES, and the reasoning matters';
const CHANGELOGS = '<h4 id="ch10-mono-changelogs">Per-package changelogs</h4><p>A monorepo changelog is useless. Generate per-package changelogs from the changesets, and keep a root CHANGELOG that only records changes to the public workspace API.</p>';
const THEPROBLEM = '<div class="codeWrap"><pre><code>// THE PROBLEM';

const JUNK1 = M + CHANGELOGS + THEPROBLEM;         // the first spurious run
const JUNK2 = M + '\n    ' + THEPROBLEM;           // the second spurious code-open

const c1 = src.split(JUNK1).length - 1;
const c2 = src.split(JUNK2).length - 1;
if (c1 !== 1 || c2 !== 1) { console.error('refuse: expected exactly one of each junk run, got ' + c1 + ' and ' + c2); process.exit(2); }

const n = (t, re) => (t.match(re) || []).length;
let out = src.replace(JUNK1, '').replace(JUNK2, THEPROBLEM);
const dup = (t) => {
  const c = new Map();
  for (const m of t.matchAll(/\sid="([^"]+)"/g)) c.set(m[1], (c.get(m[1]) || 0) + 1);
  return [...c.values()].filter((v) => v > 1).length;
};
console.log(FILE + ': h4 ' + n(src, /<h4[ >]/g) + ' -> ' + n(out, /<h4[ >]/g) + ' | code ' + n(src, /<div class="codeWrap">/g) + ' -> ' + n(out, /<div class="codeWrap">/g) + ' | dup ids ' + dup(src) + ' -> ' + dup(out) + ' | bytes ' + src.length + ' -> ' + out.length);
if (n(out, /<h4[ >]/g) !== n(src, /<h4[ >]/g) - 1) { console.error('refuse: h4 count should drop by exactly 1'); process.exit(3); }
if (n(out, /<div class="codeWrap">/g) !== n(src, /<div class="codeWrap">/g) - 3) { console.error('refuse: code count should drop by exactly 3'); process.exit(4); }
if (dup(out) !== 0) { console.error('refuse: duplicates remain'); process.exit(5); }
if (out.length >= src.length) { console.error('refuse: file did not shrink'); process.exit(6); }

if (!write) { console.log('(dry run)'); process.exit(0); }
const bak = path.join(ROOT, 'build', 'bak', 'dupblock');
fs.mkdirSync(bak, { recursive: true });
fs.writeFileSync(path.join(bak, 'package-publishing.pre-ch10mono.html'), src);
fs.writeFileSync(abs, out);
console.log('wrote ' + FILE);
