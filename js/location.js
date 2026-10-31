/* إسناد القانونية — الخريطة: لا تلتقط التمرير إلا بعد النقر عليها */
(function () {
  'use strict';
  var f = document.querySelector('#location .mp-f');
  if (!f) return;
  f.classList.add('lock');
  f.addEventListener('click', function () { f.classList.add('act'); });
  document.addEventListener('pointerdown', function (e) {
    if (!f.contains(e.target)) f.classList.remove('act');
  });
  f.addEventListener('mouseleave', function () { f.classList.remove('act'); });
})();
