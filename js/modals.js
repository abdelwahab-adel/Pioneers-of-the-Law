/* رواد القانون — «اقرأ المقال كاملاً» و«عرض دراسة الحالة» يفتحان بطاقة منبثقة (dialog أصلي: Esc، حبس التركيز، إغلاق بالنقر خارجها).
   المحتوى يُقرأ من <details> الموجود في الصفحة نفسها، فلا نسخة ثانية للنصوص تحتاج صيانة.
   دون JS أو دون دعم dialog يبقى <details> يتوسّع داخل البطاقة كما كان. */
(function () {
  'use strict';
  if (typeof HTMLDialogElement === 'undefined') return;

  var SEL = '#articles details.dt>summary, #csg details.dt>summary';
  var root = document.documentElement, dlg = document.createElement('dialog'), from = null;
  dlg.className = 'mdl'; dlg.setAttribute('aria-labelledby', 'mdl-t');
  document.body.appendChild(dlg);
  [].forEach.call(document.querySelectorAll(SEL), function (s) { s.setAttribute('aria-haspopup', 'dialog'); });

  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }
  function q(node, sel) { return node ? node.querySelector(sel) : null; }
  function tx(node) { return node ? node.textContent.replace(/\s+/g, ' ').trim() : ''; }

  /* الرأس: صورة البطاقة نفسها (تحمل أصناف الصور) + الوسم + العنوان */
  function header(card, tagText, title) {
    var hd = el('div', 'mdl-hd'), src = q(card, '.cover');
    if (src) {
      var cv = src.cloneNode(true);
      cv.removeAttribute('style'); cv.classList.add('mdl-cover'); cv.setAttribute('aria-hidden', 'true');
      hd.appendChild(cv);
    }
    if (tagText) hd.appendChild(el('span', 'mdl-tag', tagText));
    var h = el('h2', '', title); h.id = 'mdl-t'; hd.appendChild(h);
    return hd;
  }

  /* التذييل: الملاحظات القانونية الموجودة في القسم + زر التواصل */
  function footer(notes, cta, fallback) {
    var ft = el('div', 'mdl-ft'), box = el('div', 'mdl-notes');
    notes.forEach(function (t) { if (t) box.appendChild(el('p', '', t)); });
    if (box.children.length) ft.appendChild(box);

    var label = fallback;
    if (cta) {
      var c = cta.cloneNode(true), sp = c.querySelector('span');
      if (sp) sp.remove();
      label = tx(c) || fallback;
    }
    var a = el('a', 'bt f mdl-cta'); a.appendChild(document.createTextNode(label)); a.appendChild(el('span', '', '←'));
    a.href = (cta && cta.getAttribute('href')) || '#contact';
    a.addEventListener('click', function () {
      /* لا نعيد التركيز إلى البطاقة فيقفز المتصفح إليها بدل #contact */
      from = null; root.classList.remove('mdl-lock'); dlg.close();
    });
    ft.appendChild(a);
    return ft;
  }

  function compose(mode, parts) {
    var x = el('button', 'mdl-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'إغلاق');
    x.addEventListener('click', function () { dlg.close(); });
    var sc = el('div', 'mdl-sc');
    parts.forEach(function (p) { if (p) sc.appendChild(p); });
    dlg.className = 'mdl' + (mode === 'case' ? ' is-case' : '');
    dlg.textContent = ''; dlg.appendChild(x); dlg.appendChild(sc);
    return sc;
  }

  /* ===== مقال ===== */
  function buildArticle(card) {
    var det = q(card, 'details.dt'), body = el('div', 'mdl-bd'), sec = null, cta = null;

    var meta = el('div', 'mdl-meta'), by = tx(q(card, '.by'));
    if (by) meta.appendChild(el('span', 'mdl-by', by));
    tx(q(card, '.cb>.mm')).split('·').forEach(function (p) { p = p.trim(); if (p) meta.appendChild(el('span', '', p)); });

    var intro = tx(q(card, '.cb>p'));
    if (intro) body.appendChild(el('p', 'mdl-lead', intro));

    [].forEach.call(det.children, function (c) {
      if (c.tagName === 'SUMMARY') return;
      if (c.tagName === 'A') { cta = c; return; }
      if (c.tagName === 'H4') { sec = el('section', 'mdl-sec'); sec.appendChild(el('h3', '', tx(c))); body.appendChild(sec); return; }
      if (c.tagName === 'P') {
        if (!sec) { sec = el('section', 'mdl-sec'); body.appendChild(sec); }
        sec.appendChild(el('p', '', tx(c)));
      }
    });

    var notes = [tx(document.querySelector('#articles .fn')), tx(document.querySelector('#articles .ix p'))];
    return compose('article', [header(card, tx(q(card, '.cb>em')), tx(q(card, 'h3'))), meta.children.length ? meta : null, body, footer(notes, cta, 'استشرنا في موضوع مشابه')]);
  }

  /* ===== دراسة حالة ===== */
  function buildCase(card) {
    var dl = q(card, 'details.dt dl'), cta = null, cur = null, pairs = [];
    [].forEach.call(dl.children, function (c) {
      if (c.tagName === 'DT') { cur = { t: tx(c), d: '' }; pairs.push(cur); }
      else if (c.tagName === 'DD') {
        var a = c.querySelector('a');
        if (a) cta = a; else if (cur) cur.d = tx(c);
      }
    });
    function take(word) {
      for (var i = 0; i < pairs.length; i++) if (pairs[i].t.indexOf(word) > -1) return pairs.splice(i, 1)[0];
      return null;
    }
    var summary = take('نبذة'), challenge = take('التحدي'), strategy = take('استراتيجية');

    /* النتيجة الأبرز بخط كبير، وباقي الأرقام بجانبها */
    var chips = [].slice.call(card.querySelectorAll('.ch i')), res = null;
    chips.forEach(function (c) { if (!res && c.classList.contains('res')) res = c; });
    var band = null;
    if (chips.length) {
      band = el('div', 'mdl-res');
      if (res) band.appendChild(el('strong', '', tx(res)));
      var ul = el('ul');
      chips.forEach(function (c) { if (c !== res) ul.appendChild(el('li', '', tx(c))); });
      if (ul.children.length) band.appendChild(ul);
    }

    var body = el('div', 'mdl-bd'), lead = tx(q(card, '.cb>p')) || (summary && summary.d);
    if (lead) body.appendChild(el('p', 'mdl-lead', lead));

    if (challenge || strategy) {
      var duo = el('div', 'mdl-duo');
      [[challenge, 'mdl-ch'], [strategy, 'mdl-st']].forEach(function (p) {
        if (!p[0]) return;
        var s = el('section', p[1]); s.appendChild(el('h3', '', p[0].t)); s.appendChild(el('p', '', p[0].d)); duo.appendChild(s);
      });
      if (duo.children.length < 2) duo.className = 'mdl-duo mdl-solo';
      body.appendChild(duo);
    }

    if (pairs.length) {
      var facts = el('dl', 'mdl-facts'), short = 0;
      pairs.forEach(function (p, i) {
        var wide = p.t.indexOf('نطاق') > -1 || p.d.length > 26, box = el('div', wide ? 'wide' : '');
        box.appendChild(el('dt', '', p.t)); box.appendChild(el('dd', '', p.d));
        facts.appendChild(box); if (!wide) short++;
      });
      facts.style.setProperty('--n', Math.max(2, Math.min(5, short)));
      body.appendChild(facts);
    }

    var notes = [tx(document.querySelector('#cases .fn')), tx(document.querySelector('#cases .ix p'))];
    return compose('case', [header(card, card.getAttribute('data-cat') || '', tx(q(card, 'h3'))), band, body, footer(notes, cta, 'استشرنا في قضية مشابهة')]);
  }

  document.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest(SEL);
    if (!s) return;
    var card = s.closest('article');
    if (!card) return;
    e.preventDefault();
    from = s;
    var sc = card.classList.contains('cc') ? buildCase(card) : buildArticle(card);
    root.classList.add('mdl-lock'); dlg.showModal(); sc.scrollTop = 0;
  });

  dlg.addEventListener('click', function (e) {
    if (e.target !== dlg) return;
    var r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });
  dlg.addEventListener('close', function () {
    root.classList.remove('mdl-lock');
    if (from) from.focus({ preventScroll: true });
    from = null;
  });
})();
