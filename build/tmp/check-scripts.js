'use strict';
const fs = require('fs');
for (const f of ['index.html','topics.html','search.html','favorites.html','flutter.html','javascript.html','csharp.html','php.html']) {
  const s = fs.readFileSync(f, 'utf8');
  const scripts = [...s.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
  const css = [...s.matchAll(/<link[^>]*href="([^"]+\.css)"/g)].map((m) => m[1]);
  const nav = /<nav id="topnav"[\s\S]*?<\/nav>/.exec(s);
  console.log(f);
  console.log('  css:', css.join(','));
  console.log('  js :', scripts.join(','));
  console.log('  topnav:', nav ? JSON.stringify(nav[0].slice(0, 90)) : 'NONE');
}