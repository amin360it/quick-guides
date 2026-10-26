// Insert the new guide cards into the correct category band in index.html.
// Idempotent: a card is skipped if data-file="<f>" already exists in the page.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'index.html');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const INSERTS = [
  // Languages (268)
  { file: 'nodejs.html', cat: 'languages', hue: 268, letter: 'N', title: 'Node.js',
    desc: 'Server-side JavaScript: the event loop, modules, npm, streams, HTTP servers and deployment.' },
  { file: 'bun.html', cat: 'languages', hue: 268, letter: 'B', title: 'Bun',
    desc: 'The all-in-one JavaScript runtime, bundler, test runner and package manager.' },
  { file: 'java.html', cat: 'languages', hue: 268, letter: 'J', title: 'Java',
    desc: 'Syntax and OOP through collections, streams, the JVM, JavaFX, JDBC, JSP and Spring Boot.' },
  // Frontend (176)
  { file: 'fontawesome-icons.html', cat: 'frontend', hue: 176, letter: 'F', title: 'Font Awesome & Material Icons',
    desc: 'Font Awesome 6 and Google Material Symbols: setup, styling, accessibility and performance.' },
  // DevOps (8)
  { file: 'docker-compose.html', cat: 'devops', hue: 8, letter: 'D', title: 'Docker Compose',
    desc: 'Multi-container Docker apps: services, networks, volumes, healthchecks and production.' },
  // AI & ML (326)
  { file: 'n8n.html', cat: 'ai', hue: 326, letter: 'n', title: 'n8n Automation',
    desc: 'Visual workflow automation: triggers, nodes, expressions, webhooks and AI agent nodes.' },
  { file: 'chatgpt.html', cat: 'ai', hue: 326, letter: 'C', title: 'ChatGPT',
    desc: 'Practical ChatGPT: prompting, projects, data analysis, code, images and the API.' },
  { file: 'midjourney.html', cat: 'ai', hue: 326, letter: 'M', title: 'Midjourney',
    desc: 'AI image generation: prompt structure, parameters, styles and consistent characters.' },
  { file: 'claude.html', cat: 'ai', hue: 326, letter: 'C', title: 'Claude',
    desc: 'Claude in practice: long-context prompting, projects, artifacts, MCP and the API.' },
  // Web Basics (200) — a page that was missing its card
  { file: 'static-dynamic-website-development.html', cat: 'web-basics', hue: 200, letter: 'S', title: 'Static & Dynamic Sites',
    desc: 'How static and dynamic websites are built, generated, hosted and scaled.' },
  // Architecture (28)
  { file: 'microservices.html', cat: 'architecture', hue: 28, letter: 'M', title: 'Microservices',
    desc: 'Design and operate microservices: boundaries, communication, data ownership, resilience and scaling.' },
  // Frameworks (148)
  { file: 'spring-boot.html', cat: 'frameworks', hue: 148, letter: 'S', title: 'Spring Boot',
    desc: 'Production Spring Boot services: DI, configuration, web, data, security, testing and deployment.' },
  { file: 'jsp.html', cat: 'frameworks', hue: 148, letter: 'J', title: 'JSP & Servlets',
    desc: 'Java web applications: the servlet lifecycle, JSP, JSTL, EL, filters, JDBC, MVC and deployment.' },
  // Data (248)
  { file: 'oracle-sql.html', cat: 'data', hue: 248, letter: 'O', title: 'Oracle SQL',
    desc: 'Query and tune Oracle Database: SQL, PL/SQL, indexes, execution plans, transactions and diagnostics.' },
  // AI & ML (326)
  { file: 'ai-models.html', cat: 'ai', hue: 326, letter: 'A', title: 'AI Models',
    desc: 'Use modern AI models: language, image, audio and embeddings, prompting, APIs, RAG, evaluation and cost.' },
];

function findMatchingDiv(s, openIdx) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = openIdx;
  let depth = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[0] === '</div>') {
      depth--;
      if (depth === 0) return m.index;
    } else depth++;
  }
  return -1;
}

function topicsFor(file) {
  const t = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const main = t.slice(t.indexOf('<main id='), t.lastIndexOf('</main>'));
  return (main.match(/data-toc/g) || []).length;
}

let s = fs.readFileSync(FILE, 'utf8');
let added = 0;
for (const c of INSERTS) {
  if (s.includes(`data-file="${c.file}"`)) {
    console.log('skip (present):', c.file);
    continue;
  }
  const band = s.indexOf(`id="cat-${c.cat}"`);
  if (band < 0) throw new Error('band not found: ' + c.cat);
  const cardsOpen = s.indexOf('<div class="am-cards">', band);
  if (cardsOpen < 0) throw new Error('am-cards not found in ' + c.cat);
  const cardsClose = findMatchingDiv(s, cardsOpen);
  if (cardsClose < 0) throw new Error('unbalanced am-cards in ' + c.cat);
  const n = topicsFor(c.file);
  const card =
    `\n      <article class="am-card" data-cat="${c.cat}" data-file="${c.file}" style="--cat-hue:${c.hue}">` +
    `\n            <a class="am-card-top" href="${c.file}">` +
    `\n              <span class="am-card-ic">${esc(c.letter)}</span>` +
    `\n              <span class="am-card-body">` +
    `\n                <span class="am-card-h"><strong>${esc(c.title)}</strong></span>` +
    `\n                <span class="am-card-p">${esc(c.desc)}</span>` +
    `\n              </span>` +
    `\n            </a>` +
    `\n            <span class="am-card-f"><span>${n} topics</span><span class="am-go">Open guide &rsaquo;</span></span>` +
    `\n          </article>`;
  s = s.slice(0, cardsClose) + card + s.slice(cardsClose);
  added++;
}
fs.writeFileSync(FILE, s, 'utf8');
console.log(`index.html: ${added} cards inserted`);
