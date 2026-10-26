(function () {
  var stackChips = document.querySelectorAll('.am-stack-chip');
  var cards = document.querySelectorAll('.am-card');
  var bands = document.querySelectorAll('.am-band[data-cat]');
  var catChips = document.querySelectorAll('.am-chip[data-filter]');
  var search = document.getElementById('hubSearch');
  var resultCount = document.getElementById('resultCount');
  if (!stackChips.length) return;

  var stackDefs = {
    mern: ['nodejs.html','react.html','mongodb.html','api-design.html'],
    mevn: ['vuejs.html','nodejs.html','mongodb.html','api-design.html'],
    pern: ['postgresql.html','express.js.html','react.html','nodejs.html','api-design.html'],
    lamp: ['linux-shell.html','apache?','mysql.html','php.html'],
    tall: ['tailwind?','alpinejs.html','laravel.html','laravel-blade.html'],
    dotnet: ['csharp.html','aspnet-core.html','aspnet-core-advanced.html','dotnet-vue.html'],
    nextjs: ['nextjs.html','react.html','typescript.html','api-design.html'],
    nuxtjs: ['nuxtjs.html','vuejs.html','api-design.html'],
    sveltekit: ['svelte.html','sveltekit.html','api-design.html'],
    'laravel-vue': ['laravel.html','laravel-vue.html','vuejs.html','laravel-blade.html'],
    spring: ['java.html','spring-boot.html','api-design.html']
  };

  function clearCatFilter() {
    catChips.forEach(function(c){ c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
    var all = document.querySelector('.am-chip[data-filter="all"]');
    if (all){ all.classList.add('on'); all.setAttribute('aria-pressed','true'); }
  }

  stackChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      stackChips.forEach(function (c){ c.classList.toggle('on', c===chip); c.setAttribute('aria-pressed', c===chip?'true':'false'); });
      clearCatFilter();
      var key = chip.getAttribute('data-stack');
      var set = stackDefs[key]||[];
      var count = 0;
      cards.forEach(function(card){ var file = card.getAttribute('data-file'); var on = set.indexOf(file) !== -1; card.classList.toggle('hide', !on); if (on) count++; });
      bands.forEach(function(band){ band.style.display = 'none'; });
      if (resultCount) resultCount.textContent = count + ' guide' + (count===1?'':'s');
      if (search) search.value = '';
    });
  });
})();
