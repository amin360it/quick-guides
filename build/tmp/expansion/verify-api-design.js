const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');

let fails = 0;
const fail = (msg) => { console.log('FAIL: ' + msg); fails++; };

// 1. duplicate ids page-wide (h1/h2/h3/h4)
const ids = {};
const idRe = /<(h[1-6]|div|section)[^>]*\bid="([^"]+)"/g;
let m;
while ((m = idRe.exec(html))) {
  const id = m[2];
  (ids[id] = ids[id] || []).push(m[1]);
}
for (const [id, tags] of Object.entries(ids)) {
  if (tags.length > 1) fail(`duplicate id "${id}" across ${tags.join(', ')}`);
}
console.log('id check done,', Object.keys(ids).length, 'ids');

// 2. code blocks: extract, check each block is closed and no raw < or bare &
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let blocks = 0;
while ((m = codeRe.exec(html))) {
  blocks++;
  const code = m[1];
  if (/<(?![\/a-zA-Z!])/.test(code)) fail(`raw '<' in code block #${blocks}`);
  const badAmp = code.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;)/g);
  if (badAmp) fail(`bare '&' in code block #${blocks}: ${badAmp.length} occurrence(s)`);
  if (/&amp;(amp|lt|gt|quot|#)/.test(code)) fail(`double-escape in code block #${blocks}`);
  // repeats rule: first 200 chars must not appear again later
  const head = code.slice(0, 200);
  if (head.length >= 20 && code.indexOf(head, 20) !== -1) fail(`repeat detected in code block #${blocks}`);
}
console.log('code blocks checked:', blocks);

// 3. tag balance in the whole file (crude div balance)
const open = (html.match(/<div /g) || []).length;
const close = (html.match(/<\/div>/g) || []).length;
console.log('div open/close:', open, '/', close);
if (open !== close) fail(`div imbalance: ${open} open vs ${close} close`);

// 4. every <h4> is a block-level element with a closing tag present
const h4open = (html.match(/<h4/g) || []).length;
const h4close = (html.match(/<\/h4>/g) || []).length;
if (h4open !== h4close) fail(`h4 imbalance: ${h4open} open vs ${h4close} close`);

// 5. h2/h3 heading ids from chapters 1-5 + orientation still exist exactly once
const expect = [
  'orientation-assume','orientation-scope','orientation-map','orientation-conventions',
  'ch1-nouns','ch1-methods','ch1-safety','ch1-nesting','ch1-actions','ch1-plural','ch1-query',
  'ch2-success','ch2-redirect','ch2-client','ch2-server','ch2-body','ch2-codes','ch2-headers','ch2-validate',
  'ch3-offsets','ch3-cursor','ch3-cursor-build','ch3-total','ch3-filtering','ch3-sorting','ch3-search','ch3-includes',
  'ch4-split','ch4-sessions','ch4-jwt','ch4-oauth','ch4-pkce','ch4-scopes','ch4-oidc','ch4-api-keys','ch4-rotate',
  'ch5-why','ch5-idem-key','ch5-idem-impl','ch5-concurrency','ch5-lost','ch5-retries','ch5-dedup',
];
for (const id of expect) {
  const n = (html.match(new RegExp('<h[23] id="' + id + '"', 'g')) || []).length;
  if (n !== 1) fail(`heading id "${id}" appears ${n} times (expected 1)`);
}

console.log(fails === 0 ? '\nALL CHECKS PASSED' : '\n' + fails + ' FAILURE(S)');