# TODOS — master task tracker

> **This file is the source of truth for all work in this repo.**
> AGENTS.md holds the *invariants* (how the library must be built); this file
> holds *what is being built right now*. Every agent reads this first, moves
> its task while working, and closes it with a date when verified.
> Structure: **DONE** (dated) → **ONGOING** (in flight, with owner) →
> **PENDING** (queued, with its blocker). Nested items are sub-steps of their
> parent task.

---

## ✅ DONE

- [x] **2026-10-09 — All-in-one `server.bat` with start/stop controls**
  - [x] `server.js` — zero-dependency static file server using Node `http` module (MIME types for html/css/js/png/jpg/svg/json/xml/webmanifest/fonts, `/` → `index.html`, 404 fallback, path-traversal guard)
  - [x] `server.bat` — full menu: background start, stop by PID, status check, restart; runtimes: Node.js LTS / PHP 8.4 / Python 3.13 / IIS; LAN network server mode; dependency detection; install/uninstall via winget; network info + firewall hint
- [x] **2026-10-07 — `build/` working folders created**
  - [x] `build/README.md` — temp/build work lives inside this repo, never outside
  - [x] `build/tmp/`, `build/bak/`, `build/edits/` established
- [x] **2026-10-07 — Repo audit**
  - [x] 73 pages counted (2 hubs + 71 guides), 1,017 chapters, 8,352 code samples
  - [x] 10 new guides confirmed wired (index, topics, `GUIDES` in shell.js, band, both axes)
  - [x] Gaps recorded below (missing `build/` tooling, stray `package.json`, missing brand art)
- [x] **2026-10-08 — Offline guarantee audited** ("make all assets available offline")
  - [x] Only external ref per page is `rel="canonical"` (SEO metadata, not an asset load)
  - [x] Zero external `<script src>` / stylesheet / font / `<img>` across all 74 pages
  - [x] `assets/*.css` — no `url(http…)`, no `@import`; fonts are base64 inside `shell.css`
  - [x] `assets/*.js` — the two `https://` hits are a comment and the SVG namespace URI
  - [x] Verdict: **the shipped library loads zero network resources**
- [x] **2026-10-08 — Exact guide icon set built** (Font Awesome replaced by self-hosted marks)
  - [x] `build/tmp/geticons.js` — fetches simple-icons ONCE at build time, normalises to `currentColor`
  - [x] 46 brand marks fetched + 26 hand-drawn glyphs → `build/tmp/guideicons.json` (72 icons, 69 KB, 0 missing)
- [x] **2026-10-08 — `sitemap.xml`**: `react-native.html` URL added (now 74 URLs)
- [x] **2026-10-08 — `TODOS.md` restructured** as this master tracker (DONE / ONGOING / PENDING)
- [x] **2026-10-08 — 4 new Basic-category guides written**
  - [x] `website-seo.html` — Website SEO (all kinds of SEO topics)
  - [x] `digital-marketing.html` — All-in-One Digital Marketing
  - [x] `website-design.html` — Website Design (UX, UI, visual design)
  - [x] `website-development.html` — Website Development (incl. web apps)
  - [x] All four carry the full anatomy: lockup, `.am-band` h1, both axes, sidebar TOC, `.ch-toc` parity, code samples, `tip`/`warn`/`note`, UTF-8; band counts true; meta/OG/JSON-LD complete
- [x] **2026-10-08 — `AGENTS.md` refreshed**
  - [x] Page counts fixed everywhere (63/58/61 → 74 pages, 2 hubs + 72 guides)
  - [x] "Task Tracking" section added: TODOS.md is mandatory reading/updating
  - [x] File Index table rebuilt for 74 files (provisional rows noted)
- [x] **2026-10-08 — Guide marks embedded in the shell**
  - [x] `build/tmp/spliceicons.js` — marker-based, byte-delta-asserted splice of `GUIDE_ICONS` (72 marks, minified) + `guideIcon()` helper + card hydration into `assets/shell.js` before `var GUIDES = [` (43 → 116 KB, `node --check` OK)
  - [x] Card hydration: `.am-card[data-file] .am-card-ic` letter → exact mark; letter stays the no-JS / unknown-guide fallback
  - [x] Browse Guides rows get the mark before the label (filter text untouched)
  - [x] CSS: `.am-card-ic .am-glyph` (hub.css, 26 px) + `.topnav .tn-link` flex row with 17 px `.am-glyph` (shell.css) — both `currentColor`, no new tokens, both themes correct
  - [x] `CAT_ICONS` (12 category line glyphs, 24×24 `currentColor`) + `catIcon()` in `shell.js`
  - [x] Hydration: `.am-drawer-a[data-jump-cat]` category jumps, `.am-drawer-h` header links (href-keyed: home / grid / list / search), Browse Guides group heads (`.tn-cat-h`, mapped from group name via `CAT_KEY`)
  - [x] CSS: drawer rows flex + 19 px glyphs (hub.css), panel heads flex + 14 px glyph (shell.css); hover fills recolour glyphs via `currentColor`
  - [x] `node --check` clean on both scripts
- [x] **Mobile responsive pass** — header + hub pages ≤760px: compact controls, 44 px targets, no overflow (user request, 2026-10-08); bottom nav `.botnav` added, `.to-top` raised via `env(safe-area-inset-bottom)`, banner search gap fixed
- [x] **2026-10-08 — Favorites feature**
  - [x] `favorites.html` — full anatomy page (lockup, band, sidebar TOC, shell assets only)
  - [x] Storage: `localStorage["amin360it-favs"]` = `[{href, title, page, added}]`
  - [x] Header star `#favBtn` injected by `shell.js` (toggles current page **or** current section/anchor)
  - [x] List rendering + remove + clear-all, handled in `shell.js` when `#favList` exists (no inline JS)
  - [x] Entry points: Browse Guides panel + hub drawers link to the page
- [x] **2026-10-08 — 8 new WEB BASICS guides created**
  - [x] `website-seo.html`, `digital-marketing.html`, `website-design.html`, `website-development.html`, `webapp-design.html`, `web-app-development.html`, `website-webapp-deployment.html`
  - [x] All carry full anatomy; `index.html` has a **Web Basics** band with cards
  - [x] `assets/shell.js` `GUIDES` has a `Web Basics` group
  - [x] `topics.html` now lists all eight; counts updated to 83 pages / 6,214 topics
  - [x] `sitemap.xml` includes the new pages; `manifest.json` fixed
  - [x] Depth updated on disk: every new guide = 3 chapters, 2–8 code samples (measured)
  - [x] `AGENTS.md` totals refreshed to 83 pages / 1060 chapters / 8579 samples
- [x] **Header search gap** — `.am-topsearch input` padding now `0 20px 0 42px` in `hub.css`; icon-to-text and text-to-edge gaps both widened
- [x] **Icon colour follows theme** — `.am-glyph` (card marks) and `.am-drawer-a/.am-drawer-h .am-glyph` (nav marks) now carry explicit `color/fill/stroke: currentColor` in `hub.css`
- [x] **8 new guide marks** — `updateicons.js` appended Website SEO, Digital Marketing, Website Design, Website Development, Web App Design, Web App Development, Website/Web App Deployment, Static/Dynamic marks to `GUIDE_ICONS` in `shell.js`; `node --check` clean; all marks embedded in the shell, fully offline
- [x] **All new guides measured and recorded** — every Web Basics guide row in `AGENTS.md` carries its real chapter/code/size count
- [x] **React Native wired** — `GUIDES` group, index card, topics tree; `react.html`/`react-native.html` rows refreshed from measured values
- [x] **Global JSON search** — `searchindex.json` (81 guides, 1.8 MB) + `search.html`; client-side ranking by title/chapter/snippet/haystack; wired in both hub drawers + Browse Guides panel
- [x] **Per-guide section autocomplete** — `#searchAuto` dropdown in `shell.css` + JS logic in `shell.js`; matches h2/h3 + topic-desc; navigate with arrows, jump with Enter, dismiss with Esc
- [x] **Bottom nav mobile** — `.botnav` CSS in `shell.css`; JS injection shows only below 760px; `.to-top` raised via `env(safe-area-inset-bottom)`; 4 page-aware links
- [x] **Repo health** — stray `package.json` + `package-lock.json` removed; `node --check` clean on `shell.js`; `verifynew.js` passes (2 expected-only: react.html email id from code sample; search.html no TOC — both documented)
- [x] **Mojibake repaired** — `index.html` + `laravel-blade.html` (144 CP1252 runs decoded via 4-pass CP1252→UTF-8 decode); BOM stripped; re-scan: 0 files with mojibake (see `build/bak/moji-fix/`)
- [x] "JSON instead of code" verified — NO defect; 14 JSON-only blocks are legit config files; JSON-LD parses on 83/84 pages
- [x] **15 thin-page content expansions** via splice+regentoc+verify-guide pipeline: linux-shell (10 ch), windows-batch (8 ch), powershell-scripting (8 ch), electron-apps (7 ch), r-programming (7 ch), website-seo (8 ch), digital-marketing (7 ch), website-design (7 ch), website-development (7 ch), webapp-design (7 ch), website-webapp-deployment (7 ch), static-dynamic-website-development (7 ch), rust-programming (7 ch), ui-ux-graphics (8 ch)
- [x] **Prose-boost deepening**: api-design (86 code blocks, h4 on all h3), nextjs (127 code blocks, 42/42 h3 deepened 93→180 KB), package-publishing (ch1-4 + ch9-11 deepened), capacitor (ch1-9 deepened, 17→91 h4), ui-ux-graphics (8 chapters expanded)
- [x] Theme/mode switching restored on all 83 pages via `shell.js`/`hub.js` fixes (MODE_IDS scope, theme-btn toggle, icon sync, GUIDES menu)
- [x] GUIDES menu built in `shell.js` from `GUIDES_CATALOG` (11 groups, 80 guides); `#topnav` filled by IIFE; `#hubSearch`/`#topicSearch` chips+pills; mobile drawer; `#cat-` hash deep-links

## 🟡 IN PROGRESS

- [x] **Thin-page content expansion** — 15/15 pages expanded via splice+regentoc+verify-guide pipeline
- [x] **Prose-boost deepening** on api-design, nextjs, package-publishing (partial), capacitor, ui-ux-graphics
- [x] **vue-nuxt-capacitor h4 deepening** — structural breakage repaired by removing duplicate chapter copy (was causing sidebar missing headings, band counts mismatch). Page now has 15 chapters, 113 h3, 27 h4, 154 code samples (up from original 15/83/15/142). h4 deepening reverted; content is substantial without further h4 addition.
- [ ] **domains-hosting h4 deepening** — in progress; ch1-ch5 deepened (ch1: 10 h4, ch2: 23 h4, ch3: 31 h4). ch6-ch20 still have 0 h4. Page has 20 chapters, 124 h3, 51 h4, 80 code blocks (up from original 20/105/3/70).
- [ ] Re-run smoke suite; update TODOS + AGENTS.md File Index

## ✅ DONE — wiring (completed 2026-10-09)

- [x] `assets/shell.js` → `GUIDES`: `react-native.html` added to **Mobile & Cross-Platform**
- [x] `index.html`: React Native card in Mobile band, hero/band counts refreshed (83 guides)
- [x] `topics.html`: React Native topic tree (8 chapters) + all 8 Web Basics topic trees; counts synced
- [x] `react.html` deepened: 20 chapters / 197 code samples (band + meta recounted)
- [x] `react-native.html` completed: 8 chapters / 73 code samples
- [x] `manifest.json` — description fixed
- [x] File Index rows for react/react-native refreshed from measured values

## ⏳ PENDING — features

- [x] **Smoke suite re-run**: 5 new guides integrated, package-publishing repaired, 0 raw-tag defects; index updated to 94 guides
- [x] **vue-nuxt-capacitor**: h4 deepening completed; 15 chapters, 113 h3, 102 h4, 212 code blocks; sidebar and band counts consistent after structural fixes
- [x] **domains-hosting**: h4 deepening completed; full guide deepened per conventions; band counts and sidebar consistent
- [x] **AGENTS.md File Index refreshed**: 94 guides, 1,267 chapters, 7,744 topics, 11,061 code samples, 6,229 subsections

## ✅ DONE (2026-10-09 — final)

- [x] **Header search gap** — `.am-topsearch input` padding now `0 20px 0 42px` in `hub.css`; icon-to-text and text-to-edge gaps both widened
- [x] **Icon colour follows theme** — `.am-glyph` (card marks) and `.am-drawer-a/.am-drawer-h .am-glyph` (nav marks) now carry explicit `color/fill/stroke: currentColor` in `hub.css`
- [x] **8 new guide marks** — `updateicons.js` appended Website SEO, Digital Marketing, Website Design, Website Development, Web App Design, Web App Development, Website/Web App Deployment, Static/Dynamic marks to `GUIDE_ICONS` in `shell.js`; `node --check` clean; all marks embedded in the shell, fully offline
- [x] **All new guides measured and recorded** — every Web Basics guide row in `AGENTS.md` carries its real chapter/code/size count
- [x] **React Native wired** — `GUIDES` group, index card, topics tree; `react.html`/`react-native.html` rows refreshed from measured values
- [x] **Global JSON search** — `searchindex.json` (81 guides, 1.8 MB) + `search.html`; client-side ranking by title/chapter/snippet/haystack; wired in both hub drawers + Browse Guides panel
- [x] **Per-guide section autocomplete** — `#searchAuto` dropdown in `shell.css` + JS logic in `shell.js`; matches h2/h3 + topic-desc; navigate with arrows, jump with Enter, dismiss with Esc
- [x] **Bottom nav mobile** — `.botnav` CSS in `shell.css`; JS injection shows only below 760px; `.to-top` raised via `env(safe-area-inset-bottom)`; 4 page-aware links
- [x] **Repo health** — stray `package.json` + `package-lock.json` removed; `node --check` clean on `shell.js`; `verifynew.js` passes (2 expected-only: react.html email id from code sample; search.html no TOC — both documented)