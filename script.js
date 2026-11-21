(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }

  /* Langue FR / EN */
  var langBtn = d.getElementById('lang');
  function setLang(l) { html.lang = l; langBtn.textContent = l === 'fr' ? 'EN' : 'FR'; store('lang', l); }
  setLang(store('lang') || ((navigator.language || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr'));
  langBtn.addEventListener('click', function () { setLang(html.lang === 'fr' ? 'en' : 'fr'); });

  /* Thème clair / sombre */
  d.getElementById('theme').addEventListener('click', function () {
    var cur = html.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    store('theme', next);
  });

  /* Menu mobile */
  var menu = d.getElementById('menu'), links = d.getElementById('links');
  menu.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' || e.target.parentNode.tagName === 'A') {
      links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
    }
  });

  /* Barre de progression et bouton « haut de page » */
  var bar = d.getElementById('progress'), topBtn = d.getElementById('top-btn'), ticking = false;
  function onScroll() {
    var h = html.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    topBtn.classList.toggle('show', scrollY > 600);
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  topBtn.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  onScroll();

  /* Lien actif dans le menu */
  var navLinks = [].slice.call(d.querySelectorAll('.links a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    d.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

    /* Apparition au défilement (le contenu reste visible sans JavaScript) */
    if (!reduce) {
      var rev = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); } });
      }, { threshold: 0.12 });
      d.querySelectorAll('main section:not(.hero), .project, .skills > div, .timeline li').forEach(function (el) {
        el.classList.add('reveal'); rev.observe(el);
      });
    }
  }

  /* Compteurs animés */
  function count(el) {
    var end = +el.getAttribute('data-count'), suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end + suffix; return; }
    var t0 = null;
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1000, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  d.querySelectorAll('[data-count]').forEach(count);
})();
