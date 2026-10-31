/* إسناد القانونية — main.js */
(function () {
  'use strict';

  /* ===== CONFIG — fill these in; every button and form is wired automatically =====
     phone        '+966500000000'   → «اتصل الآن» buttons become tel: links
     whatsapp     '966500000000'    → WhatsApp buttons open wa.me (digits only)
     email        'info@example.sa' → shown in contact + footer
     formEndpoint 'https://…'       → URL that accepts a JSON POST (Formspree, your backend…)
                                      While empty, forms run in DEMO mode: nothing is sent.
     social       full profile URLs for the four icons                                    */
  var CONFIG = {
    phone: '',
    whatsapp: '',
    email: '',
    formEndpoint: '',
    social: { li: '', x: '', ig: '', yt: '' }
  };

  /* Search index: [title, section anchor, kind] */
  var DATA = [["القانون التجاري", "#practice", "مجال ممارسة"], ["القانون الجنائي", "#practice", "مجال ممارسة"], ["القضايا المدنية", "#practice", "مجال ممارسة"], ["الأحوال الشخصية", "#practice", "مجال ممارسة"], ["تأسيس الشركات", "#practice", "مجال ممارسة"], ["العقود", "#practice", "مجال ممارسة"], ["الاستثمار", "#practice", "مجال ممارسة"], ["التحكيم", "#practice", "مجال ممارسة"], ["الملكية الفكرية", "#practice", "مجال ممارسة"], ["الضرائب", "#practice", "مجال ممارسة"], ["العقارات", "#practice", "مجال ممارسة"], ["التنفيذ", "#practice", "مجال ممارسة"], ["التحصيل", "#practice", "مجال ممارسة"], ["قضايا العمل", "#practice", "مجال ممارسة"], ["التقاضي الدولي", "#practice", "مجال ممارسة"], ["تسوية نزاع تجاري دولي بمطالبة كبرى", "#cases", "دراسة حالة"], ["نزاع ملكية عقاري متعدد الأطراف", "#cases", "دراسة حالة"], ["اندماج استراتيجي بين شركتين تقنيتين", "#cases", "دراسة حالة"], ["تحكيم تجاري أمام مركز دولي مرموق", "#cases", "دراسة حالة"], ["دفاع في قضية جنائية معقدة", "#cases", "دراسة حالة"], ["تحصيل مطالبات مالية متعثرة", "#cases", "دراسة حالة"], ["التعديلات الجديدة على نظام الشركات وأثرها على الحوكمة", "#articles", "مقال"], ["خمس نقاط يجب مراجعتها قبل توقيع أي عقد تجاري", "#articles", "مقال"], ["التحكيم التجاري كبديل استراتيجي عن التقاضي التقليدي", "#articles", "مقال"], ["أبرز التعديلات على نظام العمل ومتطلبات الامتثال", "#articles", "مقال"], ["حماية العلامة التجارية: خطوات التسجيل والدفاع عن الحقوق", "#articles", "مقال"], ["التوثيق العقاري الإلكتروني وأثره على تقليل المنازعات", "#articles", "مقال"]];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Contact buttons / placeholders ---------- */
  var wa = CONFIG.whatsapp.replace(/\D/g, '');
  $$('[data-act]').forEach(function (a) {
    var act = a.dataset.act;
    if (act === 'call' && CONFIG.phone) a.href = 'tel:' + CONFIG.phone.replace(/\s/g, '');
    if (act === 'wa' && wa) { a.href = 'https://wa.me/' + wa; a.target = '_blank'; a.rel = 'noopener'; }
  });
  $$('[data-fill]').forEach(function (s) {
    var v = { phone: CONFIG.phone, wa: wa ? '+' + wa : '', email: CONFIG.email }[s.dataset.fill];
    if (v) s.textContent = v;
  });
  $$('.soc a[data-s]').forEach(function (a) {
    var url = CONFIG.social[a.dataset.s];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
  });

  /* ---------- Header: scrolled state, mobile menu, active section ---------- */
  var header = $('header');
  var bar = $('.hd');
  function onScroll() { header.classList.toggle('scr', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $('.bm').addEventListener('click', function () { bar.classList.toggle('o'); });
  $$('.nv a').forEach(function (a) {
    a.addEventListener('click', function () { bar.classList.remove('o'); });
  });
  var navLinks = {};
  $$('.nv ul a').forEach(function (a) { navLinks[a.getAttribute('href')] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(navLinks).forEach(function (h) { navLinks[h].removeAttribute('aria-current'); });
        var link = navLinks['#' + en.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(navLinks).forEach(function (h) { var s = $(h); if (s) spy.observe(s); });
  }

  /* ---------- Hero headline rotation: 3 texts, every 4s; the old text fully leaves before the next enters ---------- */
  var hxItems = $$('.hx-i');
  if (hxItems.length > 1 && !reduceMotion) {
    var hxPos = 0, hxTimer = 0, hxPaused = false, hxHold = { hover: false, key: false };
    var hxSchedule = function (ms) {
      clearTimeout(hxTimer);
      if (!hxPaused && !document.hidden) hxTimer = setTimeout(hxSwap, ms);
    };
    var hxSwap = function () {
      var cur = hxItems[hxPos];
      cur.classList.remove('on'); cur.classList.add('out');
      setTimeout(function () {            /* completes even if paused meanwhile, so nothing is left half-hidden */
        cur.classList.remove('out');
        hxPos = (hxPos + 1) % hxItems.length;
        hxItems[hxPos].classList.add('on');
        hxSchedule(3350);
      }, 650);
    };
    var hxSync = function () {
      hxPaused = hxHold.hover || hxHold.key;
      if (hxPaused) clearTimeout(hxTimer); else hxSchedule(4000);
    };
    var hxBtns = $('.hr2 .hb'), hxHero = $('.hr2');
    if (hxBtns && window.matchMedia('(hover:hover)').matches) {   /* pause only while the pointer is on the buttons */
      hxBtns.addEventListener('mouseenter', function () { hxHold.hover = true; hxSync(); });
      hxBtns.addEventListener('mouseleave', function () { hxHold.hover = false; hxSync(); });
    }
    hxHero.addEventListener('focusin', function (e) {              /* keyboard focus only, not a mouse click */
      var kb = true; try { kb = e.target.matches(':focus-visible'); } catch (x) {}
      hxHold.key = kb; hxSync();
    });
    hxHero.addEventListener('focusout', function () { hxHold.key = false; hxSync(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(hxTimer); else hxSchedule(4000);
    });
    hxSchedule(4000);
  }

  /* ---------- Scroll reveal (skipped when the user prefers reduced motion) ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px 10% 0px' });   /* threshold 0: الحاويات الطويلة (مثل شبكة التخصصات) كانت تحتاج ظهور 10% من ارتفاعها كله فتتأخر أو لا تظهر على الجوال */
    $$('main .w > *, .gr > *, .sh3 > *, .wc > *, .tl > *, .jr > *, .st > *').forEach(function (el) {
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.classList.add('rv');
      el.style.transitionDelay = Math.min(index, 4) * 50 + 'ms';
      reveal.observe(el);
    });
  }

  /* ---------- Category filters (practice areas, case studies) ---------- */
  var counter = $('#cc');
  function updateCounter() {
    if (!counter) return;
    var visible = $$('#csg [data-cat]').filter(function (el) { return !el.hidden; }).length;
    counter.textContent = counter.dataset.t.replace(/\d+/, visible);
  }
  $$('.fl').forEach(function (barEl) {
    barEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      $$('button', barEl).forEach(function (b) { b.classList.toggle('on', b === btn); });
      $$('[data-cat]', $(barEl.dataset.t)).forEach(function (el) {
        el.hidden = btn.dataset.c !== 'all' && el.dataset.cat !== btn.dataset.c;
      });
      updateCounter();
    });
  });
  updateCounter();

  /* ---------- About tabs ---------- */
  var tabs = $$('.tb button');
  var panel = $('#tp');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
      panel.textContent = tab.dataset.x;
    });
  });

  /* ---------- Forms: collect → send → success / error ---------- */
  var errBox = $('#fe');
  var errorText = errBox.dataset.t;
  function send(form, extra, onOk, onFail) {
    var payload = {};
    $$('input,select', form).forEach(function (f, i) {
      var label = f.closest('label');
      var key = f.name || (label ? label.firstChild.textContent.trim() : f.type + i);
      payload[key] = f.value;
    });
    Object.keys(extra || {}).forEach(function (k) { payload[k] = extra[k]; });
    var busy = $$('button[type=submit],.nx', form);
    busy.forEach(function (b) { b.setAttribute('aria-busy', 'true'); });
    function finish(fn) { busy.forEach(function (b) { b.removeAttribute('aria-busy'); }); fn(); }
    if (!CONFIG.formEndpoint) {
      console.warn('[forms] CONFIG.formEndpoint is empty: demo mode, nothing was sent.');
      setTimeout(function () { finish(onOk); }, 500);
      return;
    }
    fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      finish(onOk);
    }).catch(function () { finish(onFail); });
  }

  $$('form[data-ok]').forEach(function (form) {
    var done = form.nextElementSibling;
    var err = document.createElement('p');
    err.className = 'er';
    err.setAttribute('role', 'alert');
    err.hidden = true;
    err.textContent = errorText;
    done.parentNode.insertBefore(err, done);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      send(form, {}, function () { form.hidden = true; done.hidden = false; }, function () { err.hidden = false; });
    });
  });

  /* ---------- Package buttons pre-fill the booking form ---------- */
  var pkgName = '';
  var pkgNote = $('#pkn');
  $$('[data-pkg]').forEach(function (a) {
    a.addEventListener('click', function () {
      pkgName = a.dataset.pkg;
      pkgNote.textContent = pkgNote.dataset.p + pkgName;
      pkgNote.hidden = false;
    });
  });

  /* ---------- Booking form: 3 steps (the last step is the confirmation) ---------- */
  var booking = $('#bk');
  var steps = $$('.stp', booking);
  var stepLabel = $('#sn');
  var current = 0;
  function showStep(i) {
    current = i;
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    stepLabel.hidden = i > 1;
    stepLabel.textContent = stepLabel.dataset.t.replace('1', i + 1);
  }
  $$('.nx', booking).forEach(function (b) {
    b.addEventListener('click', function () {
      var valid = $$('input,select', steps[current]).every(function (f) { return f.reportValidity(); });
      if (!valid) return;
      if (current === steps.length - 2) {
        errBox.hidden = true;
        send(booking, pkgName ? { 'الباقة': pkgName } : {}, function () { showStep(current + 1); }, function () { errBox.hidden = false; });
      } else {
        showStep(current + 1);
      }
    });
  });
  $$('.pv', booking).forEach(function (b) {
    b.addEventListener('click', function () { showStep(current - 1); });
  });
  showStep(0);

  /* ---------- FAQ search ---------- */
  var faqInput = $('#fs');
  var faqItems = $$('.fq details');
  var noResults = $('#nf');
  faqInput.addEventListener('input', function () {
    var q = faqInput.value.trim();
    var shown = 0;
    faqItems.forEach(function (item) {
      var match = !q || item.textContent.indexOf(q) > -1;
      item.hidden = !match;
      if (match) shown++;
    });
    noResults.hidden = shown > 0;
  });

  /* ---------- Site search overlay ---------- */
  var overlay = $('#sr');
  var input = $('#ss');
  var results = $('#rs');
  var opener = null;
  function openSearch(btn) { opener = btn; overlay.classList.add('o'); input.focus(); }
  function closeSearch() { overlay.classList.remove('o'); if (opener) opener.focus(); }
  function renderResults() {
    var q = input.value.trim();
    results.textContent = '';
    if (!q) return;
    DATA.filter(function (r) { return r[0].indexOf(q) > -1; }).forEach(function (r) {
      var a = document.createElement('a');
      var kind = document.createElement('small');
      kind.textContent = r[2];
      a.href = r[1];
      a.appendChild(kind);
      a.appendChild(document.createTextNode(r[0]));
      a.addEventListener('click', closeSearch);
      results.appendChild(a);
    });
  }
  $$('.sb').forEach(function (b) { b.addEventListener('click', function () { openSearch(b); }); });
  input.addEventListener('input', renderResults);
  $('#sx').addEventListener('click', closeSearch);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('o')) closeSearch();
  });
})();

/* حركة بسيطة: ظهور العناصر عند التمرير + عدّ تصاعدي للأرقام */
(function () {
  'use strict';
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) return;
  var sel = 'section:not(.hr2) :is(.lb,.h2,.pc,.cc,.ar,.tm,.pk,.qb,.sc,.wcd,.tl li,.jr li,.mt>div,.st>div,.ix,.gl,.pt)';
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(function () { t.style.transitionDelay = ''; }, 1200);
    });
  }, { threshold: 0, rootMargin: '0px 0px 10% 0px' });
  [].forEach.call(document.querySelectorAll(sel), function (el, i) {
    el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 50 + 'ms'; io.observe(el);
  });
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, txt = el.textContent, n = parseInt(txt, 10);
      if (isNaN(n)) return;
      var tail = txt.replace(/^\d+/, ''), t0 = performance.now();
      (function step(t) {
        var k = Math.min(1, (t - t0) / 1200);
        el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + tail;
        if (k < 1) requestAnimationFrame(step); else el.textContent = txt;
      })(t0);
    });
  }, { threshold: 0.6 });
  [].forEach.call(document.querySelectorAll('.st b bdi'), function (b) { co.observe(b); });
})();

/* حرف الاسم الأول على لوحات الفريق */
(function () {
  'use strict';
  [].forEach.call(document.querySelectorAll('#team .tm'), function (t) {
    var h = t.querySelector('h3'), p = t.querySelector('.pt2');
    if (h && p) p.setAttribute('data-i', h.textContent.trim().charAt(0));
  });
})();

/* شبكة أمان: أي عنصر متحرك تجاوزه المستخدم بتمرير سريع يُظهَر فورًا */
(function () {
  'use strict';
  var raf = 0;
  function flush() {
    raf = 0;
    [].forEach.call(document.querySelectorAll('.rv:not(.in)'), function (el) {
      if (el.getBoundingClientRect().bottom < 0) el.classList.add('in');
    });
  }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(flush); }, { passive: true });
})();

/* قائمة الجوال: حالة aria-expanded، وإغلاق بمفتاح Escape أو بالنقر خارجها */
(function () {
  'use strict';
  var bm = document.querySelector('.bm'), bar = document.querySelector('.hd'), nav = document.querySelector('.nv');
  if (!bm || !bar || !nav) return;
  nav.id = nav.id || 'nav-main';
  bm.setAttribute('aria-controls', nav.id);
  function sync() { bm.setAttribute('aria-expanded', String(bar.classList.contains('o'))); }
  sync();
  new MutationObserver(sync).observe(bar, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bar.classList.contains('o')) { bar.classList.remove('o'); bm.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (bar.classList.contains('o') && !e.target.closest('.hd')) bar.classList.remove('o');
  });
})();

/* الصور العالية الدقة: إن تعذّر تحميل الرابط الخارجي نعود للصور المحلية دون تحميل الاثنتين معًا */
(function () {
  'use strict';
  var probe = new Image();
  probe.onerror = function () { document.documentElement.classList.add('hq-off'); };
  probe.src = "https://images.unsplash.com/photo-1780396070926-5abdd2a7928a?auto=format&fit=crop&w=2000&q=80";
})();

/* إظهار زر واتساب العائم بعد تجاوز الهيرو (يُطبَّق على الهاتف فقط عبر CSS) */
(function () {
  'use strict';
  var root = document.documentElement;
  function t() { root.classList.toggle('sc-fb', window.scrollY > 480); }
  window.addEventListener('scroll', t, { passive: true }); t();
})();
