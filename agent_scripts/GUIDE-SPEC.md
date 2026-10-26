# Guide fragment spec — for writing `build/newguides/<key>.main.html`

You are writing the **body** of one guide in a static, zero-dependency HTML
library (Amin360iT Quick Guides). The library ships as plain `.html` files with
all CSS/JS in `assets/shell.css` and `assets/shell.js`. Your fragment is spliced
into a full page by a build script that adds the `<head>`, header, sidebar and
footer — so you write **only the chapters**.

## Output

Write exactly one file: `build/newguides/<key>.main.html`.

It contains **only** a sequence of `<section class="chapter"> … </section>`
blocks. No `<!DOCTYPE>`, no `<head>`, no `<body>`, no `<main>`, no `<h1>`, no
sidebar, no footer, no `<script>`.

## Hard structure rules

1. **One `<section class="chapter">` per chapter.** Every chapter starts with a
   top-level heading:
   ```html
   <section class="chapter">
   <h2 id="ch1-modules" data-toc>1 · Modules and packages</h2>
   ```
   The `id` must be **globally unique** in the file and URL-safe
   (`^[a-z0-9-]+$`). Prefix with the chapter: `ch1-`, `ch2-`, `orientation-`.

2. **Each chapter contains 2–5 sub-topics**, each an `<h3 … data-toc>`:
   ```html
   <h3 id="ch1-cjs" data-toc>1.1 CommonJS: require and module.exports</h3>
   ```

3. **Every `<h3>` carries at least one `<h4>` sub-point** and real prose.
   Never leave an `<h3>` with only a code block.
   ```html
   <h4>How a module is resolved</h4>
   <p>…prose…</p>
   ```

4. **Numbering** is `chapter.subtopic` (1.1, 1.2 …). Keep it consistent with the
   chapter number. The first chapter is usually `0 · Orientation` with `0.1`,
   `0.2`.

5. **All IDs must be unique across the whole fragment.** A heading id may be
   referenced nowhere else. Do not reuse `email`, `qty`, `confirm`, etc.

## Prose quality bar (this is the point of the task)

- Write **real, accurate, current (2026) technical documentation**, not filler.
- Every `<h3>` should have **≈1,500+ bytes of prose** across its `<h4>`s.
- Explain *why*, not just *what*: trade-offs, failure modes, when to use what.
- Prefer concrete, runnable, correct examples over toy pseudocode.
- Use tables for comparisons, lists for steps, and short paragraphs.
- No marketing fluff, no "in this section we will…" padding.

## Code samples

- All code lives in exactly this shape:
  ```html
  <div class="codeWrap"><pre><code>const x = 1;</code></pre></div>
  ```
- **Escape once for HTML:** `<` → `&lt;`, `&` → `&amp;`. A bare `>` is legal and
  should stay literal. Never write `&amp;lt;` (double escaping).
- Do **not** add syntax-highlight `<span>`s — a runtime highlighter does that.
- Include a language comment at the top of a block where useful
  (`# shell`, `// JS`, `&lt;!-- HTML --&gt;`, `-- SQL`).

## Callouts (optional, sparing)

Only these four classes: `<div class="tip">…</div>`, `<div class="warn">…</div>`,
`<div class="note">…</div>`, `<div class="ex">…</div>`. Use them for genuinely
useful asides, not decoration.

## Example fragment (pattern to copy)

```html
<section class="chapter">
<h2 id="ch1-modules" data-toc>1 · Modules and packages</h2>

<h3 id="ch1-cjs" data-toc>1.1 CommonJS: require and module.exports</h3>
<p class="topic-desc">CommonJS is the original Node.js module system. Each file is a module with its own scope; <code>require</code> loads synchronously and caches the result.</p>

<h4>What a module actually is</h4>
<p>Node wraps every file in a function before running it, so top-level
<code>var</code> declarations never leak into the global scope. The wrapper
receives <code>exports</code>, <code>require</code>, <code>module</code>,
<code>__filename</code> and <code>__dirname</code>.</p>

<div class="codeWrap"><pre><code>// math.js
function add(a, b) { return a + b; }
module.exports = { add };
// app.js
const { add } = require('./math');
console.log(add(2, 3)); // 5</code></pre></div>

<h4>The require cache</h4>
<p>The first <code>require('./math')</code> executes the file and stores the
result in <code>require.cache</code>; later requires return the same object.
Mutating that object is visible everywhere, which is both the point and a
classic source of shared-state bugs.</p>

<div class="tip">Delete a key from <code>require.cache</code> to force a re-read
— useful in tests, dangerous in production.</div>
</section>
```

## Chapter outline to follow

Use the outline given in your task prompt. Aim for the stated number of
chapters. Depth beats breadth: a well-explained 12-chapter guide beats a thin
20-chapter one.

## When done

Report only: the file path, the number of `<section class="chapter">` blocks,
the number of `<h3 data-toc>` headings, and the number of
`<div class="codeWrap">` blocks. Do not run any build step — the orchestrator
does that.
