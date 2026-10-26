const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };

// 1. ends with </html>, no stray text
ok(s.trimEnd().endsWith('</html>'), 'file ends </html> (tail: ' + JSON.stringify(s.trimEnd().slice(-20)) + ')');

// 2. dup ids (real elements only, outside code samples is fine to include — check both)
const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupAll = ids.filter((v, i) => ids.indexOf(v) !== i);
ok(dupAll.length === 0, 'no duplicate ids' + (dupAll.length ? ': ' + [...new Set(dupAll)].join(',') : ''));

// 3. chapter count vs band
const sections = (s.match(/<section class="chapter">/g) || []).length;
const band = s.match(/am-band-s">(\d+) chapters &middot; (\d+) topics &middot; (\d+) code samples/);
ok(!!band, 'band parsed');
if (band) {
  ok(+band[1] === sections, `band chapters ${band[1]} === sections ${sections}`);
  const tocCount = (s.match(/data-toc/g) || []).length - (s.match(/<nav id="toc"/g) || []).length; // nav has data-target not data-toc
  const dataTocMain = (() => { const m = s.slice(s.indexOf('<main id="content">'), s.indexOf('</main>')); return (m.match(/data-toc/g) || []).length; })();
  ok(+band[2] === dataTocMain, `band topics ${band[2]} === main data-toc ${dataTocMain}`);
  const codeN = (s.match(/class="codeWrap"/g) || []).length;
  ok(+band[3] === codeN, `band code ${band[3]} === codeWrap ${codeN}`);
}

// 4. every h3[data-toc] in sidebar + chapter ch-toc-list
const main = s.slice(s.indexOf('<main id="content">'), s.indexOf('</main>'));
const nav = s.slice(s.indexOf('<nav id="toc"'), s.indexOf('</nav>'));
const h3s = [...main.matchAll(/<h3 id="([^"]+)" data-toc>/g)].map(m => m[1]);
const missingNav = h3s.filter(id => !nav.includes('href="#' + id + '"'));
ok(missingNav.length === 0, 'all ' + h3s.length + ' h3 in sidebar' + (missingNav.length ? ' missing: ' + missingNav.join(',') : ''));
// ch-toc-list: each h3 must appear in its chapter's ch-toc (the chapter containing it)
const chapRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
let chM, tocMiss = [];
while ((chM = chapRe.exec(main))) {
  const block = chM[1];
  const ct = block.indexOf('ch-toc-list');
  if (ct < 0) continue;
  const list = block.slice(0, block.indexOf('</div>', block.indexOf('</div>', ct) + 6) + 6); // rough
  for (const h of block.matchAll(/<h3 id="([^"]+)" data-toc>/g)) {
    if (!block.slice(ct).includes('href="#' + h[1] + '"')) tocMiss.push(h[1]);
  }
}
ok(tocMiss.length === 0, 'all h3 in their chapter ch-toc-list' + (tocMiss.length ? ' missing: ' + tocMiss.join(',') : ''));
// h2 in sidebar
const h2s = [...main.matchAll(/<h2 id="([^"]+)" data-toc>/g)].map(m => m[1]);
const h2Miss = h2s.filter(id => !nav.includes('href="#' + id + '"'));
ok(h2Miss.length === 0, 'all ' + h2s.length + ' h2 in sidebar' + (h2Miss.length ? ' missing: ' + h2Miss.join(',') : ''));

// 5. descriptions length
for (const [label, pat] of [['meta', /name="description" content="([^"]*)"/], ['og', /property="og:description" content="([^"]*)"/], ['tw', /name="twitter:description" content="([^"]*)"/]]) {
  const m = s.match(pat);
  ok(!!m && m[1].length >= 148 && m[1].length <= 156, `${label} description length ${m ? m[1].length : 'N/A'} (148-156)`);
}
// all four descriptions identical
const descs = [...s.matchAll(/"description":"?([^"]*)"?/g)];
const d1 = s.match(/name="description" content="([^"]*)"/)[1];
const ogSame = s.includes('property="og:description" content="' + d1 + '"');
const twSame = s.includes('name="twitter:description" content="' + d1 + '"');
const jlMatch = s.match(/\\"description\\":\\"([^"]*)\\"/) || s.match(/"description":"(React 19[^"]*)"/);
ok(ogSame && twSame && !!jlMatch && jlMatch[1] === d1, 'all descriptions identical');

// 6. JSON-LD hasPart entries ch11-ch19
const hp = s.slice(s.indexOf('"hasPart"'), s.indexOf(']', s.indexOf('"hasPart"')) + 4000);
for (let n = 11; n <= 19; n++) ok(s.includes('react.html#ch' + n + '"'), 'hasPart #ch' + n);
// JSON-LD valid
const ld = s.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let ldOk = false, parts = 0;
try { const j = JSON.parse(ld[1]); ldOk = true; const g = j['@graph'] || [j]; const art = g.find(x => x['@type'] === 'TechArticle'); parts = art && art.hasPart ? art.hasPart.length : 0; } catch (e) { console.log('JSON parse error', e.message); }
ok(ldOk, 'JSON-LD parses');
ok(parts === 21, 'hasPart entries = 21 (orientation + 20 chapters), got ' + parts);
// wordCount present
ok(/"wordCount":\d+/.test(s), 'wordCount present: ' + (s.match(/"wordCount":(\d+)/) || [])[1]);

// 7. title unchanged, h1 single
ok((s.match(/<h1/g) || []).length === 1, 'exactly one h1');
ok(s.includes('<title>React 19'), 'title unchanged: ' + (s.match(/<title>([^<]*)<\/title>/) || [])[1]);

// 8. ch15/ch16 pinned ids
ok(main.includes('id="ch15"') && /Data Fetching/.test(s.match(/id="ch15"[^>]*>([^<]*)/)[1]), 'ch15 id: ' + s.match(/id="ch15"[^>]*>([^<]*)/)[1]);
ok(main.includes('id="ch16"'), 'ch16 id: ' + s.match(/id="ch16"[^>]*>([^<]*)/)[1]);

// 9. callout classes only tip/warn/note/ex
const classes = new Set([...s.matchAll(/<div class="([a-z-]+)"/g)].map(m => m[1]));
console.log('div classes:', [...classes].join(', '));

// 10. file size / structure sanity
console.log('size', s.length, 'sections', sections, 'h3', h3s.length);
console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
