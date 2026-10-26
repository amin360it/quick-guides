/* addsearchlink.js — add a "Search everything" entry to the Browse Guides
 * panel in assets/shell.js. Uses function-replacement and asserts the exact
 * marker occurs once (AGENTS repair-tool rules: never rely on a replacement
 * matching what you expect — prove it).
 *
 * Run: node build/tmp/addsearchlink.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const JS = path.join(__dirname, '..', '..', 'assets', 'shell.js');

let src = fs.readFileSync(JS, 'utf8');
const before = src.length;

if (src.indexOf("searchLink.href = 'search.html'") !== -1) {
  console.log('SKIP: search link already present — refusing to double-write');
  process.exit(0);
}

/* Match on the href assignment only. The label line is avoided entirely
   because the file stores its arrows as \uXXXX escapes and a literal arrow
   in a replacement string is exactly the thing that gets mangled in transit. */
/* NB: shell.js is CRLF. Build the marker from the file's own newline so the
   match works regardless of line ending. */
const NL = src.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
const MARK = [
  "      allTopics.href = 'topics.html';",
  '      panel.appendChild(allTopics);',
  ''
].join(NL);
if (src.split(MARK).length - 1 !== 1) {
  console.error('FAIL: marker not found exactly once');
  process.exit(1);
}

const arrow = '\u2192';   // escape form: a literal arrow is mangled in transit
const block =
  MARK + NL +
  '      /* Global search page: a JSON index of every guide, chapter and' + NL +
  '         section, ranked client-side. Fully offline. */' + NL +
  "      var searchLink = el('a', 'tn-menu-note', 'Search everything " + arrow + "');" + NL +
  "      searchLink.href = 'search.html';" + NL +
  '      panel.appendChild(searchLink);' + NL;

src = src.replace(MARK, () => block);

/* effect assertion: the file can only have grown, by exactly the block length */
const delta = src.length - before;
if (delta !== block.length - MARK.length) {
  console.error('FAIL: delta ' + delta + ' != expected ' + (block.length - MARK.length));
  process.exit(1);
}

fs.writeFileSync(JS, src, 'utf8');
console.log('OK: search link added to Browse Guides panel (+' + delta + ' bytes)');
