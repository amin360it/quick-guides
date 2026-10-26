/* updateagents.js — apply the AGENTS.md refresh in one asserted pass.
 * Every replacement is checked for an exact occurrence count before writing;
 * the script refuses to touch the file if anything is missing or doubled.
 * Run:  node build/tmp/updateagents.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', '..', 'AGENTS.md');

let src = fs.readFileSync(FILE, 'utf8');
const before = src.length;
const edits = [];

function swap(find, repl, label) {
  const n = src.split(find).length - 1;
  if (n !== 1) { console.error('FAIL [' + label + ']: expected 1 occurrence, found ' + n); process.exit(1); }
  src = src.replace(find, () => repl);
  edits.push(label);
}

/* --- living counts (historical narrative is left alone) --- */
swap('Linked from every header on all 58 pages.',
     'Linked from every header on all 74 pages.', 'entry point count');
swap('| **Guides** | 56 `.html` files, one per technology. |',
     '| **Guides** | 72 `.html` files, one per technology. |', 'guides count');
swap('unique across all 58 pages', 'unique across all 74 pages', 'title uniqueness scope');
swap('Header lockup is identical on all 58 pages.',
     'Header lockup is identical on all 74 pages.', 'lockup scope');
swap('not duplicated across 63 pages', 'not duplicated across 74 pages', 'mode popover scope');
swap('would fail 63 pages', 'would fail 74 pages', 'seoverify scope');
swap('pre-rendered into all 61 guides', 'pre-rendered into all 72 guides', 'ch-toc scope');
swap('`sitemap.xml` (58 URLs, hubs weighted highest)',
     '`sitemap.xml` (74 URLs, hubs weighted highest)', 'sitemap count');
swap('| `finalcheck.js` | 58 pages:', '| `finalcheck.js` | 74 pages:', 'finalcheck scope');

/* --- architecture rows: task tracking + working folders --- */
swap('| **Fonts** | JetBrains Sans + Mono, base64-embedded inside `shell.css`. |',
     '| **Fonts** | JetBrains Sans + Mono, base64-embedded inside `shell.css`. |\n' +
     '| **Task tracking** | `TODOS.md` — the master work list (DONE / ONGOING / PENDING). Read it before starting work; update it when done. |\n' +
     '| **Temp / build work** | `build/` — scripts in `build/`, scratch in `build/tmp/`, backups in `build/bak/`. Never outside this repo. |',
     'architecture rows');

/* --- Task Tracking section, before File-Naming Convention --- */
swap('## File-Naming Convention',
     '## Task Tracking — TODOS.md\n\n' +
     '**`TODOS.md` is the master work list and the source of truth for state.**\n\n' +
     '- Every piece of work — feature, fix, wiring, cleanup — is recorded there under ' +
     '**DONE** (dated), **ONGOING** (in flight, with owner), or **PENDING** (queued, with its blocker).\n' +
     '- This file holds the *invariants*; `TODOS.md` holds *what is being built right now*.\n' +
     '- An agent starting work: read `TODOS.md` first, pick the task, move it to ONGOING while you work.\n' +
     '- An agent finishing work: close the task in `TODOS.md` in the same change — untracked work gets redone or lost.\n' +
     '- New tasks never bypass `TODOS.md`; if it is not noted there, it does not exist.\n\n' +
     '## File-Naming Convention',
     'task-tracking section');

/* --- File Index: header paragraph + full table rebuild --- */
const START = '58 pages, ~18.5 MB, 922 chapters, 5,384 code samples.';
const END = '\n\n## Tech Stack Summary';
if (src.split(START).length - 1 !== 1) { console.error('FAIL [file index start marker]'); process.exit(1); }
if (src.split(END).length - 1 !== 1) { console.error('FAIL [file index end marker]'); process.exit(1); }

const R = [
  ['ai-engineering.html', 'AI Engineering', 18, 93, 213],
  ['alpinejs.html', 'Alpine.js', 12, 43, 96],
  ['api-design.html', 'API Design', 13, 108, 286],
  ['architecture.html', 'Software Architecture Design Guide', 19, 21, 97],
  ['aspnet-core-advanced.html', 'ASP.NET Core 10 \u2014 Advanced', 19, 263, 331],
  ['aspnet-core.html', 'ASP.NET Core 10', 11, 52, 109],
  ['axios.html', 'Axios', 12, 40, 91],
  ['blazor.html', 'Blazor', 20, 109, 239],
  ['bootstrap5.html', 'Bootstrap 5', 13, 49, 106],
  ['c-programming.html', 'C Programming', 12, 95, 443],
  ['capacitor.html', 'Capacitor', 17, 125, 183],
  ['cicd.html', 'CI/CD', 18, 20, 76],
  ['cpanel.html', 'cPanel and WHM', 8, 77, 213],
  ['cpp-programming.html', 'C++ Programming', 9, 49, 241],
  ['csharp.html', 'C# 14 & .NET 10', 20, 257, 984],
  ['css.html', 'CSS3', 13, 210, 351],
  ['dart.html', 'Dart 3', 17, 703, 1569],
  ['database.html', 'Databases', 19, 44, 111],
  ['db-design.html', 'Advanced Database System Design', 19, 182, 925],
  ['domains-hosting.html', 'Domains and Hosting', 20, 67, 171],
  ['dotnet-vue.html', '.NET Core + Vue', 18, 34, 81],
  ['electron-apps.html', 'Building Service Apps with Electron', 1, 2, 13],
  ['flutter.html', 'Flutter', 20, 396, 1497],
  ['git-github.html', 'Git and GitHub', 7, 74, 264],
  ['go-programming.html', 'Go Programming', 10, 51, 255],
  ['hardware-interfaces.html', 'Port API and Hardware Access', 5, 54, 147],
  ['html.html', 'HTML5', 12, 129, 296],
  ['idea-to-deploy.html', 'Idea to Deploy', 20, 181, 1005],
  ['index.html', 'Amin360iT Quick Guides - 71 Offline Developer Guides', 0, 0, 81],
  ['it-infrastructure.html', 'IT Infrastructure System Design Guide', 20, 19, 95],
  ['javascript.html', 'JavaScript & ES6+', 14, 255, 474],
  ['jquery.html', 'jQuery', 11, 36, 84],
  ['laravel-blade.html', 'Laravel Blade', 20, 295, 920],
  ['laravel-vue.html', 'Laravel + Vue', 18, 35, 76],
  ['laravel.html', 'Laravel 13', 18, 43, 89],
  ['laravel13-advanced.html', 'Laravel 13 \u2014 Advanced', 20, 146, 332],
  ['leaf-mvc.html', 'Leaf PHP MVC', 20, 210, 475],
  ['linux-shell.html', 'Linux Bash and Shell Scripting', 1, 5, 16],
  ['mongodb.html', 'MongoDB', 13, 48, 103],
  ['mysql.html', 'MySQL 9', 8, 73, 270],
  ['netlify.html', 'Netlify', 8, 80, 269],
  ['network-design.html', 'Network System Design Guide', 19, 27, 94],
  ['nextjs.html', 'Next.js 15', 6, 43, 93],
  ['nuxtjs.html', 'NuxtJS', 12, 45, 94],
  ['package-publishing.html', 'Publishing & Deployment', 12, 105, 290],
  ['php-oop-mysql.html', 'PHP OOP and MySQL', 20, 93, 316],
  ['php.html', 'PHP 8.5', 15, 106, 454],
  ['postgresql.html', 'PostgreSQL 18', 14, 150, 509],
  ['powershell-scripting.html', 'Windows PowerShell Scripting', 1, 6, 17],
  ['python.html', 'Python 3.14', 18, 228, 811],
  ['r-programming.html', 'R Programming', 3, 13, 30],
  ['react-native.html', 'React Native \u2020', 15, 85, 140],
  ['react.html', 'React 19 \u2020', 11, 90, 85],
  ['rust-programming.html', 'Rust', 3, 15, 41],
  ['servers.html', 'Servers', 32, 44, 149],
  ['software-design.html', 'Software Design', 10, 102, 343],
  ['software-engineering.html', 'Software Engineering \u2014 Self-Paced Bachelor\u2019s Guide', 40, 579, 2733],
  ['sqlserver.html', 'SQL Server 2025 & T-SQL', 15, 284, 919],
  ['svelte.html', 'Svelte', 12, 47, 90],
  ['sveltekit.html', 'SvelteKit', 12, 52, 86],
  ['system-design.html', 'System Design', 14, 181, 655],
  ['tech-networking.html', 'Tech Networking', 21, 48, 155],
  ['topics.html', 'All 6,176 topics - Amin360iT Quick Guides', 0, 0, 1088],
  ['typescript.html', 'TypeScript', 13, 50, 96],
  ['ui-ux-graphics.html', 'UI / UX Design', 4, 25, 63],
  ['ui-ux.html', 'UI/UX Design \u2014 Self-Paced Bachelor\u2019s Guide', 30, 328, 1760],
  ['vercel.html', 'Vercel', 7, 81, 218],
  ['vue-nuxt-capacitor.html', 'Vue + Nuxt', 15, 147, 212],
  ['vuejs.html', 'Vue 3', 16, 100, 613],
  ['windows-batch.html', 'Windows Batch Scripting', 1, 2, 11],
  ['winforms-wpf.html', 'C# .NET 10 Desktop', 13, 82, 203],
  ['wordpress.html', 'WordPress', 14, 220, 616],
  ['wp-plugin.html', 'WordPress Plugin Development', 21, 204, 658],
  ['wp-theme.html', 'WordPress Theme Development', 20, 87, 246]
];
if (R.length !== 74) { console.error('FAIL: row count is ' + R.length + ', expected 74'); process.exit(1); }

const sum = (i) => R.reduce((a, r) => a + r[i], 0);
const header =
  sum(4) + ' KB of pages… '.replace(/^/, '') /* placeholder removed below */;
const headerText =
  '74 pages, ~' + Math.round(sum(4) / 1000) + ' MB, ' + sum(2) + ' chapters, ' + sum(3) +
  ' code samples. The **Guide** column is the visible h1 band; the two hubs have no band, ' +
  'so their full browser title is shown. Measured 2026-10-08. ' +
  'Rows marked \u2020 are provisional \u2014 their depth work is in flight (see `TODOS.md`).\n\n' +
  '| File | Guide | Chapters | Code | Size |\n|---|---|---:|---:|---:|\n' +
  R.map(r => '| `' + r[0] + '` | ' + r[1] + ' | ' + r[2] + ' | ' + r[3] + ' | ' + r[4] + ' KB |').join('\n');

const a = src.indexOf(START), b = src.indexOf(END, a);
if (a < 0 || b < 0) { console.error('FAIL: file index markers'); process.exit(1); }
src = src.slice(0, a) + headerText + src.slice(b);
edits.push('file index (74 rows)');

fs.writeFileSync(FILE, src, 'utf8');
console.log('OK — ' + edits.length + ' edits applied');
console.log('  ' + edits.join('\n  '));
console.log('size ' + before + ' -> ' + src.length + ' bytes (delta ' + (src.length - before) + ')');
