'use strict';
/* verify-guide.js <file...>
   Structural + escaping checks for a guide after content expansion/regen:
     1. exactly one <h1>, one <main id="content">, balanced chapters
     2. unique h2/h3 ids; every h2/h3[data-toc] listed in sidebar + ch-toc
     3. code blocks: no raw < > & (must be entities), no double-escaping,
        no duplicated whole-sample copies (the AGENTS.md repeats invariant)
     4. JSON-LD parses; band/description counts match headings
   Exits non-zero on any failure. */
const fs = require('fs');

function plain(h) { return h.replace(/<[^>]+>/g, '').trim(); }

function check(file) {
  const s = fs.readFileSync(file, 'utf8');
  const fails = [];
  const ok = (c, msg) => { if (!c) fails.push(msg); };

  ok((s.match(/<h1[ >]/g) || []).length === 1, 'must have exactly one <h1> (has ' + (s.match(/<h1[ >]/g) || []).length + ')');
  ok((s.match(/<main id="content">/g) || []).length === 1, 'main id=content opened once');
  ok((s.match(/<\/main>/g) || []).length === 1, 'main closed once');
  const chOpen = (s.match(/<section class="chapter">/g) || []).length;
  const chClose = (s.match(/<\/section>/g) || []).length;
  ok(chOpen === chClose && chOpen > 0, 'balanced chapter sections (' + chOpen + ' open, ' + chClose + ' close)');

  // unique ids on h2/h3
  const ids = [...s.matchAll(/<h[23] id="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) { ok(!seen.has(id), 'duplicate heading id: ' + id); seen.add(id); }

  // sidebar mirrors headings
  const mainStart = s.indexOf('<main id="content">');
  const mainEnd = s.indexOf('</main>');
  const main = s.slice(mainStart, mainEnd);
  const headings = [...main.matchAll(/<h[23] id="([^"]+)"[^>]*data-toc[^>]*>([\s\S]*?)<\/h[23]>/g)]
    .map((m) => ({ id: m[1], text: plain(m[2]) }));
  const sidebarStart = s.indexOf('<nav id="toc"');
  const sidebarEnd = s.indexOf('</nav>', sidebarStart);
  const sidebar = s.slice(sidebarStart, sidebarEnd);
  for (const h of headings) {
    ok(sidebar.includes('href="#' + h.id + '"'), 'sidebar missing heading: ' + h.id);
    ok(sidebar.includes(plain(h.text)), 'sidebar text mismatch for: ' + h.id + ' (' + h.text + ')');
  }
  // every sidebar link resolves to a heading id
  for (const m of sidebar.matchAll(/href="#([^"]+)"/g)) {
    ok(seen.has(m[1]), 'sidebar link has no heading: #' + m[1]);
  }

  // ch-toc lists mirror h3s
  const chTocs = [...s.matchAll(/<div class="ch-toc-list">([\s\S]*?)<\/div><\/div>/g)];
  const chRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
  let mc, ci = 0;
  const h3ids = [...main.matchAll(/<h3 id="([^"]+)"[^>]*data-toc/g)].map((m) => m[1]);
  ok(chTocs.length === chOpen, 'ch-toc count matches chapter count');
  for (const h3id of h3ids) {
    const inToc = chTocs.some((ct) => ct[1].includes('href="#' + h3id + '"'));
    ok(inToc, 'h3 not listed in its chapter ch-toc: ' + h3id);
  }

  // code blocks: escaping
  const blockRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
  let mb, bcount = 0;
  const blocks = [];
  while ((mb = blockRe.exec(s))) { blocks.push(mb[1]); bcount++; }
  for (let i = 0; i < blocks.length; i++) {
    const raw = blocks[i];
    if (/</.test(raw)) fails.push('code block ' + i + ' contains raw < (must be &lt;): ' + raw.slice(raw.indexOf('<') - 30, raw.indexOf('<') + 30).replace(/\s+/g, ' '));
    // bare & that is not part of an entity
    const badAmp = raw.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;|#x[\da-fA-F]+;)/);
    if (badAmp) fails.push('code block ' + i + ' has bare & near: ' + raw.slice(Math.max(0, badAmp.index - 20), badAmp.index + 20).replace(/\s+/g, ' '));
    // double-escaping: &amp;amp; &amp;lt; &amp;gt; are always errors
    if (/&amp;(amp|lt|gt|quot);/.test(raw)) fails.push('code block ' + i + ' double-escaped entity');
    // repeats invariant: a block must not contain a second copy of its opening text
    const t = raw.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
    const probe = t.slice(0, 200);
    if (probe.length > 40) {
      const idx = t.indexOf(probe, 1);
      if (idx > 0 && idx + probe.length <= t.length) fails.push('code block ' + i + ' contains a duplicated copy of itself (repeats)');
    }
  }

  // JSON-LD parses and has valid description
  const ldRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let ml, lcount = 0;
  while ((ml = ldRe.exec(s))) { lcount++; try { JSON.parse(ml[1]); } catch (e) { fails.push('JSON-LD invalid: ' + e.message); } }
  ok(lcount >= 1, 'has at least one JSON-LD block');

  // counts match
  const chapters = chOpen;
  const topics = (main.match(/data-toc/g) || []).length;
  const codeCount = bcount;
  const bandRe = /<span class="am-band-s">(\d+) chapters &middot; (\d+) topics &middot; (\d+) code samples/;
  const bm = bandRe.exec(s);
  if (bm) {
    if (+bm[1] !== chapters || +bm[2] !== topics || +bm[3] !== codeCount) {
      fails.push('band counts mismatch: stated ' + bm[1] + '/' + bm[2] + '/' + bm[3] + ' vs computed ' + chapters + '/' + topics + '/' + codeCount);
    }
  }
  const descRe = /<meta name="description" content="[^"]*?(\d+) chapters,\s*(\d+) topics and (\d+) code samples/;
  const dm = descRe.exec(s);
  if (dm && (+dm[1] !== chapters || +dm[2] !== topics || +dm[3] !== codeCount)) {
    fails.push('description counts mismatch: stated ' + dm[1] + '/' + dm[2] + '/' + dm[3] + ' vs computed');
  }

  return { fails, bcount };
}

let any = false;
for (const f of process.argv.slice(2)) {
  const r = check(f);
  if (r.fails.length) {
    any = true;
    console.log('== ' + f + ' (' + r.bcount + ' code blocks)');
    for (const x of r.fails) console.log('   FAIL: ' + x);
  } else {
    console.log(f + ': OK (' + r.bcount + ' code blocks)');
  }
}
process.exit(any ? 1 : 0);