/* botnav injection — adds a mobile bottom navigation bar with 4 links.
   Runs after the page loads; only shows on narrow viewports.
   The CSS .botnav already positions it fixed at the bottom.
   The .to-top is raised above it via the media query in shell.css.
*/
(function() {
  var meta = document.querySelector('meta[name=viewport]');
  if (!meta) return;
  var width = document.documentElement.clientWidth;
  if (width > 760) return; // show only below 760px (matches the #burger media query)

  var botnav = document.createElement('nav');
  botnav.className = 'botnav';
  botnav.innerHTML = '<a href="#guides">All guides</a>' +
    '<a href="index.html">Home</a>' +
    '<a href="topics.html">Topics</a>' +
    '<a href="search.html">Search</a>';
  document.body.appendChild(botnav);
})();