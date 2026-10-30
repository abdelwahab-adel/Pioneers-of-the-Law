/* رواد القانون — زر «العودة لأعلى الصفحة» (ظهوره يضبطه main.js عبر الصنف sc-fb على <html>) */
(function () {
  'use strict';
  var b = document.querySelector('.up');
  if (!b) return;
  b.addEventListener('click', function () {
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  });
})();
