// ==========================================================================
// RESTORED SHELL MODULES
// --------------------------------------------------------------------------
// assets/shell.js had been replaced by a 510-line file that contained only the
// theme switch, the colour-mode picker and the Guides dropdown. Everything else
// the CSS and the markup were built for had been dropped: the runtime code
// highlighter (11,636 code samples rendered flat), the back-to-top button (98
// buttons permanently invisible because nothing ever added `.show`), the 1,312
// per-chapter Contents toggles, the scroll spy, the section autocomplete, the
// copy buttons, the mobile bottom bar, the chapter prev/next footer and the
// guide marks on 94 index cards.
//
// Every module below is guarded, so a hub (which has no sidebar) runs only the
// blocks it can support. Nothing here touches the theme/mode/nav code above.
// ==========================================================================

// ---------- Guide marks ----------------------------------------------------
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  if (typeof GUIDE_ICONS === 'undefined') return;

  function iconSvg(markup, cls) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.9');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', cls || 'am-glyph');
    svg.innerHTML = markup;
    return svg;
  }

  // Cards on the hub: the guide letter is the no-JS fallback, so only replace
  // it when a mark is known. An unknown guide keeps its letter rather than
  // going blank.
  document.querySelectorAll('.am-card[data-file] .am-card-ic').forEach(function (slot) {
    var file = slot.closest('.am-card').getAttribute('data-file');
    var mark = GUIDE_ICONS[file];
    if (!mark) return;
    slot.textContent = '';
    slot.appendChild(iconSvg(mark, 'am-glyph'));
  });

  // The Guides dropdown builds its rows from GUIDES_CATALOG at runtime, so the
  // rows are hydrated after the menu exists rather than pre-rendered.
  document.querySelectorAll('.topnav .tn-link[data-file]').forEach(function (a) {
    var mark = GUIDE_ICONS[a.getAttribute('data-file')];
    if (!mark || a.querySelector('.am-glyph')) return;
    a.insertBefore(iconSvg(mark, 'am-glyph'), a.firstChild);
  });
})();

// ---------- Back to top + reading progress ---------------------------------
// Standalone, because it must work on the two hubs as well as on every guide,
// and the hubs never reach the guide-chrome block below. It only needs #toTop
// and #progressBar, and it toggles a class so the fade can run.
(function () {
  'use strict';
  var tt = document.getElementById('toTop');
  var bar = document.getElementById('progressBar');
  if (!tt && !bar) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SHOW_AFTER = 420;   // px scrolled before the button appears
  var ticking = false;

  function sync() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (bar) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    if (!tt) return;

    var show = y > SHOW_AFTER;
    tt.classList.toggle('show', show);
    // never leave it reachable by keyboard while it is invisible
    tt.tabIndex = show ? 0 : -1;
    tt.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { sync(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  sync();

  tt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    // return focus to the top so a keyboard user is not left on a control
    // that is about to fade out underneath them
    var main = document.querySelector('main') || document.body;
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  });
})();

// ---------- Guide chrome ---------------------------------------------------
// Sidebar, per-chapter Contents, TOC search, section autocomplete, the code
// highlighter, copy buttons and chapter navigation. Every one of these needs
// markup that only a guide has, so the block returns early on a hub.
(function () {
  'use strict';

  var content = document.getElementById('content');
  var toc = document.getElementById('toc');
  var search = document.getElementById('search');
  var searchWrap = document.getElementById('searchWrap');
  var sidebar = document.getElementById('sidebar');
  var burger = document.getElementById('burger');

  if (!content || !toc || !burger) return;   // hub page

  // ---------- Sidebar drawer (mobile) ----------
  burger.addEventListener('click', function () {
    document.body.classList.toggle('menu-open');
  });
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('menu-open')) return;
    if (sidebar && (sidebar.contains(e.target) || burger.contains(e.target))) return;
    document.body.classList.remove('menu-open');
  });

  var links = toc.querySelectorAll('a[data-target]');
  var headings = content.querySelectorAll('h2[data-toc], h3[data-toc]');

  // ---------- Scroll spy ----------
  // The sidebar is pre-rendered, so this only has to move the active row; it
  // must not rebuild the list (a rebuild would lose the hand-written labels
  // and the per-chapter nesting).
  function setActive(id) {
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      var on = (l.getAttribute('data-target') === id);
      l.classList.toggle('active', on);
      if (!on) continue;

      var chapterLi = l.closest('li.chapter');
      if (chapterLi) {
        chapterLi.classList.remove('collapsed');
        chapterLi.classList.add('open');
      }
      // keep the active row visible inside the scrolling sidebar
      if (sidebar) {
        var rowTop = l.getBoundingClientRect().top;
        var boxTop = sidebar.getBoundingClientRect().top;
        var boxBottom = sidebar.getBoundingClientRect().bottom;
        if (rowTop < boxTop || rowTop > boxBottom - 24) {
          l.scrollIntoView({ block: 'center' });
        }
      }
    }
  }

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      // pick the topmost intersecting heading so a fast scroll cannot leave
      // the last-observed (possibly lower) heading highlighted
      var best = null;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (!best || e.boundingClientRect.top < best.boundingClientRect.top) best = e;
      });
      if (best) setActive(best.target.id);
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    for (var h = 0; h < headings.length; h++) spy.observe(headings[h]);
  }

  // ---------- Chapter collapse in the sidebar ----------
  toc.querySelectorAll('li.chapter').forEach(function (li) {
    var arrow = li.querySelector(':scope > .arrow');
    var title = li.querySelector(':scope > a');
    if (arrow) {
      arrow.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        li.classList.toggle('open');
        li.classList.toggle('collapsed');
      });
    }
    if (title) {
      title.addEventListener('click', function () {
        li.classList.remove('collapsed');
        li.classList.add('open');
        setActive(title.getAttribute('data-target'));
      });
    }
  });

  var tocCount = document.getElementById('tocCount');
  if (tocCount) tocCount.textContent = headings.length + ' topics';

  // ---------- Per-chapter Contents toggles ----------
  // The blocks are pre-rendered into every guide, so this binds to what is in
  // the document instead of building new markup. It runs over every .ch-toc,
  // whether it was pre-rendered or built here, which is what the previous
  // implementation got wrong: it returned early on a pre-rendered block and
  // left all 1,312 toggle buttons inert.
  function bindChToc(box) {
    var head = box.querySelector('.ch-toc-head');
    if (!head || head.getAttribute('data-bound')) return;
    head.setAttribute('data-bound', '1');
    head.addEventListener('click', function () {
      var collapsed = box.classList.toggle('collapsed');
      head.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
  }

  content.querySelectorAll('.ch-toc').forEach(bindChToc);

  // A guide with no pre-rendered block still gets one, built from its headings.
  content.querySelectorAll('section.chapter').forEach(function (sec) {
    var ch = sec.querySelector('h2[data-toc]');
    var subs = sec.querySelectorAll('h3[data-toc]');
    if (!ch || !subs.length || sec.querySelector('.ch-toc')) return;

    var box = document.createElement('div');
    box.className = 'ch-toc';
    var head = document.createElement('button');
    head.type = 'button';
    head.className = 'ch-toc-head';
    head.setAttribute('aria-expanded', 'true');
    var arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '\u25B8';
    head.appendChild(arrow);
    head.appendChild(document.createTextNode(
      'Contents \u00B7 ' + (ch.textContent || '').replace(/^\s*\d+\s*[\u00B7.:\-]\s*/, '').trim()
    ));
    var list = document.createElement('div');
    list.className = 'ch-toc-list';
    subs.forEach(function (s) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.textContent = s.textContent;
      list.appendChild(a);
    });
    box.appendChild(head);
    box.appendChild(list);
    sec.insertBefore(box, ch.nextSibling);
    bindChToc(box);
  });

  // ---------- Sidebar search filter ----------
  if (search) {
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();

      toc.querySelectorAll('li.chapter').forEach(function (li) {
        var selfMatch = (li.textContent || '').toLowerCase().indexOf(q) !== -1;
        var anyChild = false;
        li.querySelectorAll(':scope > ul > li').forEach(function (sl) {
          var m = !q || (sl.textContent || '').toLowerCase().indexOf(q) !== -1;
          sl.classList.toggle('hidden-item', !m);
          if (m) anyChild = true;
        });
        li.classList.toggle('hidden-item', !!q && !selfMatch && !anyChild);
        if (q && (selfMatch || anyChild)) li.classList.add('open');
      });
    });
    search.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      this.value = '';
      this.dispatchEvent(new Event('input'));
    });
  }

  // ---------- Section autocomplete ----------
  if (searchWrap && search) {
    var auto = document.createElement('ul');
    auto.id = 'searchAuto';
    searchWrap.appendChild(auto);

    var sections = [];
    content.querySelectorAll('h2[id], h3[id]').forEach(function (hd) {
      var sub = '';
      var p = hd.nextElementSibling;
      while (p && !/^H[23]$/.test(p.tagName)) {
        if (p.classList && p.classList.contains('topic-desc')) {
          sub = (p.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90);
          break;
        }
        p = p.nextElementSibling;
      }
      sections.push({ id: hd.id, text: (hd.textContent || '').replace(/\s+/g, ' ').trim(), sub: sub });
    });

    var cur = -1;

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function hide() {
      auto.classList.remove('on');
      cur = -1;
    }

    function jump(id) {
      var t = document.getElementById(id);
      if (!t) return;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var top = t.getBoundingClientRect().top + (window.pageYOffset || 0) - 80;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    }

    function render() {
      var q = search.value.trim().toLowerCase();
      auto.innerHTML = '';
      cur = -1;
      if (!q) { hide(); return; }

      var hits = sections.filter(function (s) {
        return s.text.toLowerCase().indexOf(q) !== -1 || s.sub.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 12);
      if (!hits.length) { hide(); return; }

      hits.forEach(function (s) {
        var li = document.createElement('li');
        li.innerHTML = esc(s.text) + (s.sub ? '<span class="auto-sub">' + esc(s.sub) + '</span>' : '');
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();          // keep focus so blur does not fire first
          search.value = '';
          hide();
          jump(s.id);
        });
        auto.appendChild(li);
      });
      auto.classList.add('on');
    }

    function move(dir) {
      var items = auto.querySelectorAll('li');
      if (!items.length) return;
      if (cur >= 0) items[cur].classList.remove('cur');
      cur = (cur + dir + items.length) % items.length;
      items[cur].classList.add('cur');
    }

    search.addEventListener('input', render);
    search.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); render(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && cur >= 0) {
        e.preventDefault();
        var items = auto.querySelectorAll('li');
        if (items[cur]) items[cur].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }
    });
    search.addEventListener('blur', function () { setTimeout(hide, 120); });
  }

  // ---------- Code highlighter + copy buttons ----------
  // Keywords are matched by exact set membership. Joining them into a string
  // and testing with indexOf() does SUBSTRING matching, so 'lt' (inside
  // "default") was treated as a keyword; because '<' is escaped to '&lt;'
  // before tokenising, that split the entity into '&<span class="k">lt</span>;'
  // and the page printed a literal '&lt;' instead of '<'. Keep it exact.
  var KWS = new Set([
    'var', 'let', 'const', 'function', 'return', 'if', 'else', 'elif', 'for', 'while',
    'do', 'switch', 'case', 'default', 'break', 'continue', 'import', 'from', 'export',
    'class', 'def', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'async',
    'await', 'yield', 'public', 'private', 'protected', 'static', 'void', 'int', 'float',
    'double', 'char', 'long', 'short', 'bool', 'boolean', 'str', 'string', 'list', 'dict',
    'set', 'tuple', 'true', 'false', 'None', 'null', 'undefined', 'and', 'or', 'not', 'in',
    'is', 'with', 'as', 'lambda', 'range', 'pass', 'raise', 'package', 'func', 'type',
    'struct', 'interface', 'select', 'defer', 'go', 'map', 'chan'
  ]);

  // Comments are matched before strings, so each rule is narrowed until it
  // cannot swallow real code. Two guards were missing from the original and
  // are restored here:
  //
  //   block comments   CSS and JS samples are full of them and they were not
  //                    highlighted at all, so a CSS block comment rendered as
  //                    flat monochrome text beside highlighted code.
  //   line comments    The old comment claimed a guard that the regex did not
  //                    have, so https://example.com was coloured as a comment
  //                    to the end of the line. Now blocked after a colon or a
  //                    word character.
  //   hash             only at line start or after whitespace, followed by a
  //                    space or EOL, so CSS ids (#main, #fff) stay intact.
  //   double dash      not followed by a word character or another dash, so
  //                    CSS custom properties (--accent) and YAML document
  //                    markers survive.
  //
  // All of these are lookaround assertions, so they add no capture groups and
  // the (cm, str, num, id) argument order of the replacer stays unchanged.
  var HL = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|(?<![:\\w])\\/\\/[^\\n]*|(?<![^\\s])#(?=\\s|$)[^\\n]*|(?<![^\\s])--(?![\\w-])[^\\n]*)' +
    '|("[^"\\n]*"|\'[^\'\\n]*\'|`[^`\\n]*`)' +
    '|\\b(\\d+(?:\\.\\d+)?)\\b' +
    '|([A-Za-z_$][\\w$]*)', 'g');

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(text) {
    var safe = escapeHtml(text);
    return safe.replace(HL, function (m, cm, str, num, id) {
      if (cm) return '<span class="c">' + cm + '</span>';
      if (str) return '<span class="s">' + str + '</span>';
      if (num) return '<span class="n">' + num + '</span>';
      if (id && KWS.has(id)) return '<span class="k">' + id + '</span>';
      return m;
    });
  }

  content.querySelectorAll('.codeWrap').forEach(function (wrap) {
    var code = wrap.querySelector('code');
    if (!code) return;

    // Highlight once, from textContent, so an already-highlighted block is not
    // re-tokenised (which would nest spans and double the sample text).
    if (!code.getAttribute('data-hl')) {
      code.textContent = code.textContent;      // normalise
      code.innerHTML = highlight(code.textContent);
      code.setAttribute('data-hl', '1');
    }

    if (wrap.querySelector('.copyBtn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copyBtn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy this code sample');
    btn.addEventListener('click', function () {
      var txt = code.textContent;
      var restore = function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(restore, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = txt;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        restore();
      }
    });
    wrap.appendChild(btn);
  });

  // ---------- Restore the last chapter ----------
  var PAGE_KEY = 'amin360it-last:' + (location.pathname.split('/').pop() || 'index.html');
  try {
    var last = localStorage.getItem(PAGE_KEY);
    if (last && document.getElementById(last) && !location.hash) {
      if (history.replaceState) history.replaceState(null, '', '#' + last);
    }
  } catch (e) {}

  var saveTimer = null;
  window.addEventListener('scroll', function () {
    if (saveTimer) return;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      try { localStorage.setItem(PAGE_KEY, location.hash.slice(1)); } catch (e) {}
    }, 400);
  }, { passive: true });

  // ---------- Chapter footer: position + labelled prev/next ----------
  // Injected, so no guide file has to change. The label comes from the
  // chapter's own <h2>, so it can never drift from the heading it points at.
  var chaps = content.querySelectorAll('section.chapter');
  var chapInfo = [];

  chaps.forEach(function (sec) {
    var hd = sec.querySelector('h2');
    if (!hd || !hd.id) return;
    var raw = (hd.textContent || '').replace(/\s+/g, ' ').trim();
    var m = /^(\d+)\s*[\u00B7.:\-]\s*(.+)$/.exec(raw);
    chapInfo.push({ id: hd.id, num: m ? m[1] : '', title: m ? m[2] : raw, full: raw, sec: sec });
  });

  var numberedTotal = chapInfo.filter(function (c) { return c.num; }).length;

  function shortTitle(t, max) {
    max = max || 46;
    if (t.length <= max) return t;
    var cut = t.slice(0, max);
    var sp = cut.lastIndexOf(' ');
    if (sp > max * 0.6) cut = cut.slice(0, sp);
    return cut.replace(/[\s,;:.\-]+$/, '') + '\u2026';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function goTo(id) {
    var t = document.getElementById(id);
    if (!t) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    var hd = t.querySelector('h2');
    if (hd) {
      hd.setAttribute('tabindex', '-1');
      hd.focus({ preventScroll: true });
    }
  }

  if (chapInfo.length > 1) {
    chapInfo.forEach(function (c, i) {
      if (c.sec.querySelector('.chapter-nav')) return;

      var nav = el('div', 'chapter-nav');

      var end = el('div', 'ch-end');
      end.setAttribute('aria-hidden', 'true');
      end.appendChild(el('span', 'ch-end-line'));
      end.appendChild(el('span', 'ch-end-label',
        c.num ? 'Chapter ' + c.num + ' of ' + numberedTotal : 'Introduction'));
      end.appendChild(el('span', 'ch-end-line'));
      nav.appendChild(end);

      var row = el('div', 'ch-nav-row');
      var prev = i > 0 ? chapInfo[i - 1] : null;
      var next = i < chapInfo.length - 1 ? chapInfo[i + 1] : null;

      function button(dir, target) {
        var b = el('button', 'btn nav-link nav-' + dir);
        b.type = 'button';
        if (target) {
          b.setAttribute('data-go', target.id);
          b.setAttribute('title', (dir === 'prev' ? 'Previous: ' : 'Next: ') + target.full);
          b.appendChild(el('span', 'nav-dir', dir === 'prev' ? 'Previous' : 'Next'));
          b.appendChild(el('span', 'nav-title', shortTitle(target.title)));
          b.appendChild(el('span', 'nav-arrow', dir === 'prev' ? '\u2039' : '\u203A'));
        } else {
          b.disabled = true;
          b.appendChild(el('span', 'nav-dir', dir === 'prev' ? 'Start of guide' : 'End of guide'));
          b.appendChild(el('span', 'nav-title', ''));
          b.appendChild(el('span', 'nav-arrow', dir === 'prev' ? '\u2039' : '\u203A'));
        }
        row.appendChild(b);
        return b;
      }

      button('prev', prev);
      button('next', next);
      nav.appendChild(row);

      if (i === chapInfo.length - 1) {
        var done = el('div', 'ch-done');
        var top = el('button', 'btn ch-done-btn', 'Back to top \u2191');
        top.type = 'button';
        top.addEventListener('click', function () {
          var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
        done.appendChild(top);
        var home = el('a', 'btn ch-done-link', 'All guides');
        home.href = 'index.html';
        done.appendChild(home);
        nav.appendChild(done);
      }

      c.sec.appendChild(nav);
    });

    content.querySelectorAll('.chapter-nav .nav-link[data-go]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        goTo(this.getAttribute('data-go'));
      });
    });

    // Alt+Up / Alt+Down. Alt rather than a bare arrow so a reader scrolling
    // with arrows is never yanked to another chapter, and so it cannot collide
    // with browser back/forward (Alt+Left/Right).
    document.addEventListener('keydown', function (e) {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      var a = document.activeElement;
      var tag = a && a.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
          (a && a.isContentEditable)) return;
      e.preventDefault();

      var idx = 0;
      for (var k = 0; k < chapInfo.length; k++) {
        var s = document.getElementById(chapInfo[k].id);
        if (s && s.getBoundingClientRect().top <= 120) idx = k;
      }
      var target = e.key === 'ArrowDown'
        ? Math.min(chapInfo.length - 1, idx + 1)
        : Math.max(0, idx - 1);
      goTo(chapInfo[target].id);
    });
  }
})();

// ---------- Mobile bottom navigation ---------------------------------------
// Injected on every page; CSS hides it above 760px. Doing the breakpoint in CSS
// rather than checking clientWidth once at load means it also appears when the
// window is resized or the phone is rotated, which the previous width check
// could not do.
//
// The links are page-aware, as the stylesheet comment promises. On a guide the
// first slot opens the chapter drawer, because on a phone the burger is at the
// very top of a 900 KB page and this is where a thumb already is.
(function () {
  'use strict';
  if (document.querySelector('.botnav')) return;

  var here = location.pathname.split('/').pop() || 'index.html';
  var isGuide = !!document.getElementById('sidebar');
  var nav = document.createElement('nav');
  nav.className = 'botnav';
  nav.setAttribute('aria-label', 'Quick navigation');

  function link(href, label, title) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (title) a.title = title;
    if (href === here) {
      a.className = 'cur';
      a.setAttribute('aria-current', 'page');
    }
    return a;
  }

  if (isGuide) {
    var contents = document.createElement('button');
    contents.type = 'button';
    contents.textContent = 'Contents';
    contents.className = 'botnav-c';
    contents.setAttribute('aria-label', 'Open the chapter list');
    contents.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
    nav.appendChild(contents);
  } else {
    nav.appendChild(link('index.html', 'Home'));
  }

  nav.appendChild(link('topics.html', 'Topics'));
  nav.appendChild(link('search.html', 'Search'));
  nav.appendChild(link('favorites.html', 'Saved'));

  document.body.appendChild(nav);
})();
