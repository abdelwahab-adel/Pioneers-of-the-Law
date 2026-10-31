#!/usr/bin/env python3
"""يولّد صفحات الموقع من tools/source.html (النسخة الأصلية ذات الصفحة الواحدة).
التشغيل من جذر المشروع:  python3 tools/build.py   — عدّل الرأس/التذييل/القائمة هنا ثم أعد التشغيل."""
import re, json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
src = (R / 'tools/source.html').read_text(encoding='utf-8')

# ---------- أجزاء الصفحة الأصلية ----------
head = src[:src.index('<body>') + 6]
svg = src[src.index('<svg width="0"'):src.index('<a class="skip"')]
main = src[src.index('<main id="main">') + 16:src.index('</main>')]
tail = src[src.index('</main>') + 7:]
header = re.search(r'<header id="home">.*?</header>', src, re.S).group(0)
S = re.findall(r'<section\b.*?</section>', main, re.S)
by = {re.search(r'id="([^"]+)"', re.match(r'<section[^>]*>', s).group(0)).group(1): s
      for s in S if re.search(r'id="', re.match(r'<section[^>]*>', s).group(0))}
hero, trust, stats = S[0], S[1], S[2]

SLUG = {'القانون التجاري': 'commercial-law', 'القانون الجنائي': 'criminal-law', 'القضايا المدنية': 'civil-cases',
        'الأحوال الشخصية': 'personal-status', 'تأسيس الشركات': 'company-formation', 'العقود': 'contracts',
        'الاستثمار': 'investment', 'التحكيم': 'arbitration', 'الملكية الفكرية': 'intellectual-property',
        'الضرائب': 'tax', 'العقارات': 'real-estate', 'التنفيذ': 'enforcement', 'التحصيل': 'debt-collection',
        'قضايا العمل': 'labor-cases', 'التقاضي الدولي': 'international-litigation'}

# ---------- مجالات الممارسة ----------
psec = by['practice']
P = []
for cat, b in re.findall(r'<article class="pc" data-cat="([^"]+)">(.*?)</article>', psec, re.S):
    t = re.search(r'<h3>(.*?)</h3>', b).group(1)
    xp = re.findall(r'<p class="xp">(.*?)</p>', b)
    P.append(dict(cat=cat, title=t, slug=SLUG[t], cover=re.search(r'<div class="(cover [^"]+)"', b).group(1),
                  rp=re.search(r'\b(rp\d+)\b', b).group(1),
                  sum=re.search(r'نبذة عن الخدمة</h4><p>(.*?)</p>', b).group(1),
                  tags=re.findall(r'<i>(.*?)</i>', re.search(r'<div class="tgs">(.*?)</div>', b).group(1)),
                  offers=re.findall(r'<li>(.*?)</li>', b), when=xp[0], docs=xp[1]))

def card(p, root=''):
    u = f'{root}practice/{p["slug"]}.html'
    tg = ''.join(f'<i>{x}</i>' for x in p['tags'])
    return (f'<article class="pc" data-cat="{p["cat"]}"><div class="{p["cover"]}"></div><div class="cb">'
            f'<h3><a href="{u}">{p["title"]}</a></h3><h4 class="sl">نبذة عن الخدمة</h4><p>{p["sum"]}</p>'
            f'<div class="tgs">{tg}</div><a class="more" href="{u}">اعرف المزيد <span>←</span></a></div></article>')

pc_head = psec[:psec.index('<div class="gr"')]
pc_tail = psec[psec.index('<p class="fn">'):]
practice_sec = pc_head + '<div class="gr" id="pcg" style="margin-top:44px">' + ''.join(card(p) for p in P) + '</div>' + pc_tail
teaser_head = re.sub(r'<div class="fl" data-t="#pcg">.*?</div>', '', pc_head, flags=re.S)
practice_teaser = (teaser_head + '<div class="gr" id="pcg" style="margin-top:44px">' + ''.join(card(p) for p in P[:6]) +
                   '</div><div class="pm"><a class="bt f" href="#practice">كل مجالات الممارسة</a></div></div></section>')

about_hd = re.search(r'<div class="hd2">.*?<a class="bt f" href="#partner">[^<]*</a></div>', by['about'], re.S).group(0)
# الرئيسية: النص بجانب صورة كبيرة (الصورة .i-ab في css/photos-hq.css، والتنسيق في css/about.css)
about_teaser = ('<section class="s c" id="about"><div class="w"><div class="ab">' +
                about_hd.replace('href="#partner">اقرأ المزيد', 'href="#about-page">تعرّف علينا') +
                '<figure class="ab-fig"><div class="im i-ab" role="img" aria-label="مطرقة القاضي وميزان العدالة ومحامٍ يكتب ملاحظاته"></div>'
                '<figcaption class="ab-badge"><b>2004</b><span>عام التأسيس</span></figcaption></figure>'
                '</div></div></section>')

# بطاقات «من نحن» الثلاث تفتح صفحات المجالات المقابلة
about_sec = by['about']
for name, slug in (('القضايا المدنية', 'civil-cases'), ('التحكيم', 'arbitration'), ('تأسيس الشركات', 'company-formation')):
    about_sec = re.sub(r'(<h3 class="sht"><span>%s</span>.*?<a class="bo" href=")#practice' % name,
                       r'\g<1>practice/%s.html' % slug, about_sec, flags=re.S)

# ---------- روابط وقوالب ----------
NAV = [('index.html', 'الرئيسية'), ('about.html', 'من نحن'), ('practice.html', 'مجالات الممارسة'),
       ('faq.html', 'الأسئلة الشائعة'), ('contact.html', 'تواصل معنا')]
ANCH = {'contact': 'contact.html', 'faq': 'faq.html', 'about-page': 'about.html', 'team': 'about.html#team',
        'partner': 'about.html#partner', 'timeline': 'about.html#timeline', 'method': 'about.html#method',
        'practice': 'practice.html', 'cases': 'index.html#cases', 'voices': 'index.html#voices',
        'articles': 'index.html#articles', 'home': 'index.html', 'why': 'index.html#why', 'about': 'about.html'}

def fix(h, local, root):
    h = re.sub(r'href="#([a-z-]+)"', lambda m: m.group(0) if m.group(1) in local or m.group(1) not in ANCH
               else f'href="{root}{ANCH[m.group(1)]}"', h)
    return re.sub(r'(href|src)="(css|js|img)/', r'\1="%s\2/' % root, h)

def banner(title, lead, crumbs, label='', cls=''):
    bc = ' <span>/</span> '.join(f'<a href="{u}">{t}</a>' for t, u in crumbs[:-1]) + f' <span>/</span> <b>{crumbs[-1][0]}</b>'
    lb = f'<div class="lb">{label}</div>' if label else ''
    return f'<section class="ph {cls}"><div class="w"><nav class="bc" aria-label="مسار التصفح">{bc}</nav>{lb}<h1>{title}</h1><p>{lead}</p></div></section>'

FOOT_PRACTICE = {'القانون التجاري': 'commercial-law', 'التقاضي المدني': 'civil-cases', 'التحكيم الدولي': 'arbitration',
                 'الأحوال الشخصية': 'personal-status', 'القانون العقاري': 'real-estate',
                 'الملكية الفكرية': 'intellectual-property', 'القضايا الجنائية': 'criminal-law'}

def page(path, title, desc, body, local, scripts, active):
    root = '../' * path.count('/')
    nav = ''.join(f'<li><a href="{root}{u}"{" aria-current=\"page\"" if u == active else ""}>{t}</a></li>' for u, t in NAV)
    hd = re.sub(r'<ul>.*?</ul>', '<ul>' + nav + '</ul>', header, count=1, flags=re.S)
    hd = hd.replace('href="#home"', 'href="#home-page"').replace('class="bt" href="#contact"', 'class="bt" href="#contact"')
    ft = tail
    for n, s in FOOT_PRACTICE.items():
        ft = ft.replace(f'<li><a href="#practice">{n}</a></li>', f'<li><a href="{root}practice/{s}.html">{n}</a></li>')
    quick = ''.join(f'<li><a href="{root}{u}">{t}</a></li>' for u, t in NAV[:2] + [('about.html#team', 'الفريق'), NAV[2]]
                    + [('index.html#cases', 'دراسات الحالة'), NAV[3], NAV[4]])
    ft = re.sub(r'(<h4 aria-level="3">روابط سريعة</h4><ul>).*?(</ul>)', lambda m: m.group(1) + quick + m.group(2), ft, flags=re.S)
    ft = re.sub(r'<script src=.*?</script>', '', ft).replace('</body></html>', ''.join(f'<script src="js/{s}.js" defer></script>' for s in scripts) + '</body></html>')
    h = head.replace('<html lang="ar" dir="rtl">', f'<html lang="ar" dir="rtl" data-root="{root}">')
    h = re.sub(r'<title>.*?</title>', f'<title>{title} | إسناد القانونية</title>', h)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', h)
    if path != 'index.html':
        h = re.sub(r'<script type="application/ld\+json">.*?</script>', '', h, flags=re.S)
    h = h.replace('</head>', '<link rel="stylesheet" href="css/pages.css"></head>')
    out = h + svg + '<a class="skip" href="#main">تخطي إلى المحتوى الرئيسي</a>' + hd + '<main id="main">' + body + '</main>' + ft
    out = fix(out, local, root).replace('href="#home-page"', f'href="{root}index.html"')
    p = R / path; p.parent.mkdir(exist_ok=True); p.write_text(out, encoding='utf-8')

SC = ['main', 'motion', 'location', 'float']
cta, ar = by['cta'], by['articles']

# ---------- الصفحات ----------
page('index.html', 'مكتب محاماة عالمي رائد — استشارات وتمثيل قانوني فاخر',
     'مكتب إسناد القانونية للمحاماة والاستشارات القانونية. تقاضي، تحكيم، عقود، ملكية فكرية، استثمار — الرياض.',
     hero + trust + stats + about_teaser + practice_teaser + by['why'] + by['cases'] + by['voices'] + by['accred'] + ar + cta,
     {'cases', 'voices', 'articles', 'why', 'home'}, SC + ['modals'], 'index.html')

page('about.html', 'من نحن', 'تعرّف على مكتب إسناد القانونية: قصتنا ومسيرتنا والشريك المدير والفريق ومنهجية العمل.',
     banner('مكتب بُني على الثقة والنتائج', 'نخبة من المحامين المتخصصين يمثلون الأفراد والشركات والمستثمرين بمنهجية واضحة وسرية تامة.',
            [('الرئيسية', 'index.html'), ('من نحن', '')], 'من نحن', 'b-about') +
     about_sec + by['timeline'] + by['partner'] + by['team'] + by['method'] + cta,
     {'about', 'timeline', 'partner', 'team', 'method', 'about-page'}, SC, 'about.html')

page('practice.html', 'مجالات الممارسة', 'خمسة عشر مجالًا قانونيًا يقدمها محامون مرخّصون: تجاري، جنائي، عقود، تحكيم، ملكية فكرية وغيرها.',
     banner('تغطية قانونية شاملة لكل احتياجاتكم', 'اختر المجال الأقرب لمسألتك لتعرف ما نقدّمه ومتى تحتاجه وما المستندات التي تفيد.',
            [('الرئيسية', 'index.html'), ('مجالات الممارسة', '')], 'مجالات الممارسة', 'b-practice') + practice_sec + cta,
     {'practice'}, SC, 'practice.html')

page('faq.html', 'الأسئلة الشائعة', 'إجابات واضحة عن آلية العمل والسرية والأتعاب والاستشارة الأولى، وأبرز الإجراءات النظامية في المملكة، من مكتب إسناد القانونية.',
     banner('الأسئلة الشائعة', 'إجابات واضحة ومختصرة عن آلية العمل والسرية والأتعاب، وأبرز الإجراءات النظامية.',
            [('الرئيسية', 'index.html'), ('الأسئلة الشائعة', '')], 'الأسئلة الشائعة', 'b-faq') + by['faq'] + cta,
     {'faq'}, SC, 'faq.html')

page('contact.html', 'تواصل معنا', 'احجز استشارة قانونية أو تواصل مع مكتب إسناد القانونية في الرياض.',
     banner('تواصل معنا', 'احجز استشارتك أو راسلنا، ونعود إليك خلال 30 دقيقة بإذن الله.',
            [('الرئيسية', 'index.html'), ('تواصل معنا', '')], 'تواصل معنا', 'b-contact') + by['contact'] + by['location'],
     {'contact', 'location'}, SC, 'contact.html')

# ---------- محتوى مشترك لصفحات المجالات (من نصوص الموقع نفسها) ----------
STEPS = re.findall(r'<div class="nu"><bdi dir="ltr">\d+</bdi></div><h3>(.*?)</h3><p>(.*?)</p>', by['method'])
CS = [dict(t=re.search(r'<h3>(.*?)</h3>', c).group(1), d=re.search(r'</h3><p>(.*?)</p>', c).group(1),
           r=re.search(r'<i class="res">(.*?)</i>', c).group(1), m=re.search(r'<span class="mm">(.*?)</span>', c).group(1))
      for c in re.findall(r'<article class="cc".*?</article>', by['cases'], re.S)]
FQ = re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', by['faq'])
TM = [dict(img=re.search(r'src="(img/[^"]+)"', c).group(1), n=re.search(r'team-name">(.*?)<', c).group(1),
           r=re.search(r'team-role">(.*?)<', c).group(1), sp=re.search(r'team-spec">(.*?)<', c).group(1),
           y=re.search(r'</svg> (\d+ سنة)', c).group(1)) for c in re.findall(r'<article class="team-card".*?</article>', by['team'], re.S)]
CASE = dict(zip(['commercial-law', 'real-estate', 'company-formation', 'contracts', 'investment', 'arbitration',
                 'international-litigation', 'criminal-law', 'debt-collection', 'enforcement', 'civil-cases'], [0, 1, 2, 2, 2, 3, 3, 4, 5, 5, 5]))
LAW = dict(zip(['commercial-law', 'arbitration', 'international-litigation', 'investment', 'civil-cases', 'real-estate', 'contracts',
                'company-formation', 'tax', 'criminal-law', 'enforcement', 'debt-collection', 'intellectual-property', 'labor-cases'],
               [0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3]))
import sys; sys.path.insert(0, str(R / 'tools')); from content import X
IMG = ['i-court', 'i-sc', 'i-cf', 'i-strip', 'i-ban2']

for i, p in enumerate(P):
    sl = p['slug']
    cs_, bd, mk_, (q, a) = X[sl]
    cs_ = ''.join(f'<li>{x}</li>' for x in cs_); mk_ = ''.join(f'<div><b>!</b><p>{x}</p></div>' for x in mk_)
    others = [P[(i + k) % len(P)] for k in range(1, 7)]
    rel = ''.join(f'<li><a href="{o["slug"]}.html">{o["title"]} <span>←</span></a></li>' for o in others)
    chips = ''.join(f'<li>{x}</li>' for x in ('استشارة أولى سرية', 'استجابة خلال 30 دقيقة', 'محامون مرخصون رسمياً'))
    offers = ''.join(f'<li><b>{n + 1:02d}</b><span>{x}</span></li>' for n, x in enumerate(p['offers']))
    steps = ''.join(f'<li><b>{t}</b><p>{d}</p></li>' for t, d in STEPS)
    faq = f'<details><summary>{q}</summary><p>{a}</p></details>' + ''.join(f'<details><summary>{FQ[k][0]}</summary><p>{FQ[k][1]}</p></details>' for k in (0, 1, 3))
    case = ''
    if sl in CASE:
        c = CS[CASE[sl]]
        case = (f'<h2>من واقع ملفاتنا</h2><div class="pd-case"><span class="pd-res">{c["r"]}</span><h3>{c["t"]}</h3>'
                f'<p>{c["d"]}</p><small>{c["m"]}</small></div>')
    law = ''
    if sl in LAW:
        t = TM[LAW[sl]]
        law = (f'<h2>المحامي المختص</h2><div class="pd-lw"><img src="{t["img"]}" alt="{t["n"]}" loading="lazy"><div><b>{t["n"]}</b>'
               f'<span>{t["r"]} · {t["sp"]}</span><small>{t["y"]} من الخبرة</small></div><a class="bt f" href="#contact">احجز مع المختص</a></div>')
    body = (banner(p['title'], p['sum'], [('الرئيسية', '../index.html'), ('مجالات الممارسة', '../practice.html'), (p['title'], '')],
                   'مجال ممارسة', p['rp']).replace('</p></div></section>', f'</p><ul class="ph-c">{chips}</ul></div></section>') +
            '<section class="s pd"><div class="w pd-g"><article class="pd-m">'
            f'<div class="pd-ov"><div><div class="pd-t">{"".join(f"<i>{x}</i>" for x in p["tags"])}</div>'
            f'<h2>نظرة عامة</h2><p>{p["sum"]}</p></div>'
            f'<div class="im cv {IMG[i % len(IMG)]} frm pd-img" role="img" aria-label="{p["title"]}"></div></div>'
            f'<h2>الحالات التي نتولاها</h2><ul class="pd-cs">{cs_}</ul><h2>ماذا نقدّم</h2><ul class="pd-og">{offers}</ul>'
            f'<div class="pd-2"><div><svg aria-hidden="true"><use href="#i-clock"/></svg><h3>متى تحتاج هذه الخدمة؟</h3><p>{p["when"]}</p></div>'
            f'<div><svg aria-hidden="true"><use href="#i-doc"/></svg><h3>مستندات تفيد عادةً</h3><p>{p["docs"]}</p></div></div>'
            f'<h2>أخطاء شائعة تجنّبها</h2><div class="pd-mk">{mk_}</div><h2>كيف نعمل معك</h2><ol class="pd-st">{steps}</ol>{case}{law}'
            f'<h2>أسئلة شائعة</h2><div class="pd-q">{faq}</div>'
            '<p class="fn">المعلومات المعروضة عامة وتوضيحية، ولا تُغني عن استشارة تناسب حالتك ووقائعها.</p></article>'
            '<aside class="pd-s"><div class="pd-card"><h3>احجز استشارة في هذا المجال</h3>'
            '<p>أرسل ملخص مسألتك ونتواصل معك خلال 30 دقيقة بإذن الله، بسرية تامة.</p>'
            '<a class="bt f" href="#contact">احجز استشارة</a><a class="bt" href="#contact" data-act="call">اتصل الآن</a>'
            '<a class="bt" href="#contact" data-act="wa">واتساب</a></div>'
            f'<div class="pd-bd"><h3>الجهات المختصة</h3><p>{bd}</p></div><div class="pd-rel"><h3>مجالات أخرى</h3><ul>{rel}</ul></div></aside></div></section>' + cta)
    page(f'practice/{sl}.html', p['title'], p['sum'], body, set(), SC, 'practice.html')

# ---------- main.js: يعمل على أي صفحة، والبحث يشير للصفحات الجديدة ----------
m = (R / 'tools/main.source.js').read_text(encoding='utf-8')
def rep(old, new):
    global m
    assert old in m, old[:50]
    m = m.replace(old, new)
D = ([[t, f'practice/{SLUG[t]}.html', 'مجال ممارسة'] for t in SLUG] +
     [[t, 'index.html#cases', 'دراسة حالة'] for t in re.findall(r'<h3>(.*?)</h3>', by['cases'])] +
     [[t, 'index.html#articles', 'مقال'] for t in re.findall(r'<h3>(.*?)</h3>', ar)] +
     [[t, u, 'صفحة'] for t, u in (('من نحن', 'about.html'), ('مسيرتنا المهنية', 'about.html#timeline'),
                                  ('الشريك المدير', 'about.html#partner'), ('الفريق القانوني', 'about.html#team'),
                                  ('منهجية العمل', 'about.html#method'), ('الأسئلة الشائعة', 'faq.html'), ('تواصل معنا', 'contact.html'))])
m = re.sub(r'var DATA = \[\[.*?\]\];', lambda _: 'var DATA = ' + json.dumps(D, ensure_ascii=False) + ';', m, flags=re.S)
rep('a.href = r[1];', "a.href = (document.documentElement.getAttribute('data-root') || '') + r[1];")
rep('var s = $(h); if (s) spy.observe(s);', "var s = h.charAt(0) === '#' ? $(h) : null; if (s) spy.observe(s);")
rep("var errBox = $('#fe');\n  var errorText = errBox.dataset.t;",
    "var errBox = $('#fe') || document.createElement('p');\n  var errorText = errBox.dataset.t || 'تعذّر الإرسال، حاول مرة أخرى.';")
rep("  var booking = $('#bk');", "  if ($('#bk')) {\n  var booking = $('#bk');")
rep("  showStep(0);\n", "  showStep(0);\n  }\n")
rep("faqInput.addEventListener('input'", "if (faqInput) faqInput.addEventListener('input'")
(R / 'js/main.js').write_text(m, encoding='utf-8')

# ---------- تنظيف وتوثيق ----------
(R / 'js/practice.js').unlink(missing_ok=True)
rd = R / 'README.md'; t = rd.read_text(encoding='utf-8')
if '## هيكل الصفحات المستقلة' not in t:
    rd.write_text(t + '''
## هيكل الصفحات المستقلة

- الصفحات: `index.html` (الرئيسية) · `about.html` (من نحن + مسيرتنا + الشريك المدير + الفريق + منهجية العمل) · `practice.html` (كل المجالات) · `practice/*.html` (صفحة مستقلة لكل مجال من الـ15) · `faq.html` · `contact.html` (النموذج والخريطة).
- الصفحات مولَّدة بـ`tools/build.py` من النسخة الأصلية `tools/source.html`. لتعديل القائمة أو التذييل أو نص مجال: عدّل السكربت أو المصدر ثم شغّل `python3 tools/build.py` من جذر المشروع.
- `css/pages.css` للبانر العلوي وبطاقات المجالات وصفحة المجال. `js/main.js` صار يعمل على أي صفحة (مولَّد من `tools/main.source.js`)، وحُذف `js/practice.js` لأن البطاقات صارت روابط لا نوافذ منبثقة.
''', encoding='utf-8')
print('pages:', 5 + len(P))
