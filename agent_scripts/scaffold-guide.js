'use strict';
/*
 scaffold-guide.js — create the shell of a brand-new guide page and register its
 metadata, so finalize-guide.js can then fill in the head, body, nav and band.

   node scaffold-guide.js build/newguides/<key>.meta.json [--force]

 The meta JSON:
   {
     "key": "microservices",
     "file": "microservices.html",          (optional; defaults to <key>.html)
     "subject": "Microservices",
     "browserTitle": "Microservices - Scalable System Design Guide",
     "catId": "architecture",
     "catName": "Architecture & Design",
     "description": "...148-156 chars...",
     "template": "nodejs.html"              (optional)
   }

 What it does:
   1. copies the template guide to <file>, replacing the header `logo-page`
      text and the footer `<strong>` subject;
   2. inserts the metadata entry into agent_scripts/guides-meta.js (idempotent);
 It refuses to overwrite an existing guide unless --force, and asserts the
 template markers were actually found before writing anything.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const metaFile = args.find((a) => !a.startsWith('--'));
const force = args.includes('--force');
if (!metaFile) { console.log('usage: node scaffold-guide.js <meta.json> [--force]'); process.exit(1); }

const meta = JSON.parse(fs.readFileSync(path.resolve(ROOT, metaFile), 'utf8'));
const key = meta.key;
const file = meta.file || key + '.html';
const template = meta.template || 'nodejs.html';
const absOut = path.join(ROOT, file);

if (fs.existsSync(absOut) && !force) {
  console.error('refuse: ' + file + ' already exists (use --force to overwrite)');
  process.exit(2);
}

// ---- 1. page shell from the template -------------------------------------
const tpl = fs.readFileSync(path.join(ROOT, template), 'utf8');
const logoRe = /<span class="logo-page">[^<]*<\/span>/;
const footRe = /<footer>\s*<div class="foot-inner">\s*<p><strong>[^<]*<\/strong>/;
if (!logoRe.test(tpl)) { console.error('refuse: template has no logo-page span'); process.exit(3); }
if (!footRe.test(tpl)) { console.error('refuse: template has no footer strong'); process.exit(3); }

let page = tpl
  .replace(logoRe, '<span class="logo-page">' + esc(meta.subject) + '</span>')
  .replace(footRe, '<footer>\n  <div class="foot-inner">\n    <p><strong>' + esc(meta.subject) + '.</strong>');
fs.writeFileSync(absOut, page);

// ---- 2. register metadata in guides-meta.js ------------------------------
const metaPath = path.join(__dirname, 'guides-meta.js');
let src = fs.readFileSync(metaPath, 'utf8');
const keyLiteral = "'" + file + "':";
if (!src.includes(keyLiteral)) {
  const entryLines = [
    "  '" + file + "': {",
    '    browserTitle: ' + js(meta.browserTitle) + ',',
    '    subject: ' + js(meta.subject) + ',',
    '    catId: ' + js(meta.catId) + ',',
    '    catName: ' + js(meta.catName) + ',',
    '    description:',
    '      ' + js(meta.description) + ',',
    '  },',
    '',
  ].join('\n');
  const end = src.lastIndexOf('};');
  if (end < 0) { console.error('refuse: guides-meta.js has no closing };'); process.exit(4); }
  src = src.slice(0, end) + entryLines + src.slice(end);
  fs.writeFileSync(metaPath, src);
  console.log('registered metadata for ' + file + ' in guides-meta.js');
} else {
  console.log('metadata for ' + file + ' already present');
}

console.log('created ' + file + ' from ' + template + ' (' + Buffer.byteLength(page) + ' bytes)');
console.log('next: node finalize-guide.js ' + file + ' --fragment build/newguides/' + key + '.main.html --write');

function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function js(t) { return "'" + String(t).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"; }
