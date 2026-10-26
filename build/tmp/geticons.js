/* geticons.js — build the exact per-guide icon set, fully offline for readers.
 *
 * Fetches brand marks from simple-icons ONCE at build time (this machine), normalises
 * them to currentColor, merges hand-drawn Feather-style glyphs for guides with no
 * brand, and writes build/tmp/guideicons.json keyed by guide filename.
 * The JSON is then spliced into assets/shell.js by spliceicons.js — the shipped
 * site never references the network.
 *
 * Run:  node build/tmp/geticons.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

/* Guides with a simple-icons brand mark, keyed by guide filename. */
const SLUGS = {
  'react.html': 'react',
  'react-native.html': 'react',
  'vuejs.html': 'vuedotjs',
  'nuxtjs.html': 'nuxt',
  'vue-nuxt-capacitor.html': 'nuxt',
  'nextjs.html': 'nextdotjs',
  'svelte.html': 'svelte',
  'sveltekit.html': 'sveltekit',
  'typescript.html': 'typescript',
  'javascript.html': 'javascript',
  'php.html': 'php',
  'laravel.html': 'laravel',
  'laravel-blade.html': 'laravel',
  'laravel13-advanced.html': 'laravel',
  'laravel-vue.html': 'laravel',
  'python.html': 'python',
  'c-programming.html': 'c',
  'cpp-programming.html': 'cplusplus',
  'go-programming.html': 'go',
  'rust-programming.html': 'rust',
  'r-programming.html': 'r',
  'mysql.html': 'mysql',
  'postgresql.html': 'postgresql',
  'mongodb.html': 'mongodb',
  'git-github.html': 'git',
  'vercel.html': 'vercel',
  'netlify.html': 'netlify',
  'cpanel.html': 'cpanel',
  'wordpress.html': 'wordpress',
  'wp-theme.html': 'wordpress',
  'wp-plugin.html': 'wordpress',
  'dart.html': 'dart',
  'flutter.html': 'flutter',
  'capacitor.html': 'capacitor',
  'electron-apps.html': 'electron',
  'bootstrap5.html': 'bootstrap',
  'jquery.html': 'jquery',
  'axios.html': 'axios',
  'alpinejs.html': 'alpinedotjs',
  'html.html': 'html5',
  'css.html': 'css',
  'blazor.html': 'blazor',
  'aspnet-core.html': 'dotnet',
  'aspnet-core-advanced.html': 'dotnet',
  'dotnet-vue.html': 'dotnet',
  'linux-shell.html': 'linux'
};

/* Hand-drawn monochrome glyphs (Feather-style: stroke, currentColor, 24x24)
   for guides whose subject is a concept, not a brand. */
const G = (d) => '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</g>';
const HAND = {
  /* software engineering — a gear */
  'software-engineering.html': G('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9"/>'),
  /* idea to deploy — a rocket */
  'idea-to-deploy.html': G('<path d="M12 2.5c3.2 2 5 5.4 5 9.3l-2.4 3.4H9.4L7 11.8c0-3.9 1.8-7.3 5-9.3z"/><circle cx="12" cy="9.5" r="1.7"/><path d="M9.4 15.2 7.5 20l3.4-1.4M14.6 15.2l1.9 4.8-3.4-1.4M12 18.4v3.1"/>'),
  /* UI/UX — a pen nib */
  'ui-ux.html': G('<path d="M12 2.5 5.2 13.6 12 21.5l6.8-7.9z"/><circle cx="12" cy="11.4" r="1.7"/><path d="M12 13.1V21.5"/>'),
  /* UI/UX graphics — a palette */
  'ui-ux-graphics.html': G('<path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.7-3 2 2 0 0 1 1.7-3h1.9a4 4 0 0 0 4-4c0-4.4-4-8-9.3-8z"/><circle cx="7.6" cy="10.6" r="1.05"/><circle cx="12" cy="7.6" r="1.05"/><circle cx="16.4" cy="10.1" r="1.05"/>'),
  /* software architecture — a classical building */
  'architecture.html': G('<path d="M3 21h18M5.5 21V10L12 4.8 18.5 10v11M9.6 21v-5.6h4.8V21M9 12.6h6"/>'),
  /* system design — a node graph */
  'system-design.html': G('<circle cx="5.5" cy="6" r="2.2"/><circle cx="18.5" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7.7 6h8.6M6.7 8l4.1 8M17.3 8l-4.1 8"/>'),
  /* software design — drafting compass */
  'software-design.html': G('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.1 5.1-5.1 2.1 2.1-5.1z"/>'),
  /* databases — a cylinder */
  'database.html': G('<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6"/><path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3"/>'),
  /* database design — cylinder + gear */
  'db-design.html': G('<ellipse cx="10.5" cy="5.5" rx="6.5" ry="2.6"/><path d="M4 5.5v11c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6v-11"/><circle cx="17.5" cy="17.5" r="2.1"/><path d="M17.5 13.9v1.1M17.5 20v1.1M13.9 17.5h1.1M20 17.5h1.1"/>'),
  /* network design — two hosts and a switch */
  'network-design.html': G('<rect x="2.5" y="4" width="7" height="5" rx="1.2"/><rect x="14.5" y="4" width="7" height="5" rx="1.2"/><rect x="8.5" y="15" width="7" height="5" rx="1.2"/><path d="M6 9v2.6h12V9M12 11.6V15"/>'),
  /* tech networking — router with wifi */
  'tech-networking.html': G('<rect x="3" y="13.5" width="18" height="6.5" rx="2"/><path d="M6.8 16.8h.01M10.2 16.8h.01"/><path d="M8.6 10a5 5 0 0 1 6.8 0M6 7.2a9 9 0 0 1 12 0"/>'),
  /* servers — a rack */
  'servers.html': G('<rect x="4" y="3.5" width="16" height="6" rx="1.5"/><rect x="4" y="12" width="16" height="6" rx="1.5"/><path d="M7.3 6.5h.01M7.3 15h.01M16.4 6.5h1.4M16.4 15h1.4M6.5 20.5h11"/>'),
  /* IT infrastructure — a cloud */
  'it-infrastructure.html': G('<path d="M7.2 18.5a4.6 4.6 0 0 1-.4-9.2A6.1 6.1 0 0 1 18.5 11 3.8 3.8 0 0 1 17.6 18.5z"/>'),
  /* domains and hosting — the globe */
  'domains-hosting.html': G('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.7 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.7-3.9-9S9.4 5.6 12 3z"/>'),
  /* CI/CD — a cycle of arrows */
  'cicd.html': G('<path d="M20.5 12a8.5 8.5 0 0 1-14.9 5.6M3.5 12a8.5 8.5 0 0 1 14.9-5.6"/><path d="M18.5 2.9v3.7h-3.7M5.5 21.1v-3.7h3.7"/>'),
  /* API design — braces around a node */
  'api-design.html': G('<path d="M8.6 4C6.7 4 6.7 7.2 6.7 8.7 6.7 10.4 5.2 12 5.2 12s1.5 1.6 1.5 3.3c0 1.5 0 4.7 1.9 4.7M15.4 4c1.9 0 1.9 3.2 1.9 4.7 0 1.7 1.5 3.3 1.5 3.3s-1.5 1.6-1.5 3.3c0 1.5 0 4.7-1.9 4.7"/><circle cx="12" cy="12" r="1.7"/>'),
  /* publishing — a package cube */
  'package-publishing.html': G('<path d="M12 3.4 20 7.9v8.2L12 20.6 4 16.1V7.9z"/><path d="M4 7.9 12 12.4l8-4.5M12 12.4v8.2"/>'),
  /* hardware interfaces — a chip with pins */
  'hardware-interfaces.html': G('<rect x="7.5" y="7.5" width="9" height="9" rx="1.4"/><path d="M9.7 4v3.5M14.3 4v3.5M9.7 16.5V20M14.3 16.5V20M4 9.7h3.5M4 14.3h3.5M16.5 9.7H20M16.5 14.3H20"/>'),
  /* Leaf PHP MVC — a leaf */
  'leaf-mvc.html': G('<path d="M20 4c-9.2 0-14.2 3.6-14.2 9.6A5.4 5.4 0 0 0 11.2 19C17.8 19 20 12.1 20 4z"/><path d="M5 20c2.5-5.6 6.6-9.6 11-12"/>'),
  /* AI engineering — sparkles */
  'ai-engineering.html': G('<path d="M11 3.5 13 9l5.5 2-5.5 2-2 5.5-2-5.5L4.5 11 10 9z"/><path d="m18.4 15.6.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>'),
  /* C# .NET desktop — a window */
  'winforms-wpf.html': G('<rect x="3" y="4.5" width="18" height="13" rx="2"/><path d="M3 8.5h18M6.2 6.5h.01M8.6 6.5h.01M8 20.5h8"/>'),
  /* Windows batch — a terminal */
  'windows-batch.html': G('<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15.5H17"/>'),
  /* PowerShell — a console with double chevron */
  'powershell-scripting.html': G('<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="m7 9 2.5 3L7 15M12.5 15H17"/>'),
  /* SQL Server — a striped cylinder */
  'sqlserver.html': G('<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6"/><path d="M8.6 8.6v10.1M12 9.2v9.6M15.4 8.6v10.1"/>'),
  /* C# — a hash in a rounded square */
  'csharp.html': G('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m10 8.6-1.4 6.8M14.6 8.6 13.2 15.4M8.2 11h8M7.6 13.4h8.8"/>'),
  /* PHP OOP + MySQL — a database of objects */
  'php-oop-mysql.html': G('<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v13c0 1.54 3.13 2.8 7 2.8s7-1.26 7-2.8v-13"/><path d="M10 10.6c-1 0-1 1.4-1 2.4s0 2.4 1 2.4M14 10.6c1 0 1 1.4 1 2.4s0 2.4-1 2.4"/>')
};

/* simple-icons occasionally 404s on an alternate slug — try these fallbacks. */
const FALLBACK = { 'sveltekit.html': ['svelte'] };

function normalise(svg) {
  return svg
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/fill="#[0-9a-fA-F]{3,8}"/g, 'fill="currentColor"')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();
}

async function fetchSlug(slug) {
  const res = await fetch('https://cdn.simpleicons.org/' + slug);
  if (!res.ok) throw new Error(slug + ' -> HTTP ' + res.status);
  return normalise(await res.text());
}

(async function main() {
  const out = {};
  const missing = [];

  for (const file of Object.keys(SLUGS)) {
    const chain = [SLUGS[file]].concat(FALLBACK[file] || []);
    let ok = false;
    for (const slug of chain) {
      try { out[file] = await fetchSlug(slug); ok = true; break; }
      catch (e) { /* try next fallback */ }
    }
    if (!ok) missing.push(file + ' (slug: ' + chain.join(' -> ') + ')');
  }

  for (const file of Object.keys(HAND)) {
    if (!out[file]) out[file] = HAND[file];
  }

  const known = new Set(Object.keys(out));
  const disk = fs.readdirSync(path.join(__dirname, '..', '..'))
    .filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'topics.html' && f !== 'favorites.html');
  const uncovered = disk.filter(f => !known.has(f));

  const dest = path.join(__dirname, 'guideicons.json');
  fs.writeFileSync(dest, JSON.stringify(out, null, 0), 'utf8');

  console.log('icons written : ' + Object.keys(out).length);
  console.log('size          : ' + Math.round(fs.statSync(dest).size / 1024) + ' KB');
  if (missing.length) console.log('SI FAILED     : ' + missing.join(', '));
  console.log('no icon yet   : ' + (uncovered.join(', ') || 'none'));
})();
