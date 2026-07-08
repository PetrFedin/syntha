#!/usr/bin/env node
/**
 * Walkthrough маршрутов из `npm run core:demo`.
 * UI: status < 500 (client-render). Данные: companion API где есть.
 */
const BASE = process.env.CORE_DEMO_BASE_URL?.trim() || 'http://localhost:3001';

/** @typedef {{ ok?: boolean; articles?: unknown[]; threads?: unknown[]; items?: unknown[]; byRetailerId?: Record<string, unknown> }} Json */

const routes = [
  {
    pillar: '0 · Кабинеты',
    name: 'chain overview API',
    path: '/platform',
    apiPath: '/api/workshop2/platform-core/chain-overview?collectionId=SS27',
    apiOk: (j) => j.ok === true && j.overview?.pillars?.length === 5,
  },
  {
    pillar: '0 · Кабинеты',
    name: 'brand core cabinet',
    path: '/brand/core',
    needle: 'Личный кабинет · Бренд',
  },
  {
    pillar: '0 · Кабинеты',
    name: 'shop core cabinet',
    path: '/shop/core',
    needle: 'role-core-live-pillars',
  },
  {
    pillar: '0 · Кабинеты',
    name: 'manufacturer core cabinet',
    path: '/factory/production/core',
    needle: 'role-core-live-pillars',
  },
  {
    pillar: '0 · Кабинеты',
    name: 'supplier core cabinet',
    path: '/factory/supplier/core',
    needle: 'supplier-procurement-pillar-card',
  },
  {
    pillar: '0 · Hub',
    name: 'demo context chips',
    path: '/platform',
    needle: 'platform-core-hub-demo-context',
  },
  {
    pillar: '0 · Hub',
    name: 'demo SS27 collection chip',
    path: '/platform',
    needle: 'platform-core-hub-demo-collection',
  },
  {
    pillar: '0 · Hub',
    name: 'role entry blocks',
    path: '/platform',
    needle: 'platform-core-role-blocks',
  },
  {
    pillar: '0 · Hub',
    name: 'live chain strip',
    path: '/platform',
    needle: 'hub-pillar-collection_order',
  },
  {
    pillar: '0 · Hub',
    name: 'pillar role handoff map',
    path: '/platform',
    needle: 'platform-core-pillar-role-map',
  },
  {
    pillar: '0 · Hub',
    name: 'demo golden trail',
    path: '/platform',
    needle: 'platform-core-demo-trail',
  },
  {
    pillar: '1 · ТЗ → образец',
    name: 'platform hub',
    path: '/platform',
    needle: 'Цепочка: пять столпов',
  },
  {
    pillar: '1 · ТЗ → образец',
    name: 'workshop2 development chrome',
    path: '/brand/production/workshop2?w2col=SS27',
    needle: 'platform-core-development-chrome',
  },
  {
    pillar: '1 · ТЗ → образец',
    name: 'range planner chrome',
    path: '/brand/range-planner',
    needle: 'platform-core-development-chrome',
  },
  {
    pillar: '1 · ТЗ → образец',
    name: 'workshop2 SS27',
    path: '/brand/production/workshop2?w2col=SS27',
    apiPath: '/api/workshop2/collections/SS27/published-articles',
    apiOk: (j) => j.ok === true && Array.isArray(j.articles) && j.articles.length > 0,
  },
  {
    pillar: '1 · ТЗ → образец',
    name: 'range planner',
    path: '/brand/range-planner',
    apiPath: '/api/workshop2/articles',
    apiMethod: 'POST',
    apiBody: {
      collectionId: 'SS27',
      tier: 'novelty',
      budget: 400000,
      targetMargin: 35,
      commit: false,
    },
    apiOk: (j) => j.ok === true && typeof j.sku === 'string' && j.sku.startsWith('RP-'),
  },
  {
    pillar: '1 · ТЗ → образец',
    name: 'factory sample queue',
    path: '/brand/factories/f1',
    apiPath: '/api/workshop2/factory/sample-queue?factoryId=fact-1&status=draft,sent,in_progress',
    apiOk: (j) => j.ok === true && Array.isArray(j.items) && j.items.length > 0,
  },
  {
    pillar: '2 · Образец → коллекция',
    name: 'brand linesheets chrome',
    path: '/brand/linesheets',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '2 · Образец → коллекция',
    name: 'brand linesheets SS27',
    path: '/brand/linesheets',
    apiPath: '/api/workshop2/collections/SS27/sample-collection-status',
    apiOk: (j) => j.ok === true && j.status?.readyForBuyers === true,
  },
  {
    pillar: '2 · Образец → коллекция',
    name: 'shop showroom SS27',
    path: '/shop/b2b/showroom?collection=SS27',
    apiPath: '/api/workshop2/collections/SS27/published-articles',
    apiOk: (j) => j.ok === true && Array.isArray(j.articles) && j.articles.length > 0,
  },
  {
    pillar: '2 · Образец → коллекция',
    name: 'shop b2b showroom chrome',
    path: '/shop/b2b/showroom?collection=SS27',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '2 · Образец → коллекция',
    name: 'shop partners discover chrome',
    path: '/shop/b2b/partners/discover',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '2 · Образец → коллекция',
    name: 'shop partners discover chrome',
    path: '/shop/b2b/partners/discover',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'shop orders list chrome',
    path: '/shop/b2b/orders',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'brand orders list chrome',
    path: '/brand/b2b-orders',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'shop matrix list chrome',
    path: '/shop/b2b/matrix?collection=SS27',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'brand retailers chrome',
    path: '/brand/retailers',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'brand pre-orders chrome',
    path: '/brand/pre-orders',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'b2b matrix SS27',
    path: '/shop/b2b/matrix?collection=SS27',
    apiPath: '/api/workshop2/collections/SS27/published-articles',
    apiOk: (j) => j.ok === true && Array.isArray(j.articles) && j.articles.length > 0,
  },
  {
    pillar: '2 · Коллекция → заказ',
    name: 'retailers CRM',
    path: '/brand/retailers',
    apiPath: '/api/brand/retailers/b2b-orders-summary',
    apiOk: (j) => j.ok === true && j.byRetailerId?.shop1,
  },
  {
    pillar: '2 · Коллекция → заказ',
    name: 'linesheets',
    path: '/brand/linesheets',
    apiPath: '/api/workshop2/collections/SS27/published-articles',
    apiOk: (j) => j.ok === true && Array.isArray(j.articles),
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'shop order demo chrome',
    path: '/shop/b2b/orders/B2B-DEMO-SHOP1-SS27',
    needle: 'platform-core-order-detail-chrome',
    apiPath: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-SS27/chain-status',
    apiOk: (j) => j.ok === true && j.chain?.steps?.some((s) => s.id === 'shop_sent' && s.done),
  },
  {
    pillar: '3 · Коллекция → заказ',
    name: 'brand order chrome',
    path: '/brand/b2b-orders/B2B-DEMO-SHOP1-SS27',
    needle: 'platform-core-order-detail-chrome',
    apiPath: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-SS27/chain-status',
    apiOk: (j) =>
      j.ok === true &&
      j.chain?.steps?.some((s) => s.id === 'production_po' && s.done),
  },
  {
    pillar: '2 · Коллекция → заказ',
    name: 'factory production',
    path: '/factory/production',
    apiPath: '/api/workshop2/factory/production-handoff-queue?factoryId=fact-1',
    apiOk: (j) =>
      j.ok === true &&
      Array.isArray(j.items) &&
      j.items.some((i) => i.b2bOrderId === 'B2B-DEMO-SHOP1-SS27'),
  },
  {
    pillar: '4 · Заказ → производство',
    name: 'supplier hub chrome',
    path: '/factory/supplier',
    needle: 'platform-core-supplier-chrome',
  },
  {
    pillar: '5 · Связь',
    name: 'shop messages comms',
    path: '/shop/messages',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '5 · Связь',
    name: 'messages B2B thread',
    path: '/brand/messages?contextType=b2b_order&contextId=B2B-DEMO-SHOP1-SS27',
    needle: 'comms-pillar-card',
    apiPath: '/api/brand/messages/threads',
    apiOk: (j) => {
      const threads = j.threads ?? [];
      return (
        j.ok === true &&
        threads.some(
          (t) =>
            t &&
            typeof t === 'object' &&
            t.contextType === 'b2b_order' &&
            t.contextId === 'B2B-DEMO-SHOP1-SS27'
        )
      );
    },
  },
  {
    pillar: '5 · Связь',
    name: 'brand calendar comms',
    path: '/brand/calendar',
    needle: 'comms-pillar-card',
    apiPath: '/api/brand/calendar/b2b-events?collectionId=SS27',
    apiOk: (j) => j.ok === true && Array.isArray(j.events) && j.events.length > 0,
  },
  {
    pillar: '5 · Связь',
    name: 'shop b2b calendar',
    path: '/shop/b2b/calendar',
    needle: 'platform-core-list-chrome',
  },
  {
    pillar: '5 · Связь',
    name: 'factory production calendar',
    path: '/factory/production/calendar',
    needle: 'comms-pillar-card',
  },
  {
    pillar: '4 · Заказ → производство',
    name: 'factory dossier SS27',
    path: '/factory/production/dossier/demo-ss27-01',
    apiPath: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-SS27/chain-status',
    apiOk: (j) => j.ok === true && j.chain?.handedOff === true,
  },
  {
    pillar: '0 · Hub · FW27',
    name: 'FW27 hub + chain overview',
    path: '/platform?collection=FW27',
    apiPath: '/api/workshop2/platform-core/chain-overview?collectionId=FW27',
    apiOk: (j) =>
      j.ok === true &&
      j.overview?.collectionId === 'FW27' &&
      j.overview?.demoOrderId === 'B2B-DEMO-SHOP1-FW27',
  },
  {
    pillar: '1 · FW27 · ТЗ → образец',
    name: 'workshop2 FW27',
    path: '/brand/production/workshop2?w2col=FW27',
    apiPath: '/api/workshop2/collections/FW27/development-status',
    apiOk: (j) => j.ok === true && j.status?.articleCount > 0,
  },
  {
    pillar: '2 · FW27 · Образец → коллекция',
    name: 'shop showroom FW27',
    path: '/shop/b2b/showroom?collection=FW27',
    apiPath: '/api/workshop2/collections/FW27/sample-collection-status',
    apiOk: (j) => j.ok === true && j.status?.readyForBuyers === true,
  },
  {
    pillar: '3 · FW27 · Коллекция → заказ',
    name: 'shop matrix FW27',
    path: '/shop/b2b/matrix?collection=FW27',
    apiPath: '/api/workshop2/collections/FW27/published-articles',
    apiOk: (j) => j.ok === true && Array.isArray(j.articles) && j.articles.length > 0,
  },
  {
    pillar: '3 · FW27 · Коллекция → заказ',
    name: 'brand core FW27 collection_order',
    path: '/brand/core?collection=FW27&pillar=collection_order',
    apiPath: '/api/workshop2/platform-core/chain-overview?collectionId=FW27',
    apiOk: (j) => j.ok === true && j.overview?.demoOrderId === 'B2B-DEMO-SHOP1-FW27',
  },
  {
    pillar: '3 · FW27 · Коллекция → заказ',
    name: 'shop order FW27',
    path: '/shop/b2b/orders/B2B-DEMO-SHOP1-FW27',
    apiPath: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-FW27/chain-status',
    apiOk: (j) => j.ok === true && j.chain?.steps?.some((s) => s.id === 'shop_sent' && s.done),
  },
  {
    pillar: '4 · FW27 · Заказ → производство',
    name: 'factory dossier FW27',
    path: '/factory/production/dossier/demo-fw27-01',
    apiPath: '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-FW27/chain-status',
    apiOk: (j) => j.ok === true && j.chain?.handedOff === true,
  },
];

let failed = 0;
let lastPillar = '';

for (const r of routes) {
  if (r.pillar !== lastPillar) {
    console.log(`\n${r.pillar}`);
    lastPillar = r.pillar;
  }
  try {
    const pageRes = await fetch(`${BASE}${r.path}`, { redirect: 'follow' });
    let apiOk = true;
    if (r.apiPath) {
      const init = {
        method: r.apiMethod ?? 'GET',
        headers: r.apiBody ? { 'Content-Type': 'application/json' } : undefined,
        body: r.apiBody ? JSON.stringify(r.apiBody) : undefined,
      };
      const apiRes = await fetch(`${BASE}${r.apiPath}`, init);
      /** @type {Json} */
      let json = {};
      try {
        json = await apiRes.json();
      } catch {
        json = {};
      }
      apiOk = apiRes.ok && r.apiOk(json);
      if (!apiOk) {
        console.error(
          `  FAIL ${r.name} api: status=${apiRes.status}`,
          JSON.stringify(json).slice(0, 160)
        );
      }
    }

    const statusOk = pageRes.status < 500;
    // Client chrome (testid/текст) не в SSR — без apiPath проверяем только HTTP.
    const pass = r.apiPath ? statusOk && apiOk : statusOk;

    if (pass) {
      console.log(`  ok  ${r.name}`);
    } else {
      failed += 1;
      if (!statusOk) {
        console.error(`  FAIL ${r.name} page: status=${pageRes.status}`);
      } else if (r.apiPath && !apiOk) {
        /* api error already logged */
      }
    }
  } catch (e) {
    failed += 1;
    console.error(`  FAIL ${r.name}:`, e instanceof Error ? e.message : e);
  }
}

if (failed) {
  console.error(`\n${failed} route(s) failed. Запустите: npm run dev:core && npm run core:bootstrap`);
  process.exit(1);
}

console.log('\nCore demo walkthrough: all routes OK.');
console.log(`Откройте: ${BASE}/platform`);
console.log('UI-контент: npm run test:e2e:core (golden path)');
