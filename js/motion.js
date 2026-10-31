/* إسناد القانونية — حركة إضافية: أزرار مغناطيسية. لا تعمل مع «تقليل الحركة». */
(function () {
  'use strict';
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* أزرار مغناطيسية (ماوس فقط، حدّ أقصى 6px) */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    [].forEach.call(document.querySelectorAll('.bt.f'), function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 12 + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * 8 + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
    });
  }
})();

/* الدفعة الثانية: تقسيم العناوين إلى كلمات */
(function () {
  'use strict';
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  [].forEach.call(document.querySelectorAll('section:not(.hr2) .h2'), function (h) {
    if (h.children.length || !h.textContent.trim()) return;
    var words = h.textContent.trim().split(/\s+/), frag = document.createDocumentFragment();
    h.setAttribute('aria-label', words.join(' '));
    words.forEach(function (w, k) {
      var s = document.createElement('span'), i = document.createElement('i');
      s.className = 'wm'; s.setAttribute('aria-hidden', 'true');
      i.style.setProperty('--k', k); i.textContent = w; s.appendChild(i);
      if (k) frag.appendChild(document.createTextNode(' '));
      frag.appendChild(s);
    });
    h.textContent = ''; h.appendChild(frag); h.classList.add('split');
  });

})();

/* شريط «موثوقون من»: تكرار القائمة لحلقة سلسة (النسخ مخفية عن قارئات الشاشة) */
(function () {
  'use strict';
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tr = document.querySelector('.tr'), ul = tr && tr.querySelector('ul');
  if (!ul) return;
  [].slice.call(ul.children).forEach(function (li) {
    var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c);
  });
  tr.classList.add('mq-on');
})();
