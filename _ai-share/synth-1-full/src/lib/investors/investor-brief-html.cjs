'use strict';

const investorBriefMeta = Object.freeze({
  title: 'Syntha — Fashion OS | Обзор платформы',
  description:
    'Syntha связывает бренд, магазин, производителя и поставщика в сквозной Fashion OS: разработка, коллекция, заказ, производство, поставка и коммуникации.',
});

const roles = [
  ['Бренд', 'Brand', 'Управляет разработкой коллекции, образцами, коммерческой готовностью и исполнением заказа.'],
  ['Магазин / байер', 'Shop', 'Формирует ассортимент, собирает матрицу, размещает заказ и видит его фактический статус.'],
  ['Производитель', 'Manufacturer', 'Работает с производственным заказом, мощностями, материалами, качеством и выпуском.'],
  ['Поставщик', 'Supplier', 'Получает потребность в материалах, подтверждает условия, сроки и исполнение поставки.'],
];

const pillars = [
  ['01', 'Разработка продукта', 'Карточка артикула, спецификация, стоимость и подготовка к следующему этапу.'],
  ['02', 'Образцы', 'Заказ образца, измерения, качество, документы и решение о готовности.'],
  ['03', 'Заказ коллекции', 'Матрица, выбор байера, коммерческие условия и подтверждение заказа.'],
  ['04', 'Производство заказа', 'Производственный заказ, мощности, материалы, выпуск, качество и отгрузка.'],
  ['05', 'Коммуникации', 'Сообщения, календарь, документы, события, сроки и эскалации в контексте процесса.'],
];

const journey = [
  ['Артикул', 'Единая карточка продукта и контекст разработки.'],
  ['Коллекция', 'Ассортимент объединяется в управляемый сезонный контур.'],
  ['Заказ', 'Коммерческое решение превращается в подтверждённый заказ.'],
  ['Производство', 'Мощности, материалы, выпуск и контроль качества.'],
  ['Поставщик', 'Условия, материалы и обязательства связаны с заказом.'],
  ['Отгрузка', 'Факт поставки передаётся следующему участнику цепочки.'],
  ['Закрытие', 'Документы, решения и финальный статус сохраняют историю.'],
];

const valueCards = [
  ['Единый операционный контекст', 'Продукт, заказ, производство, поставка, документы и коммуникации остаются связанными между собой.'],
  ['Контролируемые передачи между ролями', 'Следующий участник получает не пересказ в письме, а связанный факт и состояние процесса.'],
  ['Прозрачность отклонений', 'Просрочка, дефект, нехватка материала или изменение заказа возвращаются в управляемый контур.'],
  ['Трассируемая история решений', 'Документы, статусы и действия сохраняются рядом с объектом, к которому они относятся.'],
  ['Рабочее место для каждой стороны', 'У ролей разные интерфейсы и задачи, но они работают с общей моделью процесса и данных.'],
  ['Основа для прикладного AI', 'Искусственный интеллект получает структурированный контекст и помогает поверх данных, а не заменяет их.'],
];

const operations = [
  ['BOM и расчёт стоимости', 'BOM — спецификация материалов; стоимость и состав остаются связаны с артикулом.'],
  ['RFQ и выбор поставщика', 'RFQ — запрос коммерческих условий по материалам и поставщикам.'],
  ['QC / AQL и качество', 'Контроль качества, приёмочный уровень качества и дефекты входят в историю продукта и заказа.'],
  ['Документы', 'Документы доступны в контексте артикула, заказа и передачи между участниками.'],
  ['DPP', 'DPP — цифровой паспорт продукта как отдельный связанный контур данных.'],
  ['Производственные мощности', 'Доступная мощность связывается с заказом и производственной площадкой.'],
  ['Отгрузка', 'Статус и факт отгрузки продолжают сквозную историю исполнения заказа.'],
  ['Контекстные коммуникации', 'Сообщения привязаны к продукту или заказу и не отделены от операционного процесса.'],
  ['Сроки и исключения', 'Просрочки и исключения выделяются в самостоятельный контур контроля и эскалации.'],
];

const platformLogic = [
  ['Связанный операционный граф', 'Артикул, коллекция, заказ, производство, поставка, документы и коммуникации образуют одну цепочку.'],
  ['Один процесс для четырёх сторон', 'Бренд, магазин, производитель и поставщик используют разные представления одного бизнес-контекста.'],
  ['AI поверх структурированных данных', 'Модели получают контекст из доменных данных, визуального поиска и истории процесса.'],
  ['Расширяемая интеграционная граница', 'Внешние системы подключаются через интеграции и API, сохраняя единую доменную модель Syntha.'],
];

const architecture = [
  ['Интерфейс', 'Next.js 15 / App Router', 'Публичные поверхности, кабинеты ролей и Platform Core.'],
  ['Сервисный слой', 'FastAPI + Next BFF', 'API, контракты данных, сервисы и интеграционные границы.'],
  ['Данные', 'PostgreSQL + Redis', 'Постоянные данные, кеш и tenant-aware хранение по организациям.'],
  ['Доступ', 'JWT + RBAC', 'JWT-аутентификация и RBAC — ролевая модель прав доступа.'],
  ['AI-контур', 'LLM + CLIP / FAISS + agents', 'Языковые модели, визуальное сходство, агенты и обратная связь.'],
];

const implemented = [
  'платформенное ядро /platform и матрица ролей × процессов',
  'рабочие контуры производителя и поставщика',
  'контуры BOM, RFQ, QC, документов и DPP',
  'контуры мощностей, отгрузки и контекстных коммуникаций',
  'проверка готовности по ролям и ключевым процессам',
];

const hardening = [
  'полная сквозная квалификация маршрута через все четыре роли',
  'контуры заказа коллекции для бренда и магазина',
  'усиление навигации и сокращение legacy-слоя',
  'обновление критических данных в реальном времени',
  'формализация оставшихся действий и побочных эффектов',
];

const problemCards = [
  ['Разные роли', 'Каждый участник работает в своём контуре, но передаёт проверяемый факт следующему.'],
  ['Разные системы', 'Объекты связываются едиными идентификаторами и общей историей изменений.'],
  ['Разные состояния', 'План, согласование и фактическое исполнение не подменяют друг друга.'],
  ['Разные исключения', 'Просрочка, дефект или изменение возвращаются в управляемый процесс.'],
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sectionHeading(eyebrow, title, lead = '') {
  return `<div class="section-head"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2>${escapeHtml(title)}</h2>${lead ? `<p class="lead">${escapeHtml(lead)}</p>` : ''}</div>`;
}

function cards(items, extraClass = '') {
  return `<div class="cards ${extraClass}">${items
    .map(([title, text], index) => `<article class="card"><span class="index">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`)
    .join('')}</div>`;
}

function statusList(items, tone) {
  return `<ul class="status-list ${tone}">${items
    .map((item) => `<li><span aria-hidden="true">${tone === 'done' ? '✓' : '↗'}</span><p>${escapeHtml(item)}</p></li>`)
    .join('')}</ul>`;
}

function normalizeQrSvg(qrSvg) {
  if (!qrSvg) return '';
  const clean = String(qrSvg).replace(/^<\?xml[^>]*>\s*/i, '');
  if (/<title[ >]/i.test(clean)) return clean;
  return clean.replace(/(<svg\b[^>]*>)/i, '$1<title>QR-код публичной страницы Syntha</title>');
}

function renderInvestorBriefHtml(options = {}) {
  const canonicalUrl = options.canonicalUrl || '';
  const platformHref = options.platformHref || '/platform';
  const platformLabel = options.platformLabel || 'Открыть платформу';
  const contactUrl = options.contactUrl || '';
  const qrSvg = normalizeQrSvg(options.qrSvg || '');
  const canonicalEscaped = escapeHtml(canonicalUrl);
  const platformEscaped = escapeHtml(platformHref);
  const contactEscaped = escapeHtml(contactUrl);
  const title = escapeHtml(investorBriefMeta.title);
  const description = escapeHtml(investorBriefMeta.description);
  const ogImage = canonicalUrl ? `${canonicalUrl.replace(/\/investors\/?$/, '')}/investors/opengraph-image` : '';

  const roleGrid = roles
    .map(([name, key, text]) => `<article class="role-card"><span class="role-key">${escapeHtml(key)}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(text)}</p></article>`)
    .join('');
  const pillarRows = pillars
    .map(([index, titleText, text]) => `<div class="pillar"><span>${index}</span><strong>${escapeHtml(titleText)}</strong><p>${escapeHtml(text)}</p></div>`)
    .join('');
  const journeyCards = journey
    .map(([titleText, text], index) => `<article class="journey-card"><span>${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(titleText)}</h3><p>${escapeHtml(text)}</p></article>`)
    .join('');
  const architectureRows = architecture
    .map(([layer, technology, text], index) => `<div class="architecture-row"><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(layer)}</span><strong>${escapeHtml(technology)}</strong><p>${escapeHtml(text)}</p></div>`)
    .join('');
  const journeyInline = journey.map(([titleText]) => `<span>${escapeHtml(titleText)}</span>`).join('<b>→</b>');

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${canonicalUrl ? `<link rel="canonical" href="${canonicalEscaped}"><meta name="robots" content="index,follow">` : '<meta name="robots" content="noindex,follow">'}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Syntha">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  ${canonicalUrl ? `<meta property="og:url" content="${canonicalEscaped}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#0f172a">
  <style>
    :root{color-scheme:light;--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--paper:#f8fafc;--white:#fff;--blue:#0369a1;--blue2:#0ea5e9;--dark:#020617;--dark2:#0f172a;--green:#047857;--amber:#b45309}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}button{font:inherit}.wrap{width:min(1180px,calc(100% - 32px));margin:0 auto}.topbar{position:sticky;top:0;z-index:20;border-bottom:1px solid rgba(226,232,240,.9);background:rgba(255,255,255,.94);backdrop-filter:blur(12px)}.topbar-inner{height:64px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{font-size:18px;font-weight:800;letter-spacing:.22em}.nav{display:flex;gap:24px;color:#475569;font-size:14px;font-weight:600}.nav a:hover{color:#020617}.btn{display:inline-flex;min-height:44px;align-items:center;justify-content:center;border-radius:9px;border:1px solid transparent;padding:0 18px;font-size:14px;font-weight:750;cursor:pointer}.btn-dark{background:var(--ink);color:#fff}.btn-blue{background:#0369a1;color:#fff}.btn-outline{border-color:#475569;color:#e2e8f0;background:transparent}.hero{border-bottom:1px solid #1e293b;background:var(--dark);color:#fff}.hero-grid{display:grid;grid-template-columns:1.06fr .94fr;gap:54px;align-items:center;padding:88px 0}.badge{display:inline-flex;align-items:center;border:1px solid #334155;border-radius:999px;background:#0f172a;padding:8px 12px;color:#cbd5e1;font-size:12px;font-weight:750;letter-spacing:.04em}.hero h1{margin:26px 0 0;max-width:760px;font-size:clamp(40px,5vw,64px);line-height:1.04;letter-spacing:-.045em}.hero-copy{margin:24px 0 0;max-width:700px;color:#cbd5e1;font-size:19px;line-height:1.6}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin-top:38px;overflow:hidden;border:1px solid #1e293b;border-radius:12px;background:#1e293b}.fact{background:#020617;padding:18px}.fact strong{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:22px}.fact span{display:block;margin-top:5px;color:#64748b;font-size:10px;font-weight:750;text-transform:uppercase;letter-spacing:.1em}.hero-panel{border:1px solid #334155;border-radius:18px;background:#0f172a;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,.2)}.panel-label{margin:0;color:#64748b;font:700 10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.18em}.hero-panel h2{margin:8px 0 0;font-size:16px}.role-mini{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.role-mini div{border:1px solid #1e293b;border-radius:10px;background:#020617;padding:13px}.role-mini strong{display:block;font-size:12px}.role-mini span{display:block;margin-top:4px;color:#64748b;font:600 10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}.journey-inline{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:14px;border:1px solid #1e293b;border-radius:11px;background:#020617;padding:14px;font-size:11px;color:#cbd5e1}.journey-inline span{border:1px solid #1e293b;border-radius:6px;padding:7px 8px}.journey-inline b{color:#475569}.panel-note{margin-top:14px;border:1px solid #0c4a6e;border-radius:11px;background:#082f49;padding:14px;color:#cbd5e1;font-size:12px;line-height:1.6}.section{padding:78px 0;border-bottom:1px solid var(--line);background:#fff}.section.alt{background:var(--paper)}.section.dark{background:var(--dark);color:#fff;border-color:#1e293b}.section-head{max-width:790px}.eyebrow{margin:0;color:var(--blue);font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.dark .eyebrow{color:#38bdf8}.section-head h2{margin:12px 0 0;font-size:clamp(30px,4vw,42px);line-height:1.12;letter-spacing:-.035em}.lead{margin:16px 0 0;color:var(--muted);font-size:17px;line-height:1.65}.dark .lead{color:#cbd5e1}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:36px}.cards.four{grid-template-columns:repeat(4,1fr)}.cards.two{grid-template-columns:repeat(2,1fr)}.card,.role-card,.journey-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:22px;box-shadow:0 1px 2px rgba(15,23,42,.04)}.section:not(.alt) .card{background:var(--paper)}.dark .card{border-color:#1e293b;background:#0f172a}.index,.role-key{display:block;color:var(--blue);font:750 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase}.dark .index{color:#38bdf8}.card h3,.role-card h3,.journey-card h3{margin:14px 0 0;font-size:16px}.card p,.role-card p,.journey-card p{margin:10px 0 0;color:var(--muted);font-size:14px;line-height:1.65}.dark .card p{color:#cbd5e1}.roles{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:36px}.pillars{margin-top:18px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}.pillars-head{padding:18px 22px;border-bottom:1px solid var(--line)}.pillars-head strong{font-size:14px}.pillars-head p{margin:5px 0 0;color:var(--muted);font-size:12px}.pillar{display:grid;grid-template-columns:60px 220px 1fr;gap:18px;padding:19px 22px;border-bottom:1px solid #f1f5f9}.pillar:last-child{border-bottom:0}.pillar span{color:var(--blue);font:700 13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.pillar strong{font-size:14px}.pillar p{margin:0;color:var(--muted);font-size:14px;line-height:1.6}.journey{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-top:36px}.journey-card{padding:17px}.journey-card span{font:700 10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#94a3b8}.journey-card h3{font-size:13px}.journey-card p{font-size:12px;line-height:1.55}.subhead{margin:44px 0 0;color:#64748b;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.architecture{display:grid;grid-template-columns:1.2fr .8fr;gap:22px;margin-top:36px}.architecture-list{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--paper)}.architecture-row{display:grid;grid-template-columns:130px 190px 1fr;gap:16px;padding:20px;border-bottom:1px solid var(--line)}.architecture-row:last-child{border-bottom:0}.architecture-row span{color:var(--blue);font:700 10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.07em}.architecture-row strong{font-size:14px}.architecture-row p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}.architecture-notes{display:grid;gap:12px}.note{border:1px solid var(--line);border-radius:12px;background:var(--paper);padding:22px}.note h3{margin:0;font-size:17px}.note p{margin:10px 0 0;color:var(--muted);font-size:14px;line-height:1.65}.status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:36px}.status-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:22px}.status-pill{display:inline-flex;border-radius:999px;padding:6px 10px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.status-pill.done{background:#ecfdf5;color:var(--green)}.status-pill.progress{background:#fffbeb;color:var(--amber)}.status-pill.evidence{background:#f0f9ff;color:var(--blue)}.status-card h3{margin:16px 0 0;font-size:17px}.status-card>p{color:var(--muted);font-size:14px;line-height:1.65}.status-list{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:10px}.status-list li{display:flex;gap:10px;align-items:flex-start}.status-list li span{display:grid;place-items:center;flex:0 0 21px;height:21px;border-radius:50%;font-size:11px;font-weight:800}.status-list.done li span{background:#ecfdf5;color:var(--green)}.status-list.progress li span{background:#fffbeb;color:var(--amber)}.status-list li p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}.share{padding:76px 0;background:#fff}.share-box{display:grid;grid-template-columns:1fr 290px;gap:38px;align-items:center;border:1px solid #1e293b;border-radius:18px;background:var(--dark);padding:40px;color:#fff;box-shadow:0 18px 45px rgba(15,23,42,.12)}.share-box h2{margin:12px 0 0;max-width:720px;font-size:36px;line-height:1.12;letter-spacing:-.035em}.share-box .lead{color:#cbd5e1}.url-box{margin-top:22px;max-width:720px;border:1px solid #1e293b;border-radius:10px;background:#0f172a;padding:14px}.url-box small{display:block;color:#64748b;font:700 10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.14em}.url-box code{display:block;margin-top:7px;color:#e2e8f0;font:500 12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}.qr{display:grid;place-items:center;min-height:250px;border-radius:14px;background:#fff;color:var(--ink);padding:20px;text-align:center}.qr svg{display:block;width:min(204px,100%);height:auto}.qr p{margin:13px 0 0;color:#475569;font-size:12px;font-weight:750}.footer{border-top:1px solid var(--line);background:var(--paper);padding:30px 0}.footer-inner{display:flex;gap:30px;justify-content:space-between;align-items:flex-start}.footer strong{font-size:14px}.footer p{max-width:850px;margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.6}.footer a{color:var(--blue);font-size:13px;font-weight:750}.only-mobile{display:none}
    @media(max-width:980px){.nav{display:none}.hero-grid,.architecture,.share-box{grid-template-columns:1fr}.hero-grid{padding:70px 0}.cards.four,.roles{grid-template-columns:repeat(2,1fr)}.journey{grid-template-columns:repeat(2,1fr)}.architecture-row{grid-template-columns:110px 170px 1fr}.share-box{padding:30px}.qr{max-width:320px}}
    @media(max-width:640px){.wrap{width:min(100% - 28px,1180px)}.topbar-inner{height:58px}.brand{font-size:15px}.topbar .btn{min-height:38px;padding:0 12px;font-size:12px}.hero-grid{padding:52px 0;gap:34px}.hero h1{font-size:39px}.hero-copy{font-size:17px}.facts{grid-template-columns:repeat(2,1fr)}.section,.share{padding:58px 0}.cards,.cards.four,.cards.two,.roles,.journey,.status-grid{grid-template-columns:1fr}.pillar{grid-template-columns:44px 1fr;gap:9px 12px}.pillar p{grid-column:2}.architecture-row{grid-template-columns:1fr;gap:7px}.share-box{padding:22px}.share-box h2{font-size:30px}.actions{flex-direction:column}.actions .btn{width:100%}.footer-inner{flex-direction:column}.role-mini{grid-template-columns:1fr 1fr}.only-mobile{display:inline}.hide-mobile{display:none}}
  </style>
</head>
<body>
  <header class="topbar"><div class="wrap topbar-inner"><a href="#top" class="brand" aria-label="Syntha — к началу страницы">SYNTHA</a><nav class="nav" aria-label="Разделы презентации"><a href="#platform">Платформа</a><a href="#process">Сквозной процесс</a><a href="#architecture">Архитектура</a><a href="#status">Готовность</a></nav><a class="btn btn-dark" href="${platformEscaped}">${escapeHtml(platformLabel)} →</a></div></header>
  <main id="top">
    <section class="hero"><div class="wrap hero-grid"><div><span class="badge">SYNTHA · FASHION OS</span><h1>От артикула до закрытия заказа — одна операционная среда fashion-бизнеса</h1><p class="hero-copy">Syntha связывает бренд, магазин, производителя и поставщика в единый процесс разработки коллекции, заказа, производства, поставки и контроля исполнения.</p><div class="actions"><a class="btn btn-blue" href="${platformEscaped}">Посмотреть платформу →</a>${contactUrl ? `<a class="btn btn-outline" href="${contactEscaped}">Обсудить партнёрство</a>` : ''}</div><div class="facts"><div class="fact"><strong>4</strong><span>роли</span></div><div class="fact"><strong>5</strong><span>сквозных контуров</span></div><div class="fact"><strong>1</strong><span>модель данных</span></div><div class="fact"><strong>E2E</strong><span>принцип работы</span></div></div></div><aside class="hero-panel"><p class="panel-label">Сквозная цепочка ролей</p><h2>Единый жизненный цикл коллекции и заказа</h2><div class="role-mini">${roles.map(([name,key])=>`<div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(key)}</span></div>`).join('')}</div><div class="journey-inline">${journeyInline}</div><div class="panel-note">Коммуникации, календарь, документы, события и исключения работают поверх общей цепочки, а не как отдельные несвязанные инструменты.</div></aside></div></section>

    <section class="section"><div class="wrap">${sectionHeading('ЗАЧЕМ НУЖНА SYNTHA','Основной разрыв возникает не внутри функции, а между участниками процесса','Каталог, заказ, производство, поставка, документы и коммуникации часто живут в разных контурах. Syntha сохраняет связь между ними и передаёт контекст вместе с процессом.')}${cards(problemCards,'four')}</div></section>

    <section class="section alt"><div class="wrap">${sectionHeading('ЦЕННОСТЬ ДЛЯ БИЗНЕСА','Что меняется, когда процесс и данные становятся едиными','Без неподтверждённых процентов и обещаний: ценность платформы определяется конкретными механизмами управления, которые она создаёт.')}${cards(valueCards)}</div></section>

    <section class="section" id="platform"><div class="wrap">${sectionHeading('КОМУ ПРЕДНАЗНАЧЕНА ПЛАТФОРМА','Четыре стороны одной fashion-цепочки','Syntha не сводит всех пользователей к одному перегруженному интерфейсу. Каждая сторона получает своё рабочее представление, оставаясь в общем процессе.')}<div class="roles">${roleGrid}</div><div class="pillars"><div class="pillars-head"><strong>Пять сквозных контуров Platform Core</strong><p>Каноническая продуктовая модель текущего ядра Syntha.</p></div>${pillarRows}</div></div></section>

    <section class="section alt" id="process"><div class="wrap">${sectionHeading('СКВОЗНОЙ ПРОЦЕСС','От артикула до закрытия — один маршрут данных и решений','Цель — не просто показать статусы. Связанный заказ, производственный заказ и коммуникация должны проходить цепочку ролей без потери контекста на каждой передаче.')}<div class="journey">${journeyCards}</div><p class="subhead">Функциональный слой</p>${cards(operations)}</div></section>

    <section class="section dark"><div class="wrap">${sectionHeading('ПЛАТФОРМЕННАЯ ЛОГИКА','Почему Syntha может масштабироваться как единая операционная платформа','Это описание продуктовой архитектуры, а не оценка рынка, стоимости компании или обещание финансового результата.')}${cards(platformLogic,'two')}</div></section>

    <section class="section" id="architecture"><div class="wrap">${sectionHeading('ТЕХНОЛОГИЧЕСКАЯ ОСНОВА','Операционный контекст, данные, доступ и AI разделены по слоям','Архитектура Syntha сочетает Next.js и FastAPI с PostgreSQL, Redis, ролевой моделью доступа и отдельным AI-контуром.')}<div class="architecture"><div class="architecture-list">${architectureRows}</div><div class="architecture-notes"><article class="note"><h3>AI — прикладной слой над данными</h3><p>В архитектуре предусмотрены языковые модели, маршрутизация запросов, embeddings, визуальный поиск, агенты и обратная связь. Источником истины остаются доменные данные и факты процесса.</p></article><article class="note"><h3>Организации и роли</h3><p>Данные разделяются по организациям; доступ строится через JWT и RBAC — ролевую модель прав.</p></article><article class="note"><h3>Единая доменная модель</h3><p>Интеграции расширяют платформу через API, не создавая параллельный источник истины для ключевых объектов процесса.</p></article></div></div></div></section>

    <section class="section alt" id="status"><div class="wrap">${sectionHeading('ТЕКУЩАЯ СТЕПЕНЬ ГОТОВНОСТИ','Реализованное отделено от того, что проходит промышленное усиление','Публичная презентация не выдаёт план развития за уже завершённую функциональность. Ниже зафиксирована текущая граница продукта по внутреннему аудиту.')}<div class="status-grid"><article class="status-card"><span class="status-pill done">Реализовано</span><h3>Существенное ядро уже в коде</h3>${statusList(implemented,'done')}</article><article class="status-card"><span class="status-pill progress">Промышленное усиление</span><h3>Сквозная квалификация продолжается</h3>${statusList(hardening,'progress')}</article><article class="status-card"><span class="status-pill evidence">Принцип доказательности</span><h3>Бизнес-эффект публикуется только после проверки</h3><p>На странице намеренно нет неподтверждённых размеров рынка, ROI, выручки, числа клиентов, сроков внедрения или процентов эффективности. Такие показатели должны появляться только после отдельной верификации.</p><p>Полный межролевой сценарий пока проходит сквозную квалификацию, поэтому презентация не называет весь контур окончательно промышленно подтверждённым.</p></article></div></div></section>

    <section class="share"><div class="wrap"><div class="share-box"><div><p class="eyebrow">QR · ПУБЛИЧНАЯ ССЫЛКА</p><h2>Один адрес для встречи, презентации и следующего разговора</h2><p class="lead">QR ведёт на канонический адрес этой страницы. Аналитические метки можно менять отдельно, не меняя сам QR-код.</p>${canonicalUrl ? `<div class="url-box"><small>Постоянная ссылка</small><code data-testid="investors-canonical-url">${canonicalEscaped}</code></div>` : ''}<div class="actions"><a class="btn btn-blue" href="${platformEscaped}">${escapeHtml(platformLabel)} →</a>${canonicalUrl ? '<button class="btn btn-outline" id="copy-link" type="button">Скопировать ссылку</button>' : ''}${contactUrl ? `<a class="btn btn-outline" href="${contactEscaped}">Связаться</a>` : ''}</div></div><div class="qr">${qrSvg || '<div><strong>QR</strong><p>QR появится после определения публичного адреса.</p></div>'}${qrSvg ? '<p>Syntha · Fashion OS</p>' : ''}</div></div></div></section>
  </main>
  <footer class="footer"><div class="wrap footer-inner"><div><strong>Syntha · Fashion OS</strong><p>Публичный обзор основан на текущей архитектуре и внутреннем аудите Syntha. Финансовые показатели и оценки рынка публикуются только после отдельной проверки источников и расчётов.</p></div><a href="${platformEscaped}">${escapeHtml(platformLabel)} →</a></div></footer>
  ${canonicalUrl ? `<script>document.getElementById('copy-link')?.addEventListener('click',async function(){try{await navigator.clipboard.writeText(${JSON.stringify(canonicalUrl)});this.textContent='Ссылка скопирована';setTimeout(()=>this.textContent='Скопировать ссылку',1600)}catch(e){this.textContent='Скопируйте адрес выше'}});</script>` : ''}
</body>
</html>`;
}

module.exports = { investorBriefMeta, renderInvestorBriefHtml };
