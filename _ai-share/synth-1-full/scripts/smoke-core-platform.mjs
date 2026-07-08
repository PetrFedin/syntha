#!/usr/bin/env node
/**
 * Быстрый smoke Platform Core (:3001).
 * Требует запущенный `npm run dev:core` и PG (см. env.core.example).
 */
const BASE = process.env.CORE_SMOKE_BASE_URL?.trim() || 'http://localhost:3001';

/** HTTP 200 на UI-маршрутах (testid — в e2e, не в SSR HTML). */
const pageRoutes = [
  { name: 'platform hub', path: '/platform' },
  { name: 'platform hub SS27 collection', path: '/platform?collection=SS27' },
  { name: 'platform hub FW27 collection', path: '/platform?collection=FW27' },
  { name: 'brand core cabinet', path: '/brand/core' },
  { name: 'brand core FW27', path: '/brand/core?collection=FW27&pillar=collection_order' },
  { name: 'shop core cabinet', path: '/shop/core' },
  { name: 'manufacturer core cabinet', path: '/factory/production/core' },
  { name: 'supplier core cabinet', path: '/factory/supplier/core' },
  { name: 'factory dossier SS27', path: '/factory/production/dossier/demo-ss27-01' },
  { name: 'factory dossier FW27', path: '/factory/production/dossier/demo-fw27-01' },
  { name: 'supplier hub', path: '/factory/supplier' },
  { name: 'factory production materials', path: '/factory/production/materials' },
  { name: 'factory production orders', path: '/factory/production/orders' },
  { name: 'shop b2b showroom', path: '/shop/b2b/showroom?collection=SS27' },
  { name: 'brand pre-orders', path: '/brand/pre-orders' },
  { name: 'shop b2b checkout', path: '/shop/b2b/checkout?collection=SS27' },
  { name: 'shop partners discover', path: '/shop/b2b/partners/discover' },
  { name: 'shop matrix SS27', path: '/shop/b2b/matrix?collection=SS27' },
  { name: 'shop matrix FW27', path: '/shop/b2b/matrix?collection=FW27' },
  { name: 'brand linesheets FW27', path: '/brand/linesheets?collection=FW27' },
  { name: 'workshop2 FW27', path: '/brand/production/workshop2?w2col=FW27' },
  { name: 'shop order FW27', path: '/shop/b2b/orders/B2B-DEMO-SHOP1-FW27' },
];

const apiChecks = [
  {
    name: 'retailers w2 summary',
    path: '/api/brand/retailers/b2b-orders-summary',
    expectOk: (r) => r.ok === true,
  },
  {
    name: 'w2 published articles',
    path: '/api/workshop2/collections/SS27/published-articles',
    expectOk: (r) => r.ok === true && Array.isArray(r.articles) && r.articles.length > 0,
  },
  {
    name: 'factory sample queue',
    path: '/api/workshop2/factory/sample-queue?factoryId=fact-1',
    expectOk: (r) => r.ok === true && Array.isArray(r.items) && r.items.length > 0,
  },
  {
    name: 'calendar w2 events',
    path: '/api/brand/calendar/w2-events',
    expectOk: (r) => r.ok === true,
  },
  {
    name: 'messages pg threads',
    path: '/api/brand/messages/threads',
    expectOk: (r) => r.ok === true && Array.isArray(r.threads) && r.threads.length > 0,
  },
  {
    name: 'factory production handoff',
    path: '/api/workshop2/factory/production-handoff-queue?factoryId=fact-1',
    expectOk: (r) =>
      r.ok === true && Array.isArray(r.items) && r.items.some((i) => i.b2bOrderId === 'B2B-DEMO-SHOP1-SS27'),
  },
  {
    name: 'platform chain overview',
    path: '/api/workshop2/platform-core/chain-overview?collectionId=SS27',
    expectOk: (r) =>
      r.ok === true &&
      Array.isArray(r.overview?.pillars) &&
      r.overview.pillars.length === 5 &&
      (r.overview.roles?.length ?? 0) >= 2,
  },
  {
    name: 'platform chain overview FW27',
    path: '/api/workshop2/platform-core/chain-overview?collectionId=FW27',
    expectOk: (r) =>
      r.ok === true &&
      r.overview?.collectionId === 'FW27' &&
      r.overview?.demoOrderId === 'B2B-DEMO-SHOP1-FW27' &&
      Array.isArray(r.overview?.pillars) &&
      r.overview.pillars.length === 5,
  },
  {
    name: 'FW27 published articles',
    path: '/api/workshop2/collections/FW27/published-articles',
    expectOk: (r) => r.ok === true && Array.isArray(r.articles) && r.articles.length > 0,
  },
  {
    name: 'FW27 development status',
    path: '/api/workshop2/collections/FW27/development-status',
    expectOk: (r) => r.ok === true && r.status?.articleCount > 0,
  },
  {
    name: 'FW27 sample collection status',
    path: '/api/workshop2/collections/FW27/sample-collection-status',
    expectOk: (r) => r.ok === true && r.status?.readyForBuyers === true,
  },
  {
    name: 'FW27 b2b chain status',
    path: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-FW27/chain-status',
    expectOk: (r) =>
      r.ok === true &&
      r.chain?.steps?.some((s) => s.id === 'shop_sent' && s.done),
  },
  {
    name: 'brand b2b orders SS27',
    path: '/api/brand/b2b/orders?collectionId=SS27',
    expectOk: (r) =>
      r.ok === true &&
      Array.isArray(r.orders) &&
      r.orders.some((o) => o.id === 'B2B-DEMO-SHOP1-SS27'),
  },
  {
    name: 'w2 b2b order detail SS27',
    path: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-SS27',
    expectOk: (r) =>
      r.ok === true &&
      r.order?.id === 'B2B-DEMO-SHOP1-SS27' &&
      Array.isArray(r.order?.lines) &&
      r.order.lines.length > 0,
  },
  {
    name: 'development status',
    path: '/api/workshop2/collections/SS27/development-status',
    expectOk: (r) =>
      r.ok === true &&
      Array.isArray(r.status?.steps) &&
      r.status.steps.some((s) => s.id === 'factory_samples' && s.done) &&
      r.status.articleCount > 0,
  },
  {
    name: 'linesheet pdf SS27',
    path: '/api/shop/b2b/campaigns/SS27%3A%3Ademo-ss27-01/linesheet.pdf',
    expectOk: (_r, t, status) => status === 200 && t.startsWith('%PDF'),
  },
  {
    name: 'sample collection status',
    path: '/api/workshop2/collections/SS27/sample-collection-status',
    expectOk: (r) =>
      r.ok === true &&
      r.status?.readyForBuyers === true &&
      typeof r.status?.linesheetPdfHref === 'string' &&
      r.status.linesheetPdfHref.includes('linesheet.pdf') &&
      Array.isArray(r.status?.steps) &&
      r.status.steps.some((s) => s.id === 'showroom_published' && s.done),
  },
  {
    name: 'b2b chain status',
    path: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-SS27/chain-status',
    expectOk: (r) =>
      r.ok === true &&
      r.chain?.handedOff === true &&
      Array.isArray(r.chain?.steps) &&
      r.chain.steps.filter((s) => s.done).length >= 3,
  },
  {
    name: 'b2b calendar events',
    path: '/api/brand/calendar/b2b-events?collectionId=SS27',
    expectOk: (r) => r.ok === true && Array.isArray(r.events) && r.events.length > 0,
  },
  {
    name: 'platform-core health',
    path: '/api/workshop2/platform-core/health',
    expectOk: (r) =>
      r.ok === true &&
      r.coreMode === true &&
      typeof r.pgReachable === 'boolean' &&
      typeof r.demoSeeded === 'boolean' &&
      typeof r.spineOperationalPgPrimary === 'boolean' &&
      typeof r.operationalOrdersSource === 'string' &&
      (r.chainStatusSseMode === 'poll+bump' || r.chainStatusSseMode === 'poll+bump+redis'),
  },
  {
    name: 'platform-core calendar per order',
    path:
      '/api/workshop2/platform-core/calendar-events?collectionId=SS27&orderId=B2B-DEMO-SHOP1-SS27',
    expectOk: (r) =>
      r.ok === true &&
      r.orderId === 'B2B-DEMO-SHOP1-SS27' &&
      Array.isArray(r.events) &&
      r.events.length > 0,
  },
];

async function checkRangePlannerArticleApi() {
  const res = await fetch(`${BASE}/api/workshop2/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collectionId: 'SS27',
      tier: 'novelty',
      budget: 400000,
      targetMargin: 35,
      commit: false,
    }),
  });
  const json = await res.json();
  const pass = res.ok && json.ok === true && typeof json.sku === 'string' && json.sku.startsWith('RP-');
  if (!pass) {
    console.error(`FAIL range planner article api: status=${res.status}`, JSON.stringify(json).slice(0, 240));
    return false;
  }
  console.log('ok  range planner article api');
  return true;
}

let failed = 0;

for (const r of pageRoutes) {
  try {
    const res = await fetch(`${BASE}${r.path}`, { redirect: 'follow' });
    if (res.status !== 200) {
      failed += 1;
      console.error(`FAIL ${r.name} page: status=${res.status}`);
    } else {
      console.log(`ok  ${r.name}`);
    }
  } catch (e) {
    failed += 1;
    console.error(`FAIL ${r.name}:`, e instanceof Error ? e.message : e);
  }
}

for (const c of apiChecks) {
  try {
    const res = await fetch(`${BASE}${c.path}`);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { _raw: text.slice(0, 200) };
    }
    const payload = json ?? {};
    const pass = c.expectOk(payload, text, res.status);
    if (!pass) {
      failed += 1;
      console.error(`FAIL ${c.name}: status=${res.status}`, JSON.stringify(payload).slice(0, 240));
    } else {
      console.log(`ok  ${c.name}`);
    }
  } catch (e) {
    failed += 1;
    console.error(`FAIL ${c.name}:`, e instanceof Error ? e.message : e);
  }
}

if (!(await checkRangePlannerArticleApi())) {
  failed += 1;
}

if (failed) {
  console.error(`\n${failed} check(s) failed. Убедитесь: dev:core запущен, WORKSHOP2_DEV_BYPASS_AUTH=true, PG seeded.`);
  process.exit(1);
}

console.log('\nCore platform smoke: all checks passed.');
