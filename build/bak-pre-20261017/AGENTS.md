# AGENTS.md — Learn Software Engineering

## What This Repo Is

A static, zero-dependency knowledge library for software engineering topics. One `.html` file per topic, with all styling and client behaviour coming from **two shared asset files**. No build step in the shipped output, no framework, no package manager, no CDN.

**78 pages: 2 hubs + 76 guides.** Work state lives in **`TODOS.md`** — read it before starting work, update it when done.

## Architecture at a Glance

| Layer | Details |
|---|---|
| **Entry point** | `index.html` — the landing page. Linked from every header on all 74 pages. |
| **Topic index** | `topics.html` — every chapter in the library, searchable, each linking to its anchor. |
| **Guides** | 72 `.html` files, one per technology. |
| **Launcher** | `CMD.bat` — runs `start`, opening `index.html` in the default browser. |
| **Shared CSS** | `assets/shell.css` — brand tokens, guide chrome, nav, scrollbars. |
| **Hub CSS** | `assets/hub.css` — only the two hub pages. Loaded *in addition to* `shell.css`. |
| **Shared JS** | `assets/shell.js` — TOC, search, theme, progress, back-to-top, nav. |
| **Hub JS** | `assets/hub.js` — only the two hub pages. |
| **Brand art** | `assets/brand/logo.png`, `assets/brand/hero.jpg`, rebuilt by `assets/brand/build-assets.ps1`. |
| **SEO** | `robots.txt`, `sitemap.xml`, `manifest.json` at the repo root. |
| **Fonts** | JetBrains Sans + Mono, base64-embedded inside `shell.css`. |
| **Task tracking** | `TODOS.md` — the master work list (DONE / ONGOING / PENDING). Read it before starting work; update it when done. |
| **Temp / build work** | `build/` — scripts in `build/`, scratch in `build/tmp/`, backups in `build/bak/`. Never outside this repo. |

## Task Tracking — TODOS.md

**`TODOS.md` is the master work list and the source of truth for state.**

- Every piece of work — feature, fix, wiring, cleanup — is recorded there under **DONE** (dated), **ONGOING** (in flight, with owner), or **PENDING** (queued, with its blocker).
- This file holds the *invariants*; `TODOS.md` holds *what is being built right now*.
- An agent starting work: read `TODOS.md` first, pick the task, move it to ONGOING while you work.
- An agent finishing work: close the task in `TODOS.md` in the same change — untracked work gets redone or lost.
- New tasks never bypass `TODOS.md`; if it is not noted there, it does not exist.

## File-Naming Convention

- All-lowercase, hyphen-separated: `laravel-vue.html`, `dotnet-vue.html`, `vue-nuxt-capacitor.html`
- One file = one technology/topic
- `<title>` follows `"<Subject> - <Descriptor>"`, unique across all 74 pages

## Anatomy of a Guide File

```
<!DOCTYPE html>
<html lang="en" data-theme="dark" data-mode="default">
<head>
  <!-- 1. ${seoHead}: title, description, canonical, OG, Twitter, favicon,
          manifest, theme-color and JSON-LD. See "SEO" below.
          Emitted by build/seo.js - never hand-edit. -->
  <meta charset="UTF-8">
  <meta name="viewport" ...>
  <link rel="stylesheet" href="assets/shell.css">      <!-- not inline CSS -->
  <!-- 2. tiny inline <script> that resolves BOTH saved axes before first paint:
          data-theme (light|dark) and data-mode (one of ten). Both attributes
          are also on <html> so the page is correct with no JS at all. -->
</head>
<body>
  <!-- 3. <header class="top"> — burger, the brand lockup, nav, the theme
          toggle, and the colour-mode button beside it (#modeBtn + #modePop).
          The lockup is byte-identical on all pages. -->
  <!-- 4. <aside id="sidebar"> — TOC pre-rendered as <nav id="toc"> -->
  <main id="content">
    <h1 class="am-band">          <!-- the page's single h1; see "Headings" -->
    <section class="chapter">
      <h2 id=".." data-toc>Top-level section</h2>
      <div class="ch-toc">...</div>
      <h3 id=".." data-toc>Sub-section</h3>
      <h4>Minor heading</h4>
      <div class="codeWrap"><pre><code>…</code></pre></div>
      <div class="tip|warn|note">…</div>
      <div class="ex">…</div>
    </section>
  </main>
  <button id="toTop" class="to-top">…</button>          <!-- floating; see below -->
  <footer>…</footer>
  <script src="assets/shell.js" defer></script>
</body>
</html>
```

## Critical Invariants

When editing or creating a guide, **never break these**:

1. **Colours come from tokens.** Never hard-code a colour; use `var(--*)`. Every token has a `[data-theme="dark"]` counterpart.
2. **Header lockup is identical on all 74 pages.** `logo.png` → `Amin` → `360iT` → chevron → page name. Edit it in `assets/shell.css` and the generators, never one file.
3. **Class prefix is `am-`, tokens are `--am-*`.** The old `w3-` / `--ws-` prefixes are gone.
4. **Code blocks**: `<div class="codeWrap"><pre><code>…</code></pre></div>`, entity-escaped once, never hand-highlighted.
5. **Callouts**: only `tip` / `warn` / `note`.
6. **Shared shell**: CSS and JS live in `assets/shell.css` / `assets/shell.js`. Never fork copies into a page.
7. **Generated pages come from generators.** `index.html`, `topics.html` and four guides are built. Edit the generator, never the output.

## Headings

**Every page has exactly one `<h1>`, and it is the first heading in `<main>`.**

- Guides and the two hub pages carry a **visible** title band:
  ```html
  <h1 class="am-band">
    <span class="am-band-t">Flutter</span>
    <span class="am-band-s">20 chapters · 175 topics · 245 code samples · works offline</span>
  </h1>
  ```
  It sits immediately after `<main id="content">`, before the first `<h2>`, and is styled by `.am-band` in `shell.css`.
- Historically 56 of 58 pages had no `<h1>` at all and jumped straight to `<h2>`. Do not reintroduce that.
- `.vh` (visually hidden) exists for text that must be announced but not seen — used once, to separate the site name from the page name in the lockup so a screen reader does not read "Amin360iTFlutter".

## Brand (Amin360iT)

The site is themed from two brand assets. **Do not substitute colours by eye — sample them from the artwork.**

| Asset | Use |
|---|---|
| `assets/brand/logo.png` | The `A360` mark in the header. Trimmed to its content box, 160 px tall, transparent. `alt=""` because the site name sits beside it as real text. |
| `assets/brand/hero.jpg` | The key visual. **Not** a page background — it is the `og:image` and the JSON-LD `image`. Kept on disk; see "Why the hero is text-only". |

Source art at the repo root: `amin360it-logo.png`, `Amin360iT BG (2).png`. Do not delete them. The processed files are 46 KB + 116 KB versus 2 MB of source; regenerate with `assets/brand/build-assets.ps1` (PowerShell + System.Drawing).

**Sampled ramp** — the whole palette:

| Role | Hex | Source |
|---|---|---|
| deep navy | `#021336` | key-visual background field |
| navy | `#011842` | key visual |
| mid navy | `#012A66` | key visual |
| brand blue | `#034DB8` | wave reflection |
| azure | `#009CFF` | brightest blue in the mark |
| cyan-blue | `#00A6FE` | `360iT` wordmark gradient |
| **brand cyan** | `#00D1FF` | accent cyan |
| highlight cyan | `#00F7FF` | wordmark highlight |

**The two-token rule.** Never reach for one "brand colour":

- `--accent` carries **text** on the page background, chosen for contrast. Light `#0b5fbf`, dark `#4dd2ff`.
- `--brand` carries **surfaces**: button fills, the active sidebar row, heading rules. `--brand-ink` is whatever reads on it — white on the light theme's `#0267b2`, deep navy `#03203f` on the dark theme's `#00d1ff`. The split exists because `#00F7FF` is only 2.1:1 against white and cannot carry body text.

### Brand rules

1. **Dark is the default.** The key visual is a dark navy field, so a first-time visitor gets dark: `<html data-theme="dark">` and a pre-paint fallback of `'dark'`. A theme the reader picked is stored under `amin360it-theme` and always wins. If you add a page, copy the pre-paint script from a sibling — do not write `prefers-color-scheme` back into the fallback.
2. **Contrast is computed, not assumed.** After changing any token, run `contrast.js`. All pairs clear WCAG AA (4.5:1 text, 3:1 UI edges) in both themes. Current worst case: 5.69:1 light, 8.58:1 dark.
3. **The wordmark is split to match the artwork.** Markup is `logo-brand > logo-b1 + logo-b2`. Two protections:
   - It re-declares `font-family: var(--font-sans)`. The repo styles `.logo` in `--font-mono` (shared rule with `h1..h4` and `.btn`), but the artwork is sans, and mono fights the tight letter-spacing. The override out-specifies that rule 21 to 10.
   - **The gradient must never make the text invisible.** `-webkit-text-fill-color: transparent` renders the wordmark as *nothing* where `background-clip: text` is unsupported, because the fill colour overrides `color`. So `.logo-b2` carries a solid `color` as its base state and the gradient is applied **only inside `@supports ((-webkit-background-clip:text) or (background-clip:text))`**. Use `background-image`, never the `background` shorthand — it can reset `background-clip` in some engines. Verify with `verifywordmark.js`.
4. **The logo mark is artwork, not a UI colour.** It is mostly light cyan: faint on paper, dull on navy. It is tuned per theme by `--brand-logo-filter` (darken + saturate on light, lift on dark). Change the token, not the `filter` declaration, or the themes drift apart.
5. **The back-to-top button is styled only by `.to-top`, never `.btn`.** `header.top .btn` carries `height:100%`; on a `position:fixed` element that resolves to full viewport height. Keep them separate.
6. **Never de-duplicate words blindly.** `AAAA` (the IPv6 DNS record type), `PyPy` and `mutmut` genuinely repeat. A blanket fix turns them into `A`, `Py` and `mut`. `doubledfix.js` carries an explicit allow-list; extend it, do not remove it.
7. **No literal `{` or `}` in any CSS comment.** Five verifiers count braces with a naive loop that does not skip comments, so one brace inside a comment makes all of them report the 775 KB stylesheet as unbalanced. This cost a real detour: the mode-control block documented `::-webkit-scrollbar {` in prose and broke the brace check. `modecss.js` reports both counts for exactly this reason.

## Colour Modes

The site has **two independent axes**, not one:

| Attribute | Values | Meaning |
|---|---|---|
| `data-theme` | `light` \| `dark` | the **lightness** axis. Unchanged since launch. |
| `data-mode` | `default`, `nord`, `dracula`, `tokyo`, `rose`, `gruvbox`, `mocha`, `solar`, `paper`, `midnight` | the **colour** axis. Ten palette families, each with its own light and dark variant. |

Keeping them orthogonal is deliberate. Folding them together would have meant either twenty `data-theme` values — breaking the pre-paint script, `finalcheck.js` and every page's markup — or discarding the two-valued attribute that five verifiers depend on. Orthogonal, a new mode is one palette block and nothing else changes.

- **Storage**: `amin360it-theme` and `amin360it-mode`, both read by the pre-paint bootstrap in `<head>`.
- **Defaults**: dark and `default`. A first-time visitor sees exactly what they saw before the modes existed.
- **Control**: `#modeBtn` sits beside `#themeBtn` in the header. Its popover (`#modePop`) is built by `shell.js` from its own `MODES` array, so the ten rows are not duplicated across 74 pages and cannot drift from the CSS.
- **Source of truth**: `build/modes.js`. Each palette is 14 hand-picked **anchors** (hues); the other 21 tokens are derived by one documented rule each. Every text-bearing token is then *solved* against the surface it is painted on, so the anchors express hue and the generator guarantees contrast.
- **Generated into `assets/shell.css`** as the last block, twenty blocks of 35 tokens. Not a second stylesheet: `seoverify.js` asserts an exact head-tag count per page, so a `<link>` would fail 74 pages for no benefit.

### The code-block bug this fixed

Light mode had **no light code theme at all**. `:root` — which *is* the light theme — declared `--code-bg: #0a1a33`, a dark navy, and `--code-text`, `--code-s`, `--code-k` and `--code-n` were **byte-identical** to the dark theme's values. Five of the seven code tokens were dead tokens, and the block never changed appearance when the theme flipped.

Both axes are now correct independently: `:root` carries a real light code block and `html[data-theme="dark"]` a dark one, so a page with no `data-mode`, no JavaScript, or a blocked `localStorage` read is still correct. The mode blocks override a correct base rather than masking a wrong one. `verifymodes.js` asserts exactly this.

### Rules for modes

1. **Change `modes.js`, never `shell.css` by hand.** The palette region is generated. Re-run `node modes.js --write`.
2. **Anchors are hues; `reconcile()` owns contrast.** If a mode fails, move an anchor rather than typing a hex into the output.
3. **Every block declares all 35 tokens.** A mode that declares 34 is a half-switched page, which looks like a bug report and is impossible to diagnose later.
4. **A mode id lives in three places**: `PALETTES` in `modes.js`, `MODES` in `assets/shell.js`, and an `html[data-mode="…"]` selector in `shell.css`. Nothing compares them except `verifymodes.js`. Run it.
5. **The generators must carry both axes.** `gen2.js` and `buildhub.js` emit `data-mode="default"` on `<html>`, the two-axis bootstrap, and the mode button. Editing a generated page directly is lost on the next build.
6. **Match the file's tight brace style for `::-webkit-scrollbar`.** `verifyscroll.js` now tolerates whitespace, but the convention is no space before the brace.
7. **The colour-mode control is generated by `build/modecss.js`, not hand-written.** `modecss.js` replaces its own block on each run and appends it at the end of the sheet, so edits made directly to `.mode-*` in `shell.css` are lost. It truncates from its own marker comment to EOF and **refuses** if the tail no longer contains everything it introduced — so anything appended after that block must be moved, not just re-saved.

### The header control order is pinned by CSS, not DOM

The two right-hand controls — `#themeBtn` (light/dark) and `.mode-wrap` (the mode dropdown) — are pinned explicitly with `order`, because DOM order differs between the hub and the guides:

```
header.top #burger{order:-1;}   header.top .spacer{flex:1; order:1;}
header.top .logo{order:0;}     header.top #themeBtn{order:2;}
header.top .topnav{order:0;}   header.top .mode-wrap{order:3;}
```

`.mode-wrap` had **no** `order` of its own. It therefore inherited `0` and rendered among the left-hand items, putting the mode dropdown to the **left** of the light/dark button with the expanding gap between them — visually "the dropdown sits before the toggle", which is the opposite of the intent. A missing declaration silently joining the wrong group is the whole failure mode here; an absent `order` is never an error.

Note `.mode-wrap > .btn` and `#themeBtn` both resolve `height:100%` from `header.top .btn`, and `.mode-wrap` carries `align-self:stretch` for the same reason. If you ever move the popover anchor, re-check that the popover's `right:0` still resolves against `.mode-wrap`.

### Why the hero is text-only

The hero deliberately does **not** use `hero.jpg` as a background. That image has the logo, the wordmark, the tagline and all four pillars baked into its pixels, so using it repeated the entire brand block about 100 px below the header. It also cost 116 KB, needed a 78–94 % black scrim to stay readable — which hid the globe and the waves — and its baked-in white text forced the hero dark in **both** themes, so light mode could never apply. The brand is carried by the header lockup instead, and the eyebrow is the one place the tagline appears. `hero.jpg` is still the social-card image.

## Scrollbars

Themed once in `assets/shell.css`, for two engines:

- **Firefox**: `scrollbar-width: thin` + `scrollbar-color` on `html` and on every scrolling region.
- **Chromium / WebKit**: the `::-webkit-scrollbar` family — track, thumb, corner, hover, active.

Tokens: `--scroll-size`, `--scroll-size-h` (theme-invariant, `:root` only), and `--scroll-track`, `--scroll-thumb`, `--scroll-thumb-hov`, `--scroll-thumb-active`, `--scroll-thumb-border` (both themes).

Covered regions: `nav#toc`, `.topnav .tn-scroll`, `.am-side-nav`, `.am-drawer`, `.am-tlist`, `.codeWrap pre`, `.table-scroll`, `table`, `.mode-pop`.

**Adding a scrolling region means adding it to both groups in the same block.** Do not add a private scrollbar rule elsewhere. The thumb **must clear 3:1 against its own track** (WCAG 1.4.11) or it is invisible to anyone with low vision — that is why `--scroll-thumb` is a full brand blue rather than a tint. The base themes are 8.81:1 light and 12.61:1 dark; `modes.js` solves every mode to at least 3.1:1. Verify with `verifyscroll.js`.

## Corner Scale

Every control is rounded on one three-step scale, declared once in `:root`:

| Token | Value | For |
|---|---|---|
| `--radius-xs` | `3px` | inline `code`, badges, tiny counts, swatches, colour-mode dots |
| `--radius` | `4px` | **the control radius** — buttons, inputs, chips, cards, tiles, icon squares |
| `--radius-lg` | `5px` | large surfaces — code blocks, tables, popovers, chapter TOCs, bands |

**Use `var(--radius)`, never a literal.** The two stylesheets previously carried nine different values — 0, 2, 3, 4, 5, 6, 8, 10 and 12px — and the *spread* was the defect, not any one value: a 3px chip beside a 6px button beside a 12px popover reads as three unrelated components rather than one library. Every individual value was legal CSS, so nothing caught it. `verifyradius.js` now asserts all 43 declarations are on the scale.

Three things are **deliberately not** on the scale, and each is a shape rather than a missed rounding:

- `.to-top` at `50%`, `.am-pill` at `999px`, `.am-chip-n` and every scrollbar thumb at `99px` — circular controls.
- `header.top .btn` at `0` — flush with the header edge; a rounded corner there would expose the page behind it.

These tokens live in `:root` and **must not** appear in any of the 20 palette blocks. A corner is not a colour: it does not change with the theme or the colour mode, and a mode that redefines it is a bug waiting to happen. `verifymodes.js` only checks that `:root` is *missing* no palette token, so adding non-palette tokens there is safe and `modes.js` stays untouched.

## Per-chapter Contents

Every chapter with sub-headings carries a `.ch-toc` block directly after its `<h2>`: a `.ch-toc-head` button that toggles `.collapsed`, and a `.ch-toc-list` of links. It is pre-rendered into all 72 guides, with `shell.js` building it at runtime only as a fallback.

The list is **vertical, one entry per line**, with a spine-and-node rail drawn in CSS. It was once `grid-template-columns:repeat(auto-fill,minmax(280px,1fr))`, which is wrong here: a chapter's contents is a *sequence* (3.1, then 3.2), and a row-flowing grid put 3.1 beside 3.3, so reading order stopped matching document order — and every individual declaration was legal CSS, so nothing caught it.

### Invariants

`.ch-toc-list` must agree with the chapter's own `h3[data-toc]` headings:

1. **Order** — document order, no exceptions.
2. **Completeness** — every `h3[data-toc]` is listed exactly once.
3. **Number parity** — an entry's section number equals its heading's. Twelve `vuejs` chapters leave the number out of both the heading and the sidebar on purpose; a number the entry already carries is kept.
4. **Entries are plain text.** A heading may carry `<code>` (`php.html`'s "The type system and `strict_types`"); a navigation label must not, or it is the one entry that renders differently.
5. **Text may be abbreviated** — "11.5 Dates, numbers and plurals" for a heading reading "Dates, times, numbers and currency" is fine. Numbers may not.

### Hover underline: there isn't one

Contents entries are **never** underlined — not at rest, not on hover. This block was once the other way round, and the rule was defended here for a long time on the grounds that every other link in the library underlines. That reasoning was wrong, and it is worth recording why it was wrong, because the same argument will be made again.

The argument was: prose links underline, so a Contents entry should too, or it is the odd one out. But prose and navigation are different objects. In a paragraph a link has to be recognisable *before* the reader reaches it, because the surrounding text is what they are reading. A Contents entry has no such problem: the entire row is the hit target, every sibling row is a link too, and they are all one colour, so there is nothing to disambiguate. What the underline bought was nothing; what it cost was visible — a line under each of twelve stacked labels reads as a ruled table and buries the spine-and-node rail, which is the only thing carrying the sequence.

So the hover signal is carried three ways instead of one: the row fills with `--accent-soft`, the text lifts to `--text`, and the node fills with `--accent`. `text-decoration: none` is declared explicitly rather than left to inherit, because the block sits inside `main#content` and must stay immune to a future change to the prose scope.

The sidebar `nav#toc a` and `.topnav .tn-link` never underlined either, for the neighbouring reason that both fill the entire row with `--brand` and switch the text to `--brand-ink`, so a line under the text would be invisible against it.

`verifychtoc.js` now asserts the **inverse** of what it used to: it fails if an underline reappears in any state, and it also fails on a leftover `transition: text-decoration-color`, because a transitioned decoration with no decoration is the signature of this rule being half-reverted.

**Do not hand-edit these blocks.** Regenerate them: `node fixtoc.js --write` rebuilds every block from its chapter's headings, and `node fixnumbers.js --write` resequences a chapter's `h2.N` headings and syncs the sidebar when sections have been removed and the numbers were never closed up. Both are dry-run by default. Verify with `verifychtoc.js`.

Both tools use **function** replacements (`s.replace(x, () => y)`). A string replacement interprets `$'`, `$&`, `$1` and `$$`, and these files are full of code samples — `dart.html` contains a Dart regex literal `r'^\d+$'`. Passing a string once appended the rest of the file to four chapters: `dart.html` went 378 KB → 671 KB with 14 duplicate heading ids. `verify.js`'s duplicate-id check is what caught it.

## SEO

Everything is generated. **Never hand-edit a `<title>`, description or canonical tag.**

Source of truth is `build/seo-config.json` (outside the repo):

```json
{
  "siteUrl": "https://amin360it.github.io/quick-guides",
  "ogImage": "assets/brand/hero.jpg",
  "themeColorDark": "#03122f",
  "datePublished": "2026-01-01",
  "dateModified": "2026-10-02"
}
```

Change `siteUrl` there and re-run the generators. It feeds canonical, `og:url`, `robots.txt` and `sitemap.xml`.

**`build/seo.js`** is the single builder, used by `gen2.js`, `buildhub.js` and `seopatch.js`, so a tag cannot drift between pages. Per page it emits:

- `<title>` — unique, 20–65 chars
- `<meta name="description">` — unique, 148–156 chars (measured, not estimated)
- `rel="canonical"`, `robots`, `author`, two `theme-color` (one per scheme), inline-SVG `icon` and `apple-touch-icon`, `rel="manifest"`
- full Open Graph incl. `og:image:width/height/alt`, and `article:*` on guides
- full Twitter / X card, `summary_large_image`
- JSON-LD — `TechArticle` + `hasPart` per chapter + `BreadcrumbList` on guides; `WebSite` (with `SearchAction`) + `CollectionPage` + `ItemList` + `BreadcrumbList` on the hubs

Root files: `robots.txt` (allow all + sitemap), `sitemap.xml` (74 URLs, hubs weighted highest), `manifest.json`.

### Every title-shaped field must be unique

The library contains **same-subject pairs** — `aspnet-core` / `aspnet-core-advanced`, `laravel` / `laravel13-advanced`. Both were once shipped with `og:title` "ASP.NET Core 10" / "Laravel 13", a visible h1 band of "ASP.NET Core 10", and a `TechArticle.name` of "ASP.NET Core 10". No check caught it, because only `<title>` and the description were being tested for uniqueness.

**Every field that names the page now carries the full unique `browserTitle`, never the stripped subject:**

| Field | Source |
|---|---|
| `<title>` | `browserTitle` |
| `og:title`, `twitter:title` | `browserTitle` |
| `TechArticle.headline`, `.name` | `browserTitle` |
| breadcrumb level 3 | `browserTitle` |
| visible `.am-band` h1 | subject + distinguishing word |

That is why `seo.js` resolves `ogTitle` as `page.ogTitle || page.browserTitle || page.title` — a caller that omits `ogTitle` gets a unique value. **Do not pass a stripped subject as `ogTitle`.** `buildhub.js` is the one place that still does, which is safe because the two hub titles are distinct.

The visible h1 is the exception: a bare subject reads better than a full title, so the **primary** guide keeps it (`ASP.NET Core 10`) and a **companion** guide appends its distinguishing word (`ASP.NET Core 10 — Advanced`). The word is taken from the descriptor in the `<title>`, not hard-coded, so a new pair is handled automatically.

`seoverify.js` asserts uniqueness on titles, descriptions, `og:title`, `twitter:title` and h1 band labels. If you add a guide, that is the check that will tell you.

Verify with `seoverify.js`. It enforces 24 head tags per page, title and description uniqueness, description length, JSON-LD validity and node types, sitemap completeness, exactly one title/description/canonical per page, and an `h1` before the first `h2`.

**Off-page SEO is not something code can do.** The library was built to open from disk; it only exists to a search engine once served from the real domain. Then: submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools, and earn links. On-page work is the half that is in scope here.

## Adding a New Guide

1. Copy an existing guide as a template.
2. Replace `<title>`, the body content and the `chapter` sections.
3. Keep the header lockup byte-identical and add a `.am-band` `<h1>`.
4. Keep **both** axis attributes and both header controls. Copy them from a
   sibling, do not retype them:
   - `<html lang="en" data-theme="dark" data-mode="default">`
   - the two-axis pre-paint `<script>` in `<head>`
   - `<div class="mode-wrap">` with `#modeBtn` and `#modePop`, after `#themeBtn`
5. Do **not** inline or fork `shell.css` / `shell.js`.
6. Pre-render the sidebar `<nav id="toc">` and each chapter's `<div class="ch-toc">` from the `data-toc` headings.
7. Link it from `index.html` and from `topics.html` — then run `seopatch.js` for the SEO block and the sitemap entry.
8. Add it to the `GUIDES` array in `assets/shell.js`.
9. Add it to the AGENTS.md file index.
10. Run `verifymodes.js` and confirm it still passes.

## Rebuilding Generated Pages

| Output | Built by | From |
|---|---|---|
| `capacitor.html`, `vue-nuxt-capacitor.html`, `dart.html`, `flutter.html` | `gen2.js` | `build/<name>/*.html` fragments + `meta.json` |
| `index.html`, `topics.html` | `buildhub.js` | `build/hub.json` + `build/new4.chapters.json` |
| the other 52 guides | `seopatch.js` | edited in place, once |

Order matters: `gen2.js` and `buildhub.js` regenerate their outputs, so **any manual edit to a generated page is lost on the next build.** The 52 non-generated guides are patched in place by `seopatch.js`, which is idempotent — it skips a page whose `<head>` already has a canonical.

`hub.json` and `new4.chapters.json` are extracted snapshots. If a guide's headings change, re-extract before rebuilding, or the hub's chapter links drift from the guides.

## Verifiers

Run from `build/`. All must pass before a change is done.

| Script | Checks |
|---|---|
| `finalcheck.js` | 74 pages: brand tokens + contrast, lockup uniformity, theme default, back-to-top, links/anchors, index-nav-disk parity, TOCs, hub leanness, CSS integrity |
| `seoverify.js` | SEO: 24 head tags per page, uniqueness, description length, JSON-LD, sitemap, one `h1` before the first `h2` |
| `verifyhub.js` | Hub selector/JS alignment, tag balance, styled classes, resolvable hrefs |
| `verifymodes.js` | Ten colour modes consistent across `modes.js`, `shell.js` and `shell.css`; 20 palette blocks of 35 tokens; the base `:root` / dark blocks correct **without** `data-mode`; both generators carry both axes; cascade order |
| `verifyradius.js` | Corner scale: every `border-radius` in both sheets is one of the three declared tokens or an intentional circular shape; no palette block redefines a radius |
| `verifychtoc.js` | Per-chapter Contents block: is vertical, spine and node drawn, **no underline in any state**, focus ring inset against `overflow:hidden`, touch targets; and across all guides — every href resolves, no duplicate target, every entry plain text, entry number matches its heading, every `h3[data-toc]` listed, correct order |
| `verify.js <file>` | One guide: shell wiring, TOC↔heading parity, duplicate ids, dead anchors, single escaping, callout classes |
| `verifyscroll.js` | Scrollbar tokens, both engines, every region, thumb/track contrast |
| `verifywordmark.js` | Split wordmark: typeface, specificity, `@supports` guard, fallbacks |
| `respcheck.js` | Responsive nav rules, drawer reset, 44 px touch targets |
| `contrast.js` | WCAG AA for every brand pair, both themes |
| `toccheck.js` / `navcheck.js` | Pre-rendered TOCs complete; top nav matches disk |
| `audit2.js` | Whole-repo link and anchor integrity |
| `verifydoubled.js` | No unexpected doubled prose words remain |
| `codeesc.js` | Every code sample in every guide: a literal tag inside one is parsed as markup, a doubly-escaped entity renders as entity text, a bare ampersand is invalid. `&amp;amp;` is always an error; `&amp;lt;` is a warning, because a sample *demonstrating* escaped output must write it doubly |
| `depthcheck.js` | Depth: prose bytes, code-sample count and nesting per section, per guide and library-wide. Ratchets against `depth-baseline.json` and fails only on a regression |
| `veriflinks.js` | Prose-link treatment: the resting underline clears 3:1 and the hover colour 4.5:1 in **all 22 palettes**; `:visited` spends no contrast; the rule is scoped away from the chrome links |
| `tagcheck.js` | Tag nesting by stack, for every tag: a `</td>` where a `</th>` belongs reports nine faults, only the first of which is real. Resyncs at a mismatch so one fault cannot hide the rest |
| `mainopen.js` | Every guide closes its `<main id="content">`. A guide whose `main` is unclosed reports **zero** headings, which is indistinguishable from a guide that has none |
| `repeats.js` | No code sample contains a second copy of its own opening text. The invariant check for anything that rewrites a guide — see "Repair tools" |
| `closefix.js` / `dropstray.js` | Repair a misclosed callout or a stray closer, asserting the exact byte change and refusing to write if it differs |
| `codeesc.js --fix` | Escapes literal tags and bare ampersands in code samples, refusing any block that would shrink |

## Repair tools

A tool that rewrites a guide is more dangerous than a tool that reads one,
because a defect in it is invisible in its own output and lands in the shipped
library. `codeesc.js --fix` did that here, and the cost was a day.

The bug was one missing field. It pushed a hit with no `len`, and the
replacement was

```js
out = out[0:at] + escapeAttrs(out.slice(at, at + hit.len)) + out.slice(at + hit.len)
```

`slice(x, undefined)` is `slice(x, 0)`, and `slice(NaN)` is `slice(0)` — so
`slice(at, NaN)` returned nothing and `slice(NaN)` returned **the whole sample**.
Every application re-emitted the file's content behind itself. Run twice over a
sample with two bare ampersands, it produced four copies; across 6,158 samples
it produced 587 duplicated blocks and deleted real text in the process.

Nothing caught it. `verify.js` checks the section skeleton, `finalcheck.js`
checks links and tokens, `tagcheck.js` found the document *consistently* nested
because a stray `</div>` closes a real `<div>`, and a browser silently
reparents misclosed content so the page still looked right.

Four rules follow, and they are why `repeats.js` exists:

1. **Every replacement carries its own length.** Never rely on a length being
   present. `hit.len === undefined` must not be able to reach `slice`.
2. **Drop overlapping hits before writing.** An ampersand can sit inside a
   tag's own span, and two hits describing overlapping text will delete the
   wrong number of bytes once one of them has been rewritten.
3. **Never `slice(x, NaN)`, and never `slice` from a computed offset without
   asserting it.** `String.prototype.slice` treats `NaN` as `0` rather than
   throwing, so a bad offset silently becomes "from the start" or "empty".
4. **Check the invariant, not the intent.** `repeats.js` asserts that no code
   sample contains two copies of its own first 200 characters. Run it after any
   tool that writes to a guide, not only after the ones you expect to change
   something.

### Every repair tool asserts its own effect

Rule 4 is about what the tool did not intend to touch. There is a fifth rule,
about the tool doing exactly what it intended — and it is the one that was
learned the hard way, because four successive repair tools for the same
one-character class of fault each got it wrong in a different direction:

| Attempt | How it went wrong |
|---|---|
| repair by line-ending pattern | over-corrected a multi-line callout and closed a container that was already closed |
| repair by stack walk, stopping at the first mismatch | a file with several faults got none of them fixed |
| repair with a truncated closer match | matched every correct header cell as well, so 155 good ones became `</th>>` |
| repair with no check on the result | wrote a **zero-byte** `javascript.html` and reported success |

So `closefix.js`, `dropstray.js` and `codeesc.js --fix` all refuse to write
unless the file's size moved by exactly the amount the intended edits imply:
`</p>` → `</div>` is +2 bytes per fix; dropping a line is that line's length;
escaping can only ever grow a file, so a block that shrinks is refused
outright. `dropstray.js` takes a **line number** rather than a pattern, because
a line that is only `</div>` is normal and every pattern version of "remove the
stray closer" either removed a legitimate one or removed nothing.

**Take a full snapshot before running any tool that writes.** `build/bak-green/`
holds the last state that passed the whole suite, all 63 pages plus
`assets/`. `sizes.js` compares the file index against the pages on disk and is
the cheapest early signal that something has been doubled or emptied.

Recovery notes, because the shape of the damage decides the shape of the fix:

- **`undup.js`** collapses a duplicated sample back to one copy. The copy
  boundaries are decidable from the file alone — a re-emitted copy can only
  start where the sample's own opening text already appears — so the copy length
  is the common gap between boundaries, and the surviving text is the *most
  common* copy rather than the first. It **refuses** a block where no two
  windows match, because that means the bug deleted a tail and arithmetic
  cannot bring it back. A wrong collapse loses a real sample; a left duplicate
  loses nothing.
- **`usewindow.js` / `repairblock.js`** handle the three blocks arithmetic
  cannot: a nested duplication, where the widest window between two boundaries
  is the only complete copy, and a sample whose deletions landed in a different
  place in each copy — where the last run through the sample is the whole one.
- **Generated guides are free.** `gen-all.js` rebuilds the nine guides that come
  from `build/<key>/`, so damage to them is undone by regenerating. Fixes belong
  in the **fragments**, not the output, or the next build loses them.
- **A patched-in-place guide needs a backup before any repair tool runs.**
  `wpb.bak`, `php.html.bak` and `tnb.bak` are older than the guides they
  shadow — restoring one of them silently rolled a guide back by a chapter.

### What `repeats.js` found

The duplication was not only today's. `fixdoublescape.js` and
`patchdoublescape.js`, both written on 2 October, had left **every** code sample
in `sqlserver.html`, `postgresql.html` and `vuejs.html` holding a second copy
of itself — 587 blocks in all. `sqlserver.html` was recorded in the file index
at 1,981 KB and is 918 KB now; `postgresql.html` went from 926 KB to 509 KB;
`vuejs.html` from 1,332 KB to 613 KB. Nothing noticed, because a duplicated
sample is still a valid, readable sample.

So the file index in this document was, until `writeindex.js` regenerated it,
recording damage rather than size. `sizes.js` compares the table against the
pages on disk and is the check that a repair tool has not quietly doubled a
guide again.

## Depth

**Depth is the specification, not chapter count.** A guide with 40 sections of
600 bytes is a worse guide than one with 15 sections of 3,000, and nothing in
the suite used to notice. `depthcheck.js` measures it and ratchets it.

Measured **prose only** — code blocks and tables are stripped before counting,
because a section that is long because it embeds a large code sample is not a
deep section. Getting this wrong initially reported `csharp.html` as healthy at
3.5 KB per section when its prose median was 826 bytes.

| Floor | Value | Why that number |
|---|---|---|
| Prose per section | 1,500 B | `python.html`'s median is 2,402 B and **not one** of its 112 sections falls under 600. 1,500 is a floor, not a target. |
| Code samples | 2 | `html`, `css` and `javascript` each averaged under one per section. A construct shown but never run is a description. |
| Nested sub-headings | 1 | `h4` **or** `h5`. The library had 0.22 per section and **zero `h5` elements across 63 pages**. |

Exemptions are narrow and listed in the script: a glossary, an orientation
page, a further-reading list. Padding those would make them worse.

### Nesting needed a level to exist

There were **zero `h5` elements in 63 pages** and no CSS rule for one, so a
guide could not express a third level of nesting at all. `h5` is now styled —
smaller and dimmer than `h4`, so the eye reads depth rather than another peer
heading.

`data-toc` stays on `h2`/`h3` **only**. `verifychtoc.js` asserts every
`h3[data-toc]` appears in the Contents block, so tagging `h4` would expand all
971 blocks at once. Nav stays three deep, as MDN does.

### Rewriting a section: `patchsec.js`

Never retype a whole section by hand to deepen it. `node patchsec.js
<guide.html> <edits.js>` replaces whole `h3` sections **by id**, from a data
file exporting `[{ id, html }]`.

It exists because the first attempt at this work corrupted a chapter, and
every guard in it is there because of a specific failure:

- **Stops at `</section>`, not just the next heading.** The last subsection of
  a chapter otherwise ran its span straight through `</section><section>` and
  swallowed the next chapter's opening tag. `html.html` went from 12 chapter
  sections to 11; `verify.js` caught it.
- **Applies back to front.** Spans are measured against the original string,
  so once one section changes length every later offset is wrong. The sections
  do not overlap, so replacing the last one first leaves earlier offsets valid.
- **Checks every id before writing anything**, so a typo in the last edit
  cannot leave a file half-patched.
- **Duplicate ids are counted only on real elements.** Matching `id="..."`
  counted ids inside code samples, where no element exists, and rejected three
  batches of valid work over the ordinary names `email`, `qty` and `confirm`.
- **The skeleton check covers structure only** — sections, `h2`, `h3`,
  `</section>`, `ch-toc`. Code blocks and tables were in that list first and
  aborted legitimate rewrites: adding a code sample or a table is the entire
  point.
- **Function replacers everywhere**, per the `fixtoc.js` rule.
- **Backups go to `build/bak-depth/`, never beside the guide.** A `.html` file
  in the repo root is part of the shipped library; a backup left there was
  picked up by `depthcheck.js` and the library silently grew a duplicate page.

### Writing an edits file: `lint-edits.js`

The edits files are JS template literals, so a **literal backtick inside a
code sample terminates the string** and the file will not load. Every
`${` inside a code sample must be written `\${`, and every backtick that is
content rather than a delimiter must be written `` \` ``.

`node lint-edits.js <edits.js>` reports every occurrence at once — the
first version only reported the first, so each fix revealed the next.

**`--fix` removes placeholder elements only.** It used to strip stray
backticks as well, and that was destructive: on the JavaScript edits it
removed the backticks from every template-literal sample, which then left
their `${` interpolating and silently destroyed the most topic-relevant
examples in the file. A backtick in a code sample is legitimate content; only
the template delimiter is not, and the two cannot be told apart by pattern.

**Write scratch scripts with the editor, not a PowerShell here-string.**
Three separate times a `@'...'@` heredoc silently altered a character —
turning a `>` into nothing, mangling an entity, escaping one backtick in a
pair but not the other. Every one of them looked like a mistake in the
content when it was a mistake in the transport.

**A code sample that claims to work should be executed.** An HTML-escaping
sample written to avoid a double-escape passed `verify.js` and produced
`&undefined;` for every double quote, because the object key was a
two-character string. Extracting the block, unescaping it and calling it
found it in one run. `fixesc2.js` does exactly this before it writes.

## File Index

94 pages, ~28 MB, 1267 chapters, 11061 code samples. The **Guide** column is the visible h1 band; the two hubs have no band, so their full browser title is shown. Measured 2026-10-15. Rows marked † are provisional — their depth work is in flight (see `TODOS.md`).

| File | Guide | Chapters | Code | Size |
|---|---|---:|---:|---:|
| `ai-engineering.html` | AI Engineering | 18 | 93 | 213 KB |
| `alpinejs.html` | Alpine.js | 12 | 43 | 96 KB |
| `api-design.html` | API Design | 13 | 108 | 286 KB |
| `architecture.html` | Software Architecture Design Guide | 19 | 21 | 97 KB |
| `aspnet-core-advanced.html` | ASP.NET Core 10 — Advanced | 19 | 263 | 331 KB |
| `aspnet-core.html` | ASP.NET Core 10 | 11 | 52 | 109 KB |
| `axios.html` | Axios | 12 | 40 | 91 KB |
| `blazor.html` | Blazor | 20 | 109 | 239 KB |
| `bootstrap5.html` | Bootstrap 5 | 13 | 49 | 106 KB |
| `c-programming.html` | C Programming | 12 | 95 | 443 KB |
| `capacitor.html` | Capacitor | 17 | 125 | 183 KB |
| `cicd.html` | CI/CD | 18 | 20 | 76 KB |
| `cpanel.html` | cPanel and WHM | 8 | 77 | 213 KB |
| `cpp-programming.html` | C++ Programming | 9 | 49 | 241 KB |
| `csharp.html` | C# 14 & .NET 10 | 20 | 257 | 984 KB |
| `css.html` | CSS3 | 13 | 210 | 351 KB |
| `dart.html` | Dart 3 | 17 | 703 | 1569 KB |
| `database.html` | Databases | 19 | 44 | 111 KB |
| `db-design.html` | Advanced Database System Design | 19 | 182 | 925 KB |
| `domains-hosting.html` | Domains and Hosting | 20 | 67 | 171 KB |
| `dotnet-vue.html` | .NET Core + Vue | 18 | 34 | 81 KB |
| `electron-apps.html` | Building Service Apps with Electron | 1 | 2 | 13 KB |
| `flutter.html` | Flutter | 20 | 396 | 1497 KB |
| `git-github.html` | Git and GitHub | 7 | 74 | 264 KB |
| `go-programming.html` | Go Programming | 10 | 51 | 255 KB |
| `hardware-interfaces.html` | Port API and Hardware Access | 5 | 54 | 147 KB |
| `html.html` | HTML5 | 12 | 129 | 296 KB |
| `idea-to-deploy.html` | Idea to Deploy | 20 | 181 | 1005 KB |
| `index.html` | Amin360iT Quick Guides - 71 Offline Developer Guides | 0 | 0 | 81 KB |
| `it-infrastructure.html` | IT Infrastructure System Design Guide | 20 | 19 | 95 KB |
| `javascript.html` | JavaScript & ES6+ | 14 | 255 | 474 KB |
| `jquery.html` | jQuery | 11 | 36 | 84 KB |
| `laravel-blade.html` | Laravel Blade | 20 | 295 | 920 KB |
| `laravel-vue.html` | Laravel + Vue | 18 | 35 | 76 KB |
| `laravel.html` | Laravel 13 | 18 | 43 | 89 KB |
| `laravel13-advanced.html` | Laravel 13 — Advanced | 20 | 146 | 332 KB |
| `leaf-mvc.html` | Leaf PHP MVC | 20 | 210 | 475 KB |
| `linux-shell.html` | Linux Bash and Shell Scripting | 1 | 5 | 16 KB |
| `mongodb.html` | MongoDB | 13 | 48 | 103 KB |
| `mysql.html` | MySQL 9 | 8 | 73 | 270 KB |
| `netlify.html` | Netlify | 8 | 80 | 269 KB |
| `network-design.html` | Network System Design Guide | 19 | 27 | 94 KB |
| `nextjs.html` | Next.js 15 | 6 | 43 | 93 KB |
| `nuxtjs.html` | NuxtJS | 12 | 45 | 94 KB |
| `package-publishing.html` | Publishing & Deployment | 12 | 105 | 290 KB |
| `php-oop-mysql.html` | PHP OOP and MySQL | 20 | 93 | 316 KB |
| `php.html` | PHP 8.5 | 15 | 106 | 454 KB |
| `postgresql.html` | PostgreSQL 18 | 14 | 150 | 509 KB |
| `powershell-scripting.html` | Windows PowerShell Scripting | 1 | 6 | 17 KB |
| `python.html` | Python 3.14 | 18 | 228 | 811 KB |
| `r-programming.html` | R Programming | 3 | 13 | 30 KB |
| `react-native.html` | React Native | 8 | 73 | 302 KB |
| `react.html` | React 19 | 20 | 197 | 181 KB |
| `rust-programming.html` | Rust | 3 | 15 | 41 KB |
| `servers.html` | Servers | 32 | 44 | 149 KB |
| `software-design.html` | Software Design | 10 | 102 | 343 KB |
| `software-engineering.html` | Software Engineering — Self-Paced Bachelor’s Guide | 40 | 579 | 2733 KB |
| `sqlserver.html` | SQL Server 2025 & T-SQL | 15 | 284 | 919 KB |
| `svelte.html` | Svelte | 12 | 47 | 90 KB |
| `sveltekit.html` | SvelteKit | 12 | 52 | 86 KB |
| `system-design.html` | System Design | 14 | 181 | 655 KB |
| `tech-networking.html` | Tech Networking | 21 | 48 | 155 KB |
| `topics.html` | All 6,176 topics - Amin360iT Quick Guides | 0 | 0 | 1088 KB |
| `typescript.html` | TypeScript | 13 | 50 | 96 KB |
| `ui-ux-graphics.html` | UI / UX Design | 4 | 25 | 63 KB |
| `ui-ux.html` | UI/UX Design — Self-Paced Bachelor’s Guide | 30 | 328 | 1760 KB |
| `vercel.html` | Vercel | 7 | 81 | 218 KB |
| `vue-nuxt-capacitor.html` | Vue + Nuxt | 15 | 147 | 212 KB |
| `vuejs.html` | Vue 3 | 16 | 100 | 613 KB |
| `windows-batch.html` | Windows Batch Scripting | 1 | 2 | 11 KB |
| `winforms-wpf.html` | C# .NET 10 Desktop | 13 | 82 | 203 KB |
| `wordpress.html` | WordPress | 14 | 220 | 616 KB |
| `wp-plugin.html` | WordPress Plugin Development | 21 | 204 | 658 KB |
| `wp-theme.html` | WordPress Theme Development | 20 | 87 | 246 KB |
| `website-seo.html` | Website SEO | 3 | 8 | 22 KB |
| `digital-marketing.html` | Digital Marketing | 3 | 6 | 18 KB |
| `website-design.html` | Website Design | 3 | 6 | 18 KB |
| `website-development.html` | Website Development | 3 | 6 | 17 KB |
| `webapp-design.html` | Web App Design | 3 | 6 | 16 KB |
| `web-app-development.html` | Web App Development | 3 | 3 | 15 KB |
| `website-webapp-deployment.html` | Website & Web App Deployment | 3 | 2 | 14 KB |
| `static-dynamic-website-development.html` | Static and Dynamic Website Development | 3 | 5 | 15 KB |

## Tech Stack Summary

- **HTML5** — semantic sections, ARIA-friendly
- **CSS3** — custom properties, flexbox/grid, no framework
- **Vanilla JS (ES6+)** — no dependencies, no bundler
- **Fonts** — JetBrains Sans/Mono, base64-embedded
- **Code highlighting** — runtime regex highlighter in `shell.js`, span classes `c`/`s`/`n`/`k`
- **Brand imagery** — `assets/brand/logo.png`, `assets/brand/hero.jpg` only

## What NOT to Do

- No npm packages, frameworks or CDN links.
- No build step in the shipped output.
- Never inline CSS/JS into a page — use the shared assets.
- Never rename a CSS custom property without updating both theme blocks.
- Never hand-wrap `<span class="c|s|n|k">` in code blocks.
- Never pass already-escaped text to `seo.esc()`. It escapes whatever it is given, so handing it a title read straight out of `<title>` produced `&amp;amp;` in 12 page heads. Decode first, then escape. `seoverify.js` checks for this.
- Never double-escape entities (`&amp;lt;`); single-escape only.
- Never hand-edit a generated page.
- Never hard-code the site URL — change `seo-config.json`.
- Never delete `amin360it-logo.png` or `Amin360iT BG (2).png`; they are the brand source art.