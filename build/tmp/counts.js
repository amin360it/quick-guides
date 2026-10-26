'use strict';
/* Show the count-bearing strings on a few pages and the computed stats. */
const fs = require('fs');
for (const f of ['php.html', 'cpanel.html', 'flutter.html', 'linux-shell.html', 'windows-batch.html']) {
  const s = fs.readFileSync(f, 'utf8');
  const band = (s.match(/<span class="am-band-s">([^<]+)/) || [])[1];
  const desc = (s.match(/<meta name="description" content="([^"]*)/) || [])[1];
  const ch = (s.match(/<section class="chapter">/g) || []).length;
  const dt = (s.match(/data-toc/g) || []).length;
  const code = (s.match(/<div class="codeWrap"><pre><code>/g) || []).length;
  if (f === 'windows-batch.html' || 1) {
    console.log('== ' + f + ' | chapters=' + ch + ' data-toc=' + dt + ' code=' + code);
    console.log('   band: ' + band);
    console.log('   desc: ' + String(desc).slice(0, 200));
  }
}