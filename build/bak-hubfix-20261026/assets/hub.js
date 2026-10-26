/* ==========================================================================
   Amin360iT | Hub behaviour (index.html, topics.html, and only those)
   Theme icon re-sync, the mobile drawer, category-filter chips/pills, the
   header + hero search boxes, and #cat- deep links.

   The shared top-bar GUIDES menu is built by shell.js (it runs on every page);
   nothing in this file duplicates it.
   ========================================================================== */

(function () {
  'use strict';

  /* Theme icons and labels are kept in step by shell.js's syncChrome(), which
     runs on every page. Nothing to do here. */

  /* ---------- Mobile drawer ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  if (burger && drawer) {
    var setDrawer = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) drawer.removeAttribute('hidden'); else drawer.setAttribute('hidden', '');
      document.body.classList.toggle('drawer-open', open);
    };
    burger.addEventListener('click', function () {
      setDrawer(drawer.hasAttribute('hidden'));
    });
    drawer.addEventListener('click', function (e) {
      /* a category button activates the matching filter, so the drawer and the
         filter controls can never disagree about what is showing */
      var jump = e.target.closest('[data-jump-cat]');
      if (jump) {
        var key = jump.getAttribute('data-jump-cat');
        setDrawer(false);
        var chip = document.querySelector('.am-chip[data-filter="' + key + '"]');
        var pill = document.querySelector('.am-pill[data-cat="' + key + '"]');
        if (chip) chip.click();
        else if (pill) pill.click();
        var section = document.getElementById('guides');
        if (section) {
          var headerEl = document.getElementById('top');
          var bar = headerEl ? headerEl.getBoundingClientRect().height : 0;
          var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - bar - 12, behavior: reduced ? 'auto' : 'smooth' });
        }
        return;
      }
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hasAttribute('hidden')) { setDrawer(false); burger.focus(); }
    });
    /* a resize past the breakpoint must not leave the page scroll-locked */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && !drawer.hasAttribute('hidden')) setDrawer(false);
    });
  }

  /* ---------- Guide grid: category chips + header search (index.html) ---------- */
  var chips = document.querySelectorAll('.am-chip');
  var cards = document.querySelectorAll('.am-card');
  var bands = document.querySelectorAll('.am-band[data-cat]');
  var search = document.getElementById('hubSearch');
  var resultCount = document.getElementById('resultCount');
  var currentCat = 'all';

  if (chips.length || cards.length) {
    function renderGuides() {
      if (!cards.length) return;
      var q = (search ? search.value : '').trim().toLowerCase();
      var count = 0;
      cards.forEach(function (card) {
        var catMatch = currentCat === 'all' || card.getAttribute('data-cat') === currentCat;
        var qMatch = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.classList.toggle('hide', !(catMatch && qMatch));
        if (catMatch && qMatch) count++;
      });
      bands.forEach(function (band) {
        var catMatch = currentCat === 'all' || band.getAttribute('data-cat') === currentCat;
        band.style.display = catMatch ? '' : 'none';
      });
      if (resultCount) resultCount.textContent = count + ' guide' + (count === 1 ? '' : 's');
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        currentCat = chip.getAttribute('data-filter');
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderGuides();
      });
    });
    if (search) search.addEventListener('input', renderGuides);
  }

  /* ---------- Topic index: category pills + topic search (topics.html) ---------- */
  var pills = document.querySelectorAll('.am-pill');
  var tgs = document.querySelectorAll('.am-tg');
  var topicSearch = document.getElementById('topicSearch');
  var topicCount = document.getElementById('topicCount');
  var pillCat = 'all';

  if (tgs.length) {
    function pruneEmptyUls(ul) {
      var visible = Array.prototype.some.call(ul.children, function (li) { return li.style.display !== 'none'; });
      ul.style.display = visible ? '' : 'none';
    }
    function renderTopics() {
      var q = (topicSearch ? topicSearch.value : '').trim().toLowerCase();
      var count = 0;
      tgs.forEach(function (tg) {
        var catMatch = pillCat === 'all' || tg.getAttribute('data-cat') === pillCat;
        var links = tg.querySelectorAll('a');
        var any = false;
        links.forEach(function (a) {
          var m = !q || a.textContent.toLowerCase().indexOf(q) !== -1;
          a.parentNode.style.display = m ? '' : 'none';
          if (m) any = true;
        });
        var uls = tg.querySelectorAll('ul');
        for (var i = uls.length - 1; i >= 0; i--) pruneEmptyUls(uls[i]);
        var show = catMatch && (any || !q);
        tg.classList.toggle('hide', !show);
        if (show) count++;
      });
      if (topicCount) {
        topicCount.textContent = q
          ? count + ' matching topic group' + (count === 1 ? '' : 's')
          : (pillCat === 'all' ? 'All' : '') + ' ' + count + ' guide' + (count === 1 ? '' : 's');
      }
    }
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pillCat = pill.getAttribute('data-cat');
        pills.forEach(function (p) {
          var on = p === pill;
          p.classList.toggle('on', on);
          p.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderTopics();
      });
    });
    if (topicSearch) topicSearch.addEventListener('input', renderTopics);
  }

  /* ---------- #cat- deep links: a filter carried in the URL ---------- */
  function applyHash() {
    var h = location.hash;
    if (!h || h.indexOf('#cat-') !== 0) return;
    var key = h.slice(5);
    var chip = document.querySelector('.am-chip[data-filter="' + key + '"]');
    var pill = document.querySelector('.am-pill[data-cat="' + key + '"]');
    if (chip) chip.click();
    else if (pill) {
      pillCat = key;
      pills.forEach(function (p) {
        var on = p === pill;
        p.classList.toggle('on', on);
        p.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      renderTopics();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHash);
  } else {
    applyHash();
  }
  window.addEventListener('hashchange', applyHash);

  /* ---------- Smooth in-page links, without hijacking modified clicks ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  });
})();

/* ---------- Popular tech-stack filter (index.html) ---------- */
(function () {
  var stackChips = document.querySelectorAll('.am-stack-chip');
  var cards = document.querySelectorAll('.am-card');
  var bands = document.querySelectorAll('.am-band[data-cat]');
  var catChips = document.querySelectorAll('.am-chip[data-filter]');
  var search = document.getElementById('hubSearch');
  var resultCount = document.getElementById('resultCount');
  if (!stackChips.length || !cards.length) return;

  var stackDefs = {
    mern: ['nodejs.html','react.html','mongodb.html','api-design.html'],
    mevn: ['vuejs.html','nodejs.html','mongodb.html','api-design.html'],
    pern: ['postgresql.html','react.html','nodejs.html','api-design.html'],
    lamp: ['linux-shell.html','mysql.html','php.html'],
    tall: ['alpinejs.html','laravel.html','laravel-blade.html'],
    dotnet: ['csharp.html','aspnet-core.html','aspnet-core-advanced.html','dotnet-vue.html'],
    nextjs: ['nextjs.html','react.html','typescript.html','api-design.html'],
    nuxtjs: ['nuxtjs.html','vuejs.html','api-design.html'],
    sveltekit: ['svelte.html','sveltekit.html','api-design.html'],
    'laravel-vue': ['laravel.html','laravel-vue.html','vuejs.html','laravel-blade.html'],
    spring: ['java.html','spring-boot.html','api-design.html']
  };

  stackChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var already = chip.classList.contains('on');
      stackChips.forEach(function (c){ c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
      catChips.forEach(function(c){ c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
      if (already) {
        var all = document.querySelector('.am-chip[data-filter="all"]');
        if (all){ all.classList.add('on'); all.setAttribute('aria-pressed','true'); }
        cards.forEach(function(card){ card.classList.remove('hide'); });
        bands.forEach(function(band){ band.style.display = ''; });
        if (resultCount) resultCount.textContent = cards.length + ' guides';
        if (search) search.value = '';
        return;
      }
      chip.classList.add('on');
      chip.setAttribute('aria-pressed','true');
      var key = chip.getAttribute('data-stack');
      var set = stackDefs[key]||[];
      var count = 0;
      cards.forEach(function(card){
        var file = card.getAttribute('data-file');
        var on = set.indexOf(file) !== -1;
        card.classList.toggle('hide', !on);
        if (on) count++;
      });
      bands.forEach(function(band){ band.style.display = 'none'; });
      if (resultCount) resultCount.textContent = count + ' guide' + (count===1?'':'s');
      if (search) search.value = '';
    });
  });

  catChips.forEach(function(chip){
    chip.addEventListener('click', function(){
      stackChips.forEach(function (c){ c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
    });
  });
})();


/* ---------- Extended tech-stack filter (index.html) ---------- */
(function () {
  var stackChips = document.querySelectorAll('.am-stack-chip');
  var cards = document.querySelectorAll('.am-card');
  var bands = document.querySelectorAll('.am-band[data-cat]');
  var catChips = document.querySelectorAll('.am-chip[data-filter]');
  var search = document.getElementById('hubSearch');
  var resultCount = document.getElementById('resultCount');
  if (!stackChips.length || !cards.length) return;

  var stackDefs = {
    mern: ['nodejs.html','react.html','mongodb.html','api-design.html'],
    mevn: ['vuejs.html','nodejs.html','mongodb.html','api-design.html'],
    pern: ['postgresql.html','react.html','nodejs.html','api-design.html'],
    lamp: ['linux-shell.html','mysql.html','php.html','php-oop-mysql.html'],
    tall: ['alpinejs.html','laravel.html','laravel-blade.html'],
    jamstack: ['html.html','css.html','javascript.html','netlify.html','vercel.html','api-design.html'],
    dotnet: ['csharp.html','aspnet-core.html','aspnet-core-advanced.html','dotnet-vue.html','blazor.html','winforms-wpf.html'],
    nextjs: ['nextjs.html','react.html','typescript.html','api-design.html'],
    nuxtjs: ['nuxtjs.html','vuejs.html','api-design.html'],
    sveltekit: ['svelte.html','sveltekit.html','api-design.html'],
    'laravel-vue': ['laravel.html','laravel-vue.html','vuejs.html','laravel-blade.html'],
    spring: ['java.html','spring-boot.html','api-design.html'],
    flutter: ['dart.html','flutter.html','api-design.html','react-native.html'],
    rust: ['rust-programming.html','api-design.html']
  };

  stackChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var already = chip.classList.contains('on');
      stackChips.forEach(function (c){ c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
      catChips.forEach(function(c){ c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
      if (already) {
        var all = document.querySelector('.am-chip[data-filter="all"]');
        if (all){ all.classList.add('on'); all.setAttribute('aria-pressed','true'); }
        cards.forEach(function(card){ card.classList.remove('hide'); });
        bands.forEach(function(band){ band.style.display = ''; });
        if (resultCount) resultCount.textContent = cards.length + ' guides';
        if (search) search.value = '';
        return;
      }
      chip.classList.add('on');
      chip.setAttribute('aria-pressed','true');
      var key = chip.getAttribute('data-stack');
      var set = stackDefs[key]||[];
      var count = 0;
      cards.forEach(function(card){
        var file = card.getAttribute('data-file');
        var on = set.indexOf(file) !== -1;
        card.classList.toggle('hide', !on);
        if (on) count++;
      });
      bands.forEach(function(band){ band.style.display = 'none'; });
      if (resultCount) resultCount.textContent = count + ' guide' + (count===1?'':'s');
      if (search) search.value = '';
    });
  });

  catChips.forEach(function(chip){
    chip.addEventListener('click', function(){
      stackChips.forEach(function (c){ c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
    });
  });
})();
