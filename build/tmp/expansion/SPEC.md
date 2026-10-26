# Authoring spec — thin-page expansion

You are writing the body content of a static HTML guide page in the Amin360iT
"Learn Software Engineering" library. Your job: **write ONLY the chapters**
(the region that will live between the `<h1>` title band and `</main>`).

## How your work is used

1. You write your chapters to the assigned output file as plain HTML (a fragment).
2. An automated tool splices your fragment into the real page, replacing the old
   `<section class="chapter">…</section>` region. Everything else (head, header
   lockup, sidebar, footer, scripts) stays untouched and is NOT your concern.
3. Another tool regenerates the sidebar table of contents, the per-chapter
   "Contents" blocks, and the "N chapters · M topics · K code samples" count
   strings from your headings. So **count strings, TOCs and ch-tocs are not your
   job either** — but your headings must follow the exact conventions below so
   the tools can find them.

## Hard rules (from AGENTS.md)

- One `<h1>` only — already on the page, not your concern.
- Class prefix is `am-`; callouts only `tip` / `warn` / `note`.
- Code blocks use EXACTLY:
  `<div class="codeWrap"><pre><code>…</code></pre></div>`
- Colors, fonts, chrome: none of your concern. Do NOT emit any `<style>`.
- Do NOT hand-highlight code (`<span class="s">` etc. are forbidden).

## Fragment structure

```html
<section class="chapter">
<h2 id="ch1" data-toc>1 ▸ Chapter Title</h2>
<div class="ch-toc"></div></div>
<p class="topic-desc">One to three sentences of chapter orientation. Say what
this chapter covers and why it matters.</p>

<h3 id="ch1-1" data-toc>1.1 Topic title</h3>
<p class="topic-desc">One or two sentences introducing the topic.</p>

<h4 id="ch1-1-command">Sub-point heading</h4>
<p>Prose. Real explanation with technical substance — not filler. Use
<code>inline code</code> for identifiers, flags and file names.</p>

<div class="codeWrap"><pre><code>#!/usr/bin/env bash
echo "example"
</code></pre></div>

<div class="tip">A tip callout.</div>

<h4 id="ch1-1-next">Another sub-point</h4>
<p>More prose.</p>

<div class="warn">A warning callout.</div>
</section>
```

## Conventions per chapter

- `<h2 id="chN" data-toc>N ▸ Title</h2>` — id `ch1, ch2, …`; title starts with
  the number, a space, `▸` (U+25B8), a space, then the title.
- Each chapter: start with a `<p class="topic-desc">`, then **3–5** `<h3 id="chN.M" data-toc>` subsections numbered `N.1, N.2, …`.
- Each `<h3>`: a `<p class="topic-desc">` intro, then **2–4** `<h4>` sub-points,
  each with real prose AND at least one real, runnable, complete code sample.
- **Every `<h3>` must contain at least one code block** (`codeWrap`). Aim for
  2–4 code blocks per h3. Total ≥ 4 code blocks per chapter.
- IDs: `kebab-case`, unique page-wide. h4 ids like `ch1-1-what`, `ch1-1-example`.
  NEVER reuse an id. Suggestions for h4 ids: `chN-M-shorttopic`.
- Use the `▸` character exactly as shown (UTF-8 char U+25B8), or `·` is fine.
  No HTML entities for it.

## Escaping (FAILURES HERE ARE REJECTED)

Inside `<code>` blocks, escape ONCE:
- `<` becomes `&lt;`
- `&` becomes `&amp;`
- `>` may stay as `>` (legal and preferred in examples like `x > 0`)
In prose do NOT escape; write `<code>…</code>` normally.
Never write `&amp;lt;` / `&amp;amp;` (double-escaping is an error).
The verifier rejects: any raw `<` inside a code block, any bare `&` that is not
part of `&amp; &lt; &gt; &quot; &#123; &nbsp;`, any double-escape, and any code
block containing a second copy of its own first 200 chars.

## Prose quality

- Depth, not padding. Each h4 earns its place with a concrete fact, a mechanism,
  or a gotcha — and at least one complete runnable example.
- Teach the reader something real (a real flag, a real API, a real failure mode).
- Use `<strong>` for key terms sparingly. Use `<code>` generously for tokens.
- Callouts: use a few `tip` / `warn` / `note` per chapter where genuinely useful.
- The library's voice is dense, practical, example-first, British-leaning
  spelling. No marketing, no "in today's fast-paced world", no fluff.

## Output

Write ONLY the fragment (starts with `<section class="chapter">`, ends with the
final `</section>`) to the exact output file path you were given, then report:
- how many chapters/h3/code blocks you wrote
- ids you used (so they can be checked for collisions)
- anything you were unsure about

Use the `write` tool to create the output file. Do not modify any page directly.