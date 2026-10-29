/* رواد القانون — «اقرأ المزيد» في التخصصات يفتح بطاقة منبثقة (dialog أصلي: Esc، حبس التركيز، إغلاق بالنقر خارجها).
   دون JS أو دون دعم dialog يبقى <details> يتوسّع داخل البطاقة كما كان. */
(function () {
  'use strict';
  var grid = document.getElementById('pcg');
  if (!grid || typeof HTMLDialogElement === 'undefined') return;
  var root = document.documentElement, dlg = document.createElement('dialog'), from = null;
  dlg.className = 'pm'; dlg.setAttribute('aria-labelledby', 'pm-t');
  document.body.appendChild(dlg);
  [].forEach.call(grid.querySelectorAll('details.dt>summary'), function (s) { s.setAttribute('aria-haspopup', 'dialog'); });

  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }
  function clean(n) {
    var c = n.cloneNode(true); c.removeAttribute('style');
    [].forEach.call(c.querySelectorAll('[style]'), function (x) { x.removeAttribute('style'); });
    return c;
  }

  function build(card) {
    var det = card.querySelector('details.dt'), cover = card.querySelector('.cover');
    var top = el('header', 'pm-top'), cv = cover.cloneNode(true);
    cv.classList.add('pm-cover'); top.appendChild(cv);

    var ttl = el('div', 'pm-ttl'), h = el('h3', '', card.querySelector('h3').textContent), intro = card.querySelector('.cb>p'), tg = card.querySelector('.tgs');
    h.id = 'pm-t'; ttl.appendChild(h);
    if (tg) ttl.appendChild(clean(tg));
    top.appendChild(ttl);

    var x = el('button', 'pm-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'إغلاق');
    x.addEventListener('click', function () { dlg.close(); }); top.appendChild(x);

    var body = el('div', 'pm-body'), sec = null, cta = null;
    if (intro) body.appendChild(el('p', 'pm-d', intro.textContent));
    [].forEach.call(det.children, function (c) {
      if (c.tagName === 'SUMMARY') return;
      if (c.tagName === 'A') { cta = c; return; }
      if (c.tagName === 'H4') { sec = el('section', 'pm-sec'); body.appendChild(sec); }
      if (sec) sec.appendChild(clean(c));
    });

    var ft = el('footer', 'pm-ft'), a = el('a', 'bt f pm-cta', cta ? cta.textContent.trim() : 'احجز استشارة');
    a.href = (cta && cta.getAttribute('href')) || '#contact';
    a.addEventListener('click', function () { dlg.close(); });
    ft.appendChild(a);
    var fn = document.querySelector('#practice .fn');
    if (fn) ft.appendChild(el('p', 'pm-fn', fn.textContent));

    dlg.textContent = ''; dlg.appendChild(top); dlg.appendChild(body); dlg.appendChild(ft);
  }

  grid.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('details.dt>summary');
    if (!s) return;
    e.preventDefault();
    from = s; build(s.closest('.pc'));
    root.classList.add('pm-lock'); dlg.showModal(); dlg.scrollTop = 0;
  });

  dlg.addEventListener('click', function (e) {
    if (e.target !== dlg) return;
    var r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });
  dlg.addEventListener('close', function () { root.classList.remove('pm-lock'); if (from) from.focus(); });
})();
