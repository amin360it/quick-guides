'use strict';
/* regentoc.js
   Rebuilds the three mechanical parts of a guide from its headings:
     1. the sidebar <nav id="toc"> menu
     2. every chapter's <div class="ch-toc"> contents block
     3. the "N chapters &middot; M topics &middot; K code samples" count strings
        (meta description, og:description, twitter:description, JSON-LD
         description, and the h1 band subtitle)
   The headings themselves are authored by hand; this script mirrors them.
   Usage: node regentoc.js <file...> | --all   (dry-run by default; --write applies)
*/

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const doWrite = process.argv.includes('--write');
const all = process.argv.includes('--all');

function plain(html) {
  return html.replace(/<[^>]+>/g, '');
}

const ARROW = '\u25B8';

function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function regen(file) {
  const p = path.isAbsolute(file) ? file : path.join(ROOT, file);
  let s = fs.readFileSync(p, 'utf8');

  const mainStart = s.indexOf('<main id="content">');
  const mainEnd = s.indexOf('</main>');
  if (mainStart < 0 || mainEnd < 0) throw new Error(file + ': no <main>');
  const main = s.slice(mainStart, mainEnd);

  // ---- collect chapters and their h2/h3 headings ----
  const chapterRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
  const chapters = [];
  let m;
  while ((m = chapterRe.exec(main))) chapters.push(m[1]);
  if (!chapters.length) throw new Error(file + ': no chapters');

  const navUl = [];
  const perChapter = [];
  const tocLinks = [];
  for (const ch of chapters) {
    const h2 = /<h2 id="([^"]+)"[^>]*data-toc[^>]*>([\s\S]*?)<\/h2>/.exec(ch);
    if (!h2) throw new Error(file + ': chapter without h2[data-toc]');
    const [, id, h2Text] = h2;
    const h3s = [...ch.matchAll(/<h3 id="([^"]+)"[^>]*data-toc[^>]*>([\s\S]*?)<\/h3>/g)].map((x) => ({ id: x[1], text: x[2] }));
    const name = plain(h2Text).trim();
    tocLinks.push(name);

    navUl.push(
      '<li class="chapter open"><span class="arrow">' + ARROW + '</span><a href="#' + escAttr(id) + '" data-target="' + escAttr(id) + '">' + name + '</a><ul>\n' +
      h3s.map((h) => '<li><a href="#' + escAttr(h.id) + '" data-target="' + escAttr(h.id) + '">' + plain(h.text).trim() + '</a></li>').join('\n') +
      '\n</ul></li>'
    );

    perChapter.push({
      id,
      toc:
        '<div class="ch-toc"><button type="button" class="ch-toc-head" aria-expanded="true"><span class="arrow">' + ARROW + '</span>Contents &middot; ' + name + '</button><div class="ch-toc-list">' +
        h3s.map((h) => '<a href="#' + escAttr(h.id) + '">' + plain(h.text).trim() + '</a>').join('') +
        '</div></div>'
    });
  }

  // ---- rebuild the sidebar ----
  const newNav = '<nav id="toc" aria-label="Table of contents"><ul>\n' + navUl.join('\n') + '\n</ul></nav>';
  s = s.replace(/<nav id="toc"[^>]*>[\s\S]*?<\/nav>/, newNav);

  // ---- rebuild each chapter's ch-toc ----
  const chTocRe = /(<h2 id="[^"]+"[^>]*data-toc[^>]*>[\s\S]*?<\/h2>)(\s*)<div class="ch-toc">[\s\S]*?<\/div><\/div>/g;
  let i = 0;
  s = s.replace(chTocRe, function (whole, h2html, ws) {
    return h2html + ws + perChapter[i++].toc;
  });
  if (i !== chapters.length) throw new Error(file + ': ch-toc replacement count mismatch (' + i + ' vs ' + chapters.length + ')');

  // ---- counts ----
  const chapterCount = chapters.length;
  const topicCount = (main.match(/data-toc/g) || []).length;
  const codeCount = (main.match(/<div class="codeWrap"><pre><code>/g) || []).length;

  s = s.replace(
    /(\d+) chapters &middot; (\d+) topics &middot; (\d+) code samples/g,
    chapterCount + ' chapters &middot; ' + topicCount + ' topics &middot; ' + codeCount + ' code samples'
  );
  s = s.replace(
    /(\d+) chapters,\s*(\d+) topics and (\d+) code samples/g,
    chapterCount + ' chapters, ' + topicCount + ' topics and ' + codeCount + ' code samples'
  );

  return s;
}

let targets = files;
if (all) {
  targets = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
}
if (!targets.length) {
  console.log('Usage: node regentoc.js <file.html ...> | --all   [--write]');
  process.exit(0);
}

for (const t of targets) {
  const p = path.isAbsolute(t) ? t : path.join(ROOT, t);
  const before = fs.readFileSync(p, 'utf8');
  const after = regen(t);
  const ok = before === after ? '' : ' (changed)';
  console.log(t + ok);
  if (doWrite && before !== after) {
    fs.writeFileSync(p, after);
  }
}