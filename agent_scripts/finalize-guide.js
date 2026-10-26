'use strict';
/*
 finalize-guide.js — give a guide a canonical SEO <head> and rebuild the
 mechanical parts of its body from its headings.

   node finalize-guide.js <file.html> [--write]
   node finalize-guide.js <file.html> --fragment build/newguides/<key>.main.html [--write]

 What it does:
   1. (optional) replaces everything between <main id="content"> and </main>
      with the band + the fragment's <section class="chapter"> blocks.
   2. replaces the whole <head> with the canonical SEO head from guides-meta.js.
   3. rebuilds the sidebar <nav id="toc"> and every chapter's <div class="ch-toc">.
   4. recomputes the "N chapters &middot; M topics &middot; K code samples" band.

 It is idempotent. Dry-run unless --write.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://amin360it.github.io/quick-guides';
const ARROW = '\u25B8';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const write = args.includes('--write');
const fragIdx = args.indexOf('--fragment');
const fragPath = fragIdx >= 0 ? args[fragIdx + 1] : null;

if (!file) {
  console.log('Usage: node finalize-guide.js <file.html> [--fragment <frag.html>] [--write]');
  process.exit(1);
}

const noHead = args.includes('--no-head');
const META = require('./guides-meta.js');
const meta = META[file];
// The head is only rebuilt when we have metadata; --no-head rebuilds the body
// (nav, ch-toc, band) of an existing guide whose head is already correct.
if (!meta && (!noHead || fragPath)) {
  console.error('No metadata for ' + file + ' in guides-meta.js');
  process.exit(2);
}

const abs = path.join(ROOT, file);
let s = fs.readFileSync(abs, 'utf8');
const before = s;

// ---------- helpers ----------
const esc = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = (h) => h.replace(/<[^>]+>/g, '').trim();

// ---------- head ----------
function buildHead(src) {
  const title = meta.browserTitle;
  const desc = meta.description;
  const url = `${SITE}/${file}`;
  const hero = `${SITE}/assets/brand/hero.jpg`;
  // hasPart / wordCount / keywords derived from the finished body
  const mainHtml = src.slice(src.indexOf('<main id="content">'), src.lastIndexOf('</main>'));
  const hasPart = [];
  const chRe = /<h2 id="([^"]+)"[^>]*data-toc[^>]*>([\s\S]*?)<\/h2>/g;
  let cm;
  while ((cm = chRe.exec(mainHtml))) {
    hasPart.push({ '@type': 'WebPageElement', name: stripTags(cm[2]), url: `${url}#${cm[1]}` });
  }
  const plain = mainHtml.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
  const wordCount = (plain.match(/\S+/g) || []).length;
  const keywords = [meta.subject, meta.catName].filter(Boolean);
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        headline: title,
        name: title,
        description: desc,
        inLanguage: 'en',
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: hero,
        author: { '@type': 'Organization', name: 'Amin360iT', url: SITE },
        publisher: {
          '@type': 'Organization',
          name: 'Amin360iT',
          url: SITE,
          logo: { '@type': 'ImageObject', url: `${SITE}/assets/brand/logo.png` },
        },
        datePublished: '2026-01-01',
        dateModified: '2026-10-14',
        articleSection: meta.catName,
        keywords,
        wordCount,
        proficiencyLevel: 'Beginner',
        isAccessibleForFree: true,
        hasPart,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/index.html` },
          { '@type': 'ListItem', position: 2, name: meta.catName, item: `${SITE}/index.html#cat-${meta.catId}` },
          { '@type': 'ListItem', position: 3, name: title, item: url },
        ],
      },
    ],
  };
  const icon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%2303122f'/%3E%3Cpath d='M16 6 L26 26 H21.6 L19.4 21.4 H12.6 L10.4 26 H6 Z M14.2 17.6 H17.8 L16 13.8 Z' fill='%2300d1ff'/%3E%3C/svg%3E";
  const lines = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">',
    '<meta name="author" content="Amin360iT">',
    '<meta name="theme-color" content="#03122f" media="(prefers-color-scheme: dark)">',
    '<meta name="theme-color" content="#f4f8fd" media="(prefers-color-scheme: light)">',
    `<link rel="icon" href="${icon}">`,
    `<link rel="apple-touch-icon" href="${icon}">`,
    '<link rel="manifest" href="manifest.json">',
    '<meta property="og:type" content="article">',
    '<meta property="og:site_name" content="Amin360iT Quick Guides">',
    '<meta property="og:locale" content="en_US">',
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${hero}">`,
    '<meta property="og:image:width" content="1500">',
    '<meta property="og:image:height" content="844">',
    '<meta property="og:image:alt" content="Amin360iT Quick Guides - Software, Web &amp; Digital Solutions">',
    '<meta property="article:published_time" content="2026-01-01">',
    '<meta property="article:modified_time" content="2026-10-14">',
    `<meta property="article:section" content="${esc(meta.catName)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:site" content="@amin360it">',
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${hero}">`,
    `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    '<link rel="stylesheet" href="assets/shell.css">',
    '<script>',
    '/* Resolve the theme and colour mode before first paint, so neither flashes. */',
    '',
    "(function(){try{var r=document.documentElement,s=localStorage.getItem('amin360it-theme'),d=(s==='dark'||s==='light')?s:'dark',m=localStorage.getItem('amin360it-mode');r.setAttribute('data-theme',d);r.setAttribute('data-mode',m||'default');}catch(e){}})();",
    '</script></head>',
  ];
  return '<head>\n' + lines.join('\n');
}

function replaceHead(src) {
  const hStart = src.indexOf('<head>');
  const hEnd = src.indexOf('</head>');
  if (hStart < 0 || hEnd < 0) throw new Error('no <head>');
  return src.slice(0, hStart) + buildHead(src) + src.slice(hEnd + '</head>'.length);
}

// ---------- main splice ----------
// Split a fragment into one <section class="chapter"> per <h2>, regardless of
// how the author wrapped (or failed to wrap) the chapters.
function normalizeChapters(frag) {
  let x = frag.replace(/<section class="chapter"[^>]*>/g, '\n').replace(/<\/section>/g, '\n');
  const parts = x.split(/(?=<h2\b)/);
  const out = [];
  for (const p of parts) {
    if (!/<h2\b/.test(p)) continue; // drop any preamble
    out.push('<section class="chapter">\n' + p.trim() + '\n</section>');
  }
  if (!out.length) throw new Error('fragment has no <h2> chapters');
  return out.join('\n');
}

function spliceMain(src, frag) {
  const mStart = src.indexOf('<main id="content">');
  const mEnd = src.lastIndexOf('</main>');
  if (mStart < 0 || mEnd < 0) throw new Error('no <main id="content">');
  const body = normalizeChapters(frag);
  const counts = countAll(body);
  const band =
    '  <h1 class="am-band">\n' +
    `    <span class="am-band-t">${esc(meta.subject)}</span>\n` +
    `    <span class="am-band-s">${counts.chapters} chapters &middot; ${counts.topics} topics &middot; ${counts.code} code samples &middot; works offline</span>\n` +
    '  </h1>\n';
  return (
    src.slice(0, mStart) +
    '<main id="content">\n' +
    band +
    body +
    '\n</main>' +
    src.slice(mEnd + '</main>'.length)
  );
}

function countAll(main) {
  // "topics" is the library-wide convention: h2 + h3 headings carrying
  // data-toc. Older guides also tag some h4 with data-toc; those are
  // vestigial (never listed in the sidebar) and must NOT be counted here,
  // or the band drifts from stats.js / check-guide.js.
  const sections = main.match(/<section class="chapter">/g) || [];
  const topics = main.match(/<h[23][^>]*\bdata-toc\b/g) || [];
  const code = main.match(/class="codeWrap"/g) || [];
  return { chapters: sections.length, topics: topics.length, code: code.length };
}

// ---------- TOC regen ----------
function regen(src) {
  const mStart = src.indexOf('<main id="content">');
  const mEnd = src.lastIndexOf('</main>');
  if (mStart < 0 || mEnd < 0) throw new Error('no <main>');
  const main = src.slice(mStart, mEnd);

  const chapterRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
  const chapters = [];
  let m;
  while ((m = chapterRe.exec(main))) chapters.push(m[1]);
  if (!chapters.length) throw new Error(file + ': no <section class="chapter">');

  const navUl = [];
  const chTocs = [];
  for (const ch of chapters) {
    const h2 = /<h2 id="([^"]+)"[^>]*data-toc[^>]*>([\s\S]*?)<\/h2>/.exec(ch);
    if (!h2) throw new Error(file + ': chapter without h2[data-toc]');
    const id = h2[1];
    const name = stripTags(h2[2]);
    const h3s = [...ch.matchAll(/<h3 id="([^"]+)"[^>]*data-toc[^>]*>([\s\S]*?)<\/h3>/g)].map((x) => ({
      id: x[1],
      text: stripTags(x[2]),
    }));

    navUl.push(
      '<li class="chapter open"><span class="arrow">' + ARROW + '</span><a href="#' + id + '" data-target="' + id + '">' + name + '</a><ul>\n' +
        h3s.map((h) => '<li><a href="#' + h.id + '" data-target="' + h.id + '">' + h.text + '</a></li>').join('\n') +
        '\n</ul></li>'
    );
    chTocs.push(
      h3s.length
        ? '<div class="ch-toc"><button type="button" class="ch-toc-head" aria-expanded="true"><span class="arrow">' + ARROW + '</span>Contents &middot; ' + name + '</button><div class="ch-toc-list">' +
            h3s.map((h) => '<a href="#' + h.id + '">' + h.text + '</a>').join('') +
            '</div></div>'
        : ''
    );
  }

  // sidebar
  const newNav = '<nav id="toc" aria-label="Table of contents"><ul>\n' + navUl.join('\n') + '\n</ul></nav>';
  src = src.replace(/<nav id="toc"[^>]*>[\s\S]*?<\/nav>/, newNav);

  // per-chapter ch-toc: replace an existing block, or insert after the h2
  let i = 0;
  src = src.replace(
    /(<h2 id="[^"]+"[^>]*data-toc[^>]*>[\s\S]*?<\/h2>)\s*(?:<div class="ch-toc">[\s\S]*?<\/div><\/div>)?/g,
    (whole, h2html) => {
      if (i >= chTocs.length) return whole;
      return h2html + '\n' + chTocs[i++];
    }
  );
  if (i !== chapters.length) throw new Error(file + ': ch-toc count mismatch (' + i + ' vs ' + chapters.length + ')');

  // counts
  const c = countAll(src.slice(src.indexOf('<main id="content">'), src.lastIndexOf('</main>')));
  src = src.replace(
    /(\d+) chapters &middot; (\d+) topics &middot; (\d+) code samples/g,
    c.chapters + ' chapters &middot; ' + c.topics + ' topics &middot; ' + c.code + ' code samples'
  );
  src = src.replace(
    /(\d+) chapters,\s*(\d+) topics and (\d+) code samples/g,
    c.chapters + ' chapters, ' + c.topics + ' topics and ' + c.code + ' code samples'
  );
  return src;
}

// ---------- run ----------
let out = s;
if (fragPath) {
  const frag = fs.readFileSync(path.isAbsolute(fragPath) ? fragPath : path.join(ROOT, fragPath), 'utf8');
  out = spliceMain(out, frag);
}
if (!noHead) out = replaceHead(out);
out = regen(out);

const counts = countAll(out.slice(out.indexOf('<main id="content">'), out.lastIndexOf('</main>')));
console.log(
  file +
    ' -> ' +
    counts.chapters +
    ' chapters, ' +
    counts.topics +
    ' topics, ' +
    counts.code +
    ' code' +
    (out === before ? ' (unchanged)' : ' (changed)')
);
if (write) fs.writeFileSync(abs, out);
