// Fix off-spec <title> (20-65 chars) and meta description (148-156) fields.
// All edits are scoped to <head> and to specific slots, so body text, the h1 band
// and unrelated strings are never touched:
//   <title>, og:title, twitter:title, JSON-LD headline + every matching name
//   <meta name=description>, og:description, twitter:description, JSON-LD description
// Dry-run unless --write; refuses to write unless every new value is in range.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WRITE = process.argv.includes('--write');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PATCH = {
  'c-programming.html': { title: 'C Programming - Memory, Pointers and the C Standard Library' },
  'cpp-programming.html': { title: 'C++ Programming - Modern C++, Templates, RAII and OOP' },
  'go-programming.html': { title: 'Go Programming - Concurrency, Interfaces and Tooling' },
  'r-programming.html': { title: 'R Programming - Statistics, Data Frames and ggplot2' },
  'rust-programming.html': { title: 'Rust Programming - Ownership, Borrowing and Cargo' },
  'package-publishing.html': { title: 'Packaging & Publishing - Registries and Releases' },
  'ui-ux-graphics.html': { title: 'Web UI & UX Design - Graphics and Design Systems' },

  'digital-marketing.html': {
    desc: 'Digital marketing for builders: SEO, SEM, social media, email, content, paid ads, analytics, funnels, MarTech and growth loops, with practical playbooks.',
  },
  'linux-shell.html': {
    desc: 'Choosing a shell is about where the script runs, not taste. Bash from first principles to advanced scripting: quoting, pipes, job control and automation.',
  },
  'static-dynamic-website-development.html': {
    desc: 'Static and dynamic website development: rendering models, PHP, ASP.NET and Node.js, with architecture trade-offs, code examples and deployment choices.',
  },
  'web-app-development.html': {
    desc: 'Web app development from static pages to full-stack apps: PHP, ASP.NET, Node.js, APIs, databases, authentication, state and deployment, with examples.',
  },
  'webapp-design.html': {
    desc: 'Web app design: interface architecture, data flows, forms, error states, empty states, offline logic, accessibility and visual design for real web apps.',
  },
  'website-design.html': {
    desc: 'Website design: UX foundations, layout grids, typography, colour, responsive breakpoints, accessibility, design systems and prototyping for modern websites.',
  },
  'website-development.html': {
    desc: 'Website development from static sites to full-stack web apps: HTML, CSS, JavaScript, SPAs, PWAs, APIs, databases, authentication, deployment and scaling.',
  },
  'website-seo.html': {
    desc: 'Website SEO end to end: technical, on-page, off-page, local and e-commerce SEO, measurement, audits and Core Web Vitals, covering every base for visibility.',
  },
  'website-webapp-deployment.html': {
    desc: 'Website and web app deployment: static hosting, CI pipelines, custom domains, HTTPS, CDNs, server rollouts and rollbacks, from build to live production.',
  },
};

const setAttr = (head, attr, re, val) => (head.match(re) ? head.replace(re, `$1${esc(val)}$2`) : head);

let bad = 0;
const plans = [];
for (const [f, p] of Object.entries(PATCH)) {
  const pth = path.join(ROOT, f);
  const s = fs.readFileSync(pth, 'utf8');
  const hEnd = s.indexOf('</head>');
  let head = s.slice(0, hEnd);
  const rest = s.slice(hEnd);
  const H0 = head;

  const oldT = ((head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
  const oldD = (head.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';
  const newT = p.title != null ? p.title : oldT.replace(/&amp;/g, '&');
  const newD = p.desc != null ? p.desc : oldD;
  const tl = esc(newT).length;
  const dl = newD.length;
  const tOk = tl >= 20 && tl <= 65;
  const dOk = dl >= 148 && dl <= 156;
  if (!tOk || !dOk) {
    bad++;
    console.log(`  REJECT ${f}: title=${tl}${tOk ? '' : '!'} desc=${dl}${dOk ? '' : '!'}`);
    continue;
  }

  if (p.title != null) {
    head = head.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(newT)}</title>`);
    head = setAttr(head, 'og:title', /(property="og:title"\s+content=")[^"]*(")/, newT);
    head = setAttr(head, 'twitter:title', /(name="twitter:title"\s+content=")[^"]*(")/, newT);
    head = head.replace(/"headline":"(?:[^"\\]|\\.)*"/, `"headline":${JSON.stringify(newT)}`);
    const oldJ = oldT.replace(/&amp;/g, '&');
    head = head.split(`"name":${JSON.stringify(oldJ)}`).join(`"name":${JSON.stringify(newT)}`);
  }
  if (p.desc != null) {
    head = setAttr(head, 'description', /(<meta\s+name="description"\s+content=")[^"]*(")/, newD);
    head = setAttr(head, 'og:description', /(property="og:description"\s+content=")[^"]*(")/, newD);
    head = setAttr(head, 'twitter:description', /(name="twitter:description"\s+content=")[^"]*(")/, newD);
    head = head.split(`"description":${JSON.stringify(oldD)}`).join(`"description":${JSON.stringify(newD)}`);
  }

  const out = head + rest;
  plans.push({ f, out, tl, dl, changed: out !== s });
  console.log(`  ok     ${f.padEnd(44)} title=${String(tl).padStart(2)} desc=${dl}`);
}

if (bad) {
  console.log(`\n${bad} value(s) out of range — nothing written.`);
  process.exit(1);
}
if (WRITE) for (const p of plans) if (p.changed) fs.writeFileSync(path.join(ROOT, p.f), p.out);
console.log(`\n${plans.length} file(s) ${WRITE ? 'written' : 'would change'}.`);
