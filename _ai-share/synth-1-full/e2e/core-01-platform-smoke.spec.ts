import { test, expect } from '@playwright/test';
import {
  cabinetPillarButton,
  cabinetPillarNavLocator,
  expectCabinetPillarNav,
  gotoPlatformHub,
  gotoPlatformHubAudit,
  openPlatformHubAuditView,
  gotoRoleCoreCabinet,
  waitForChainOverview,
  fetchPlatformCoreActiveOrderId,
} from './helpers/core-chain-overview';
import { shopTrackingRow, shopTrackingTestId } from './helpers/shop-tracking-testids';

/**
 * Platform Core smoke (:3001).
 * Запуск: PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core
 * (при уже запущенном `npm run dev:core`)
 */
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

const FW27_COLLECTION_LABEL = 'Осень–зима 2027';

/** SS27 wholesale в comms/tracking: PG checkout (B2B-\\d+) или demo pin после bootstrap. */
const SS27_WHOLESALE_ORDER_HREF = /B2B-DEMO-SHOP1-SS27|B2B-\d+/;

const W2_DEV_HEADERS = {
  'content-type': 'application/json',
  'x-w2-actor-label': 'e2e-core',
  'x-w2-actor-id': 'brand-001',
  'x-w2-actor-roles': 'production:edit',
  'x-w2-organization-id': 'org-brand-001',
};

test.describe('Platform Core', () => {
  test('hub: роли + матрица готовности', async ({ page }) => {
    const res = await gotoPlatformHubAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-syntha-style-banner')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-role-blocks')).toBeVisible();
    await expect(page.getByTestId('platform-core-readiness-matrix')).toBeVisible();
    await expect(page.getByTestId('platform-core-readiness-matrix')).toContainText(/Разработка/);
    await expect(page.getByTestId('readiness-score-brand-development')).toBeVisible();
    await expect(page.getByTestId('readiness-score-shop-collection_order')).toBeVisible();
    await expect(page.getByTestId('role-block-brand')).toBeVisible();
    await expect(page.getByTestId('role-block-shop')).toBeVisible();
    await expect(page.getByTestId('role-block-manufacturer')).toBeVisible();
    await expect(page.getByTestId('role-block-supplier')).toBeVisible();
    await expect(page.getByTestId('readiness-cell-brand-development')).toBeVisible();
    await page.getByTestId('readiness-score-brand-development').click();
    await expect(page.getByTestId('readiness-sub-brand-development-0')).toBeVisible();
  });

  test('hub: всегда SS27 golden path (без switcher сезонов)', async ({ page }) => {
    let res = await gotoPlatformHubAudit(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-hub-collection-switcher')).toHaveCount(0);
    await expect(page.getByTestId('platform-core-hub-demo-context')).toHaveCount(0);

    res = await page.goto('/platform?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await openPlatformHubAuditView(page);
    await expect(page.getByTestId('readiness-score-brand-development')).toBeVisible({
      timeout: 60_000,
    });

    res = await gotoPlatformHub(page, '/platform', {
      collectionId: 'SS27',
      query: { collection: 'UNKNOWN' },
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-role-blocks')).toBeVisible({
      timeout: 60_000,
    });
  });

  test('retailers: W2 CRM bridge (shop1)', async ({ page }) => {
    const res = await page.goto('/brand/retailers', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByRole('tab', { name: 'Ритейлеры' })).toBeVisible({ timeout: 30_000 });
    const shopBadge = page.getByTestId('retailer-w2-badge-shop1');
    await expect(shopBadge).toBeVisible({ timeout: 30_000 });
    await expect(shopBadge).toContainText(/W2 · \d+ заказ/);
  });

  test('api: retailers b2b summary', async ({ request }) => {
    const res = await request.get('/api/brand/retailers/b2b-orders-summary');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; byRetailerId?: Record<string, unknown> };
    expect(json.ok).toBe(true);
    expect(json.byRetailerId?.shop1).toBeTruthy();
  });

  test('api: shop orders buyer from org header (onboarding map)', async ({ request }) => {
    const shop2Res = await request.get('/api/shop/b2b/orders', {
      headers: { 'x-w2-organization-id': 'retail_msk_2' },
    });
    expect(shop2Res.ok()).toBeTruthy();
    const shop2Json = (await shop2Res.json()) as { ok?: boolean; buyerId?: string };
    expect(shop2Json.ok).toBe(true);
    expect(shop2Json.buyerId).toBe('shop2');

    const shop1Res = await request.get('/api/shop/b2b/orders', {
      headers: { 'x-w2-organization-id': 'org-shop-002' },
    });
    const shop1Json = (await shop1Res.json()) as { buyerId?: string };
    expect(shop1Json.buyerId).toBe('shop2');
  });

  test('api: shop orders buyer from session actor header', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/orders', {
      headers: { 'x-w2-actor-id': 'shop-002' },
    });
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; buyerId?: string };
    expect(json.ok).toBe(true);
    expect(json.buyerId).toBe('shop2');
  });

  test('api: w2 published articles', async ({ request }) => {
    const res = await request.get('/api/workshop2/collections/SS27/published-articles');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; articles?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.articles)).toBe(true);
  });

  test('api: factory sample queue has items', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/factory/sample-queue?factoryId=fact-1&status=draft,sent,in_progress'
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; items?: unknown[] };
    expect(json.ok).toBe(true);
    expect((json.items?.length ?? 0) > 0).toBe(true);
  });

  test('api: brand messages pg threads', async ({ request }) => {
    const res = await request.get('/api/brand/messages/threads');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; threads?: unknown[] };
    expect(json.ok).toBe(true);
    expect((json.threads?.length ?? 0) > 0).toBe(true);
  });

  test('api: dossier PG round-trip + handoff lock', async ({ request }) => {
    const lockedGet = await request.get('/api/workshop2/articles/SS27/demo-ss27-01/dossier', {
      headers: W2_DEV_HEADERS,
    });
    expect(lockedGet.ok()).toBeTruthy();
    const lockedBody = (await lockedGet.json()) as {
      ok?: boolean;
      b2bEditLock?: { locked?: boolean };
    };
    expect(lockedBody.ok).toBe(true);
    expect(lockedBody.b2bEditLock?.locked).toBe(true);

    const lockedPut = await request.put('/api/workshop2/articles/SS27/demo-ss27-01/dossier', {
      headers: W2_DEV_HEADERS,
      data: { dossier: {}, baseVersion: 1 },
    });
    expect(lockedPut.status()).toBe(409);

    const articleId = 'demo-ss27-02';
    const getRes = await request.get(`/api/workshop2/articles/SS27/${articleId}/dossier`, {
      headers: W2_DEV_HEADERS,
    });
    expect(getRes.ok()).toBeTruthy();
    const body = (await getRes.json()) as {
      ok?: boolean;
      dossier?: { passportProductionBrief?: { styleName?: string } };
      version?: number;
      b2bEditLock?: { locked?: boolean };
    };
    expect(body.ok).toBe(true);
    expect(body.dossier).toBeTruthy();
    expect(body.b2bEditLock?.locked).not.toBe(true);
    const marker = `e2e-roundtrip-${Date.now()}`;
    const putRes = await request.put(`/api/workshop2/articles/SS27/${articleId}/dossier`, {
      headers: W2_DEV_HEADERS,
      data: {
        dossier: {
          ...body.dossier,
          passportProductionBrief: {
            ...(body.dossier?.passportProductionBrief ?? {}),
            styleName: marker,
          },
        },
        baseVersion: body.version,
      },
    });
    expect(putRes.ok()).toBeTruthy();
    const get2 = await request.get(`/api/workshop2/articles/SS27/${articleId}/dossier`, {
      headers: W2_DEV_HEADERS,
    });
    const body2 = (await get2.json()) as {
      dossier?: { passportProductionBrief?: { styleName?: string } };
    };
    expect(body2.dossier?.passportProductionBrief?.styleName).toBe(marker);
  });

  test('api: calendar events carry b2b order thread id', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/platform-core/calendar-events?collectionId=SS27&orderId=B2B-DEMO-SHOP1-SS27'
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      events?: Array<{ b2bOrderId?: string; id?: string; targetChatId?: string | null }>;
    };
    const orderEvents = (json.events ?? []).filter((e) => e.b2bOrderId === 'B2B-DEMO-SHOP1-SS27');
    expect(orderEvents.length).toBeGreaterThan(0);
    expect(orderEvents.some((e) => e.targetChatId === 'w2ctx:b2b_order:B2B-DEMO-SHOP1-SS27')).toBe(
      true
    );
  });

  test('api: range planner create article', async ({ request }) => {
    const res = await request.post('/api/workshop2/articles', {
      data: {
        collectionId: 'SS27',
        tier: 'core',
        budget: 1_200_000,
        targetMargin: 42,
        commit: false,
      },
    });
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; sku?: string; href?: string };
    expect(json.ok).toBe(true);
    expect(json.sku?.startsWith('RP-')).toBe(true);
    expect(json.href).toMatch(/\/brand\/(core\?|production\/workshop2\/c\/)/);
  });

  test('messages: PG B2B thread (shop1)', async ({ page }) => {
    const res = await page.goto(
      '/brand/messages?contextType=b2b_order&contextId=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    const listChrome = page.getByTestId('platform-core-list-chrome');
    await expect(listChrome).toBeVisible({ timeout: 30_000 });
    await expect(listChrome.getByTestId('platform-core-role-pillar-strip')).toHaveCount(0);
    await expect(listChrome.getByTestId('role-pillar-cross-role-comms')).toBeVisible();
    const banner = page.getByTestId('brand-cm-banner');
    await expect(banner).toBeVisible({ timeout: 30_000 });
    await expect(banner).toContainText('B2B-DEMO-SHOP1-SS27');
    await expect(page.getByTestId('brand-cm-thread-search')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-cm-order-context-strip')).toHaveCount(0);
  });

  test('messages: PG article thread (shop1)', async ({ page }) => {
    const res = await page.goto(
      '/brand/messages?contextType=workshop2_article&contextId=SS27%3Ademo-ss27-01',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('communications-production-context-banner')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-cm-article-dossier-link')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('api: w2 collection linesheet pdf SS27', async ({ request }) => {
    const res = await request.get('/api/workshop2/collections/SS27/linesheet.pdf');
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('application/pdf');
    const buf = await res.body();
    expect(buf.byteLength).toBeGreaterThan(400);
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
  });

  test('api: linesheet pdf SS27', async ({ request }) => {
    const res = await request.get('/api/workshop2/collections/SS27/linesheet.pdf');
    expect(res.ok()).toBeTruthy();
    const buf = await res.body();
    expect(buf.byteLength).toBeGreaterThan(500);
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
  });

  test('api: development status', async ({ request }) => {
    const res = await request.get('/api/workshop2/collections/SS27/development-status');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      status?: { articleCount?: number; steps?: Array<{ id: string; done: boolean }> };
    };
    expect(json.ok).toBe(true);
    expect((json.status?.articleCount ?? 0) > 0).toBe(true);
    expect(json.status?.steps?.find((s) => s.id === 'factory_samples')?.done).toBe(true);
  });

  test('factory hub: sample queue panel (f1 → fact-1)', async ({ page }) => {
    const res = await page.goto('/brand/factories/f1', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByRole('heading', { name: 'Очередь образцов' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('SAMPLE-DEMO-SS27-01')).toBeVisible({ timeout: 30_000 });
  });

  test('factory messages: CommunicationsEntityContextBanner (core)', async ({ page }) => {
    const res = await page.goto('/factory/production/messages', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-messages-core')).toBeVisible({ timeout: 90_000 });
    const listChrome = page.getByTestId('platform-core-list-chrome');
    await expect(listChrome).toBeVisible({ timeout: 30_000 });
    await expect(listChrome.getByTestId('platform-core-role-pillar-strip')).toHaveCount(0);
    await expect(listChrome.getByTestId('role-pillar-cross-role-comms')).toBeVisible();
    const banner = page.getByTestId('mfr-cm-banner');
    await expect(banner).toBeVisible({ timeout: 30_000 });
    await expect(banner).toHaveAttribute('data-variant', 'manufacturer');
    await expect(banner).toContainText('Контекст производственного заказа');
    await expect(banner).toContainText('B2B-DEMO-SHOP1-SS27');
    await expect(page.getByTestId('mfr-cm-order-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-cm-article-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Сообщения' })).toBeVisible();
  });

  test('supplier messages: smoke с context banner (core)', async ({ page }) => {
    const res = await page.goto('/factory/supplier/messages', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-messages-core')).toBeVisible({ timeout: 90_000 });
    const listChrome = page.getByTestId('platform-core-list-chrome');
    await expect(listChrome).toBeVisible({ timeout: 30_000 });
    await expect(listChrome.getByTestId('platform-core-role-pillar-strip')).toHaveCount(0);
    await expect(listChrome.getByTestId('role-pillar-cross-role-comms')).toBeVisible();
    const banner = page.getByTestId('sup-cm-banner');
    await expect(banner).toBeVisible({ timeout: 30_000 });
    await expect(banner).toHaveAttribute('data-variant', 'supplier');
    await expect(banner).toContainText('Контекст поставки');
    await expect(banner).toContainText('B2B-DEMO-SHOP1-SS27');
    await expect(page.getByTestId('sup-cm-order-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-cm-article-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-cm-order-procurement-link')).toHaveAttribute(
      'href',
      /role=supplier/
    );
    await expect(page.getByRole('heading', { name: 'Сообщения' })).toBeVisible();
  });

  test('manufacturer core: неактивные столпы — редирект на первый активный', async ({ page }) => {
    let res = await gotoRoleCoreCabinet(page, '/factory/production/core?pillar=collection_order');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/pillar=development/, { timeout: 30_000 });
    res = await gotoRoleCoreCabinet(page, '/factory/production/core?pillar=sample_collection');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/pillar=development/, { timeout: 30_000 });
  });

  test('supplier core: BOM в столпе разработки (не sample_collection)', async ({ page }) => {
    const res = await gotoRoleCoreCabinet(page, '/factory/supplier/core?pillar=development');
    expect(res?.status() ?? 599).toBeLessThan(500);
    const supplierCabinet = page.getByTestId('role-core-cabinet-supplier');
    await expect(supplierCabinet).toBeVisible({ timeout: 90_000 });
    await expect(page.getByTestId('supplier-bom-preview-mini')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('role-pillar-sample_collection')).toHaveCount(0);
    await expect(page.getByTestId('role-pillar-collection_order')).toHaveCount(0);
  });

  test('role cabinets: nav только по активным столпам роли', async ({ page }) => {
    const cabinets = [
      {
        url: '/brand/core',
        roleId: 'brand',
        count: 5,
        pillars: [
          'development',
          'sample_collection',
          'collection_order',
          'order_production',
          'comms',
        ],
      },
      {
        url: '/shop/core',
        roleId: 'shop',
        count: 3,
        pillars: ['sample_collection', 'collection_order', 'comms'],
      },
      {
        url: '/factory/production/core',
        roleId: 'manufacturer',
        count: 3,
        pillars: ['development', 'order_production', 'comms'],
      },
      {
        url: '/factory/supplier/core',
        roleId: 'supplier',
        count: 3,
        pillars: ['development', 'order_production', 'comms'],
      },
    ] as const;

    for (const { url, roleId, count, pillars } of cabinets) {
      const res = await gotoRoleCoreCabinet(page, url);
      expect(res?.status() ?? 599).toBeLessThan(500);
      const cabinet = page.getByTestId(`role-core-cabinet-${roleId}`);
      await expect(cabinet).toBeVisible({ timeout: 90_000 });
      await expectCabinetPillarNav(page, cabinet);
      const nav = cabinetPillarNavLocator(page, cabinet);
      await expect(nav.getByRole('button')).toHaveCount(count);
      for (const pillarId of pillars) {
        await expect(cabinetPillarButton(page, pillarId, cabinet)).toBeVisible();
      }
    }
  });

  test('FW27: brand core → W2 → linesheets → showroom', async ({ page }) => {
    const chainFw27 = waitForChainOverview(page, { collectionId: 'FW27' });
    let res = await page.goto('/brand/core?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chainFw27;
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('platform-core-context-entity')).toHaveAttribute(
      'href',
      /collection=FW27/
    );

    res = await page.goto('/brand/core?pillar=development&collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const w2Chrome = page.getByTestId('platform-core-development-chrome');
    await expect(w2Chrome).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/pillar=development/);
    await expect(page).toHaveURL(/collection=FW27/);
    await expect(
      page.getByTestId('platform-core-list-chrome').getByTestId('platform-core-context-entity')
    ).toContainText(FW27_COLLECTION_LABEL, { timeout: 30_000 });

    res = await page.goto('/brand/linesheets?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const linesheetsChrome = page.getByTestId('platform-core-list-chrome');
    await expect(linesheetsChrome).toBeVisible({ timeout: 30_000 });
    await expect(linesheetsChrome.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );

    res = await page.goto('/shop/b2b/showroom?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const showroomChrome = page.getByTestId('platform-core-list-chrome');
    await expect(showroomChrome).toBeVisible({ timeout: 30_000 });
    await expect(showroomChrome.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );
    await expect(showroomChrome.getByTestId('platform-core-role-pillar-strip')).toHaveCount(0);
  });

  test('FW27: showroom и matrix с collection=FW27', async ({ page }) => {
    let res = await page.goto('/brand/linesheets?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const linesheetsChrome = page.getByTestId('platform-core-list-chrome');
    await expect(linesheetsChrome).toBeVisible({ timeout: 30_000 });
    await expect(linesheetsChrome.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );

    res = await page.goto('/shop/b2b/showroom?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const showroomChrome = page.getByTestId('platform-core-list-chrome');
    await expect(showroomChrome).toBeVisible({ timeout: 30_000 });
    await expect(showroomChrome.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );
    await expect(showroomChrome.getByTestId('platform-core-role-pillar-strip')).toHaveCount(0);

    res = await page.goto('/shop/b2b/matrix?collection=FW27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const matrixChrome = page.getByTestId('platform-core-list-chrome');
    await expect(matrixChrome).toBeVisible({ timeout: 30_000 });
    await expect(matrixChrome.getByTestId('platform-core-context-entity')).toContainText(
      FW27_COLLECTION_LABEL,
      { timeout: 30_000 }
    );
    await expect(matrixChrome.getByTestId('platform-core-role-pillar-strip')).toHaveCount(0);
  });

  test('brand core pillars: связи и audit testids', async ({ page }) => {
    test.setTimeout(360_000);
    const pillars = [
      {
        pillar: 'development',
        testId: 'development-pillar-card',
        extra: 'development-bom-ready-badge',
      },
      {
        pillar: 'sample_collection',
        testId: 'brand-sc-cabinet-panel',
        extra: 'brand-sc-audit-path-shop-matrix',
      },
      { pillar: 'collection_order', testId: 'collection-order-qty-summary' },
      {
        pillar: 'order_production',
        testId: 'order-production-pillar-card',
        extra: 'brand-op-bom-preview-badge',
      },
      { pillar: 'comms', testId: 'comms-pillar-card' },
    ] as const;

    for (const { pillar, testId, extra } of pillars) {
      const res = await gotoRoleCoreCabinet(page, `/brand/core?pillar=${pillar}&collection=SS27`);
      expect(res?.status() ?? 599).toBeLessThan(500);
      if (pillar === 'order_production') {
        await expect(
          page.getByTestId('brand-op-cabinet-panel').or(page.getByTestId(testId))
        ).toBeVisible({ timeout: 60_000 });
      } else if (pillar === 'sample_collection') {
        await expect(
          page
            .getByTestId('brand-sc-cabinet-panel')
            .or(page.getByTestId(testId))
            .or(page.getByTestId('brand-sample-collection-mini'))
        ).toBeVisible({ timeout: 60_000 });
      } else if (pillar === 'collection_order') {
        await expect(
          page
            .getByTestId('brand-co-cabinet-panel')
            .or(page.getByTestId(testId))
            .or(page.getByTestId('collection-order-pillar-card'))
            .first()
        ).toBeVisible({ timeout: 60_000 });
      } else {
        await expect(page.getByTestId(testId)).toBeVisible({ timeout: 60_000 });
      }
      if (extra) {
        await expect(
          page
            .getByTestId(extra)
            .or(page.getByTestId('brand-sc-mini-matrix-link'))
            .or(page.getByTestId('development-progress-pct'))
            .or(page.getByTestId('development-sample-queue-badge'))
            .first()
        ).toBeVisible({ timeout: 30_000 });
      }
      if (pillar === 'order_production') {
        await expect(
          page
            .getByTestId('brand-op-cabinet-chain-steps')
            .or(page.getByTestId('brand-op-chain-steps'))
        ).toBeVisible({ timeout: 30_000 });
        await expect(page.getByTestId('brand-op-cabinet-cta-strip')).toBeVisible({
          timeout: 30_000,
        });
      }
      if (pillar === 'comms') {
        await expect(page.getByTestId('brand-cm-order-chat-link')).toHaveAttribute(
          'href',
          SS27_WHOLESALE_ORDER_HREF
        );
        await expect(page.getByTestId('brand-cm-calendar-link')).toHaveAttribute(
          'href',
          SS27_WHOLESALE_ORDER_HREF
        );
      }
      if (pillar === 'development') {
        await expect(page.getByTestId('brand-dev-cabinet-panel')).toBeVisible({ timeout: 30_000 });
        await expect(page.getByTestId('brand-dev-cabinet-context-strip')).toBeVisible({
          timeout: 30_000,
        });
        await expect(
          page
            .getByTestId('brand-dev-cabinet-range-link')
            .or(page.getByTestId('development-range-planner-link'))
        ).toBeVisible({
          timeout: 30_000,
        });
        await expect(
          page
            .getByTestId('brand-dev-cabinet-create-sku-link')
            .or(page.getByTestId('development-w2-create-link'))
        ).toBeVisible({ timeout: 30_000 });
        await expect(
          page
            .getByTestId('brand-dev-cross-sample-handoff-link')
            .or(page.getByTestId('development-sample-handoff-cta-compact'))
        ).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('development-progress-pct')).toBeVisible({ timeout: 30_000 });
        await expect(
          page
            .getByTestId('development-sample-queue-badge')
            .or(page.getByTestId('development-sample-queue-position'))
        ).toBeVisible({
          timeout: 30_000,
        });
      }
      if (pillar === 'collection_order') {
        await expect(
          page
            .getByTestId('brand-co-cabinet-panel')
            .or(page.getByTestId('collection-order-pillar-card'))
        ).toBeVisible({ timeout: 30_000 });
        await expect(page.getByTestId('brand-co-cabinet-cta-orders')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('brand-co-cabinet-registry-link')).toBeVisible({
          timeout: 30_000,
        });
      }
      if (pillar === 'sample_collection') {
        await expect(
          page
            .getByTestId('brand-sc-cabinet-linesheets-link')
            .or(page.getByTestId('brand-sample-collection-mini-linesheet'))
        ).toBeVisible({
          timeout: 30_000,
        });
        await expect(
          page
            .getByTestId('brand-sc-cabinet-published-badge')
            .or(page.getByTestId('brand-sc-cabinet-published-sync'))
            .or(page.getByTestId('brand-sample-collection-published-badge'))
        ).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('brand-sc-unified-audit-path')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('brand-sc-golden-path-shop-checkout')).toBeVisible({
          timeout: 30_000,
        });
      }
      if (pillar === 'order_production') {
        await expect(page.getByTestId('brand-op-cabinet-chain-steps')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('brand-op-cabinet-cta-strip')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('brand-op-po-id-badge')).toBeVisible({ timeout: 30_000 });
        await expect(page.getByTestId('brand-op-cabinet-registry-link')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('brand-op-cabinet-handoff-link')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('brand-op-cabinet-tracking-link')).toBeVisible({
          timeout: 30_000,
        });
      }
    }

    let res = await page.goto('/brand/core?pillar=development&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-dev-w2-hub-context-strip')
        .or(page.getByTestId('brand-w2-hub-cross-links'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-dev-w2-hub-showroom-link')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-w2-create-article-btn')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-dev-w2-hub-range-link')
        .or(page.getByTestId('brand-w2-range-planner-link'))
    ).toBeVisible({ timeout: 30_000 });

    res = await page.goto('/brand/range-planner?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-range-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-dev-range-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('range-planner-margin-summary')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('range-planner-tier-w2-link-core')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('brand-dev-range-showroom-link')
        .or(page.getByTestId('range-planner-showroom-link'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('range-planner-tier-margin-input-core')).toBeVisible({
      timeout: 30_000,
    });

    res = await page.goto('/brand/calendar?order=B2B-DEMO-SHOP1-SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-comms-cross-nav')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-cm-banner')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-cm-order-context-strip')).toHaveCount(0);
    await expect(page.getByTestId('comms-cross-nav-chat')).toBeVisible({ timeout: 30_000 });

    const registryRes = await page.goto('/brand/b2b-orders?pillar=order_production', GOTO);
    expect(registryRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-registry-production-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-op-registry-panel')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-op-registry-collection-filter')
        .or(page.getByTestId('brand-b2b-collection-filter'))
    ).toBeVisible({ timeout: 30_000 });
    const shop2Row = page.locator('[data-order="B2B-DEMO-SHOP2-SS27"]');
    await expect(shop2Row).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('brand-b2b-order-select-B2B-DEMO-SHOP2-SS27').click();
    await expect(page.getByTestId('brand-b2b-bulk-handoff')).toBeVisible({ timeout: 10_000 });

    const orderRes = await page.goto('/brand/b2b-orders/B2B-DEMO-SHOP1-SS27', GOTO);
    expect(orderRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-co-detail-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-co-detail-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    const factoryQueueLink = page
      .getByTestId('brand-co-detail-factory-queue-link')
      .or(page.getByTestId('brand-co-chain-factory-queue-link'))
      .or(page.getByTestId('brand-b2b-factory-queue-link'));
    await expect(factoryQueueLink).toBeVisible({ timeout: 30_000 });
    await expect(factoryQueueLink).toHaveAttribute(
      'href',
      /order=B2B-DEMO-SHOP1-SS27.*handoff-queue|handoff-queue.*order=B2B-DEMO-SHOP1-SS27/
    );
    await expect(page.getByTestId('brand-co-detail-chat-link')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-co-chain-steps')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-co-chain-card')
        .or(page.getByTestId('brand-co-detail-chain-card'))
        .or(page.getByTestId('brand-order-chain-status-card'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-co-chain-sse-live-badge')
        .or(page.getByTestId('brand-co-chain-poll-badge'))
        .or(page.getByTestId('brand-op-chain-sse-live-badge'))
        .or(page.getByTestId('brand-op-chain-poll-badge'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-co-detail-dossier-card')
        .or(page.getByTestId('brand-order-w2-dossier-card'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-order-w2-dossier-link')).toBeVisible({
      timeout: 30_000,
    });
    const w2DossierLink = page.getByTestId('brand-order-w2-dossier-link');
    await expect(w2DossierLink).toHaveAttribute(
      'href',
      /w2pane=tz.*w2sec=material|w2sec=material.*w2pane=tz/
    );

    const brandProdDetailRes = await page.goto(
      '/brand/b2b-orders/B2B-DEMO-SHOP1-SS27?pillar=order_production',
      GOTO
    );
    expect(brandProdDetailRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-op-detail-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-order-handoff-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('brand-op-chain-sse-live-badge')
        .or(page.getByTestId('brand-op-chain-poll-badge'))
        .or(page.getByTestId('brand-order-handoff-sse-live-badge'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-handoff-strip-shop-tracking')
        .or(page.getByTestId('brand-order-detail-shop-tracking-link'))
    ).toBeVisible({ timeout: 30_000 });

    const w2Res = await page.goto(
      '/brand/core?pillar=development&collection=SS27&article=demo-ss27-01&section=overview',
      GOTO
    );
    expect(w2Res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-dossier-panel')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-dev-dossier-sample-handoff-link')
        .or(page.getByTestId('brand-w2-sample-handoff-link'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-w2-tz-export-btn')).toBeVisible({ timeout: 30_000 });

    const preOrdersRes = await page.goto('/brand/pre-orders?collection=SS27', GOTO);
    expect(preOrdersRes?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/\/brand\/b2b-orders/, { timeout: 30_000 });
    await expect(page.getByTestId('brand-co-registry-panel')).toBeVisible({ timeout: 90_000 });

    const linesheetsRes = await page.goto('/brand/linesheets?collection=SS27', GOTO);
    expect(linesheetsRes?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('brand-sc-linesheets-unpublish-demo-ss27-01')
        .or(page.getByTestId('brand-linesheet-unpublish-demo-ss27-01'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('brand-sc-linesheets-matrix-qty-demo-ss27-01')
        .or(page.getByTestId('brand-linesheet-matrix-qty-demo-ss27-01'))
    ).toBeVisible({
      timeout: 30_000,
    });

    const retailersRes = await page.goto('/brand/retailers', GOTO);
    expect(retailersRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-co-retailers-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-co-retailers-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('brand-co-retailers-detail-link-shop1')
        .or(page.getByTestId('retailer-detail-link-shop1'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-co-retailers-orders-link-shop1')
        .or(page.getByTestId('retailer-orders-link-shop1'))
    ).toHaveAttribute('href', /partner=shop1/);
    const retailerDetailRes = await page.goto('/brand/retailers/shop1', GOTO);
    expect(retailerDetailRes?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('brand-co-retailer-detail-panel')
        .or(page.getByTestId('brand-retailer-detail-core'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-co-retailer-detail-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .locator('[data-testid^="brand-co-retailer-detail-order-link-"]')
        .or(page.locator('[data-testid^="retailer-detail-order-link-"]'))
        .first()
    ).toBeVisible({ timeout: 30_000 });
  });

  test('shop core pillars: связи и audit testids', async ({ page, request }) => {
    test.setTimeout(360_000);
    const pillars = [
      { pillar: 'sample_collection', testId: 'shop-sc-cabinet-panel' },
      { pillar: 'collection_order', testId: 'shop-co-cabinet-panel' },
      { pillar: 'comms', testId: 'comms-pillar-card' },
    ] as const;

    for (const { pillar, testId } of pillars) {
      const res = await gotoRoleCoreCabinet(page, `/shop/core?pillar=${pillar}`);
      expect(res?.status() ?? 599).toBeLessThan(500);
      if (pillar === 'sample_collection') {
        await expect(
          page
            .getByTestId('shop-sc-cabinet-panel')
            .or(page.getByTestId(testId))
            .or(page.getByTestId('shop-showroom-mini'))
        ).toBeVisible({ timeout: 60_000 });
        await expect(page.getByTestId('shop-sc-cabinet-golden-path')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('shop-sc-golden-path-checkout')).toBeVisible({
          timeout: 30_000,
        });
      } else {
        await expect(page.getByTestId(testId)).toBeVisible({ timeout: 60_000 });
      }
      if (pillar === 'comms') {
        await expect(page.getByTestId('shop-cm-order-chat-link')).toHaveAttribute(
          'href',
          SS27_WHOLESALE_ORDER_HREF
        );
        await expect(page.getByTestId('shop-cm-calendar-link')).toHaveAttribute(
          'href',
          SS27_WHOLESALE_ORDER_HREF
        );
      }
    }

    let res = await gotoRoleCoreCabinet(page, '/shop/core?pillar=collection_order');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page.getByTestId('shop-co-cabinet-panel').or(page.getByTestId('collection-order-pillar-card'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-cabinet-cta-orders')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-cabinet-tracking-link')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-collection-order-cart-qty-badge')).toBeVisible({
      timeout: 30_000,
    });

    const checkoutRes = await page.goto('/shop/b2b/checkout?collection=SS27', GOTO);
    expect(checkoutRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-checkout-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-checkout-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-co-checkout-buyer-label')).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByTestId('shop-co-checkout-form').or(page.getByTestId('shop-b2b-checkout-form'))
    ).toBeVisible({ timeout: 30_000 });

    res = await gotoRoleCoreCabinet(page, '/shop/core?pillar=comms');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-cm-article-chat-link')).toBeVisible({ timeout: 30_000 });

    const shopShowroomRes = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(shopShowroomRes?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .locator('[data-testid^="shop-sc-showroom-article-chat-link-"]')
        .or(page.locator('[data-testid^="shop-showroom-article-chat-link-"]'))
        .first()
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      page
        .locator('[data-testid^="shop-sc-matrix-entry-link-"]')
        .or(page.locator('[data-testid^="shop-sc-showroom-matrix-link-"]'))
        .or(page.locator('[data-testid^="shop-showroom-matrix-link-"]'))
        .first()
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .locator('[data-testid^="shop-sc-showroom-matrix-quick-add-"]')
        .or(page.locator('[data-testid^="shop-showroom-matrix-quick-add-"]'))
        .first()
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-sc-showroom-context-strip')).toBeVisible({
      timeout: 30_000,
    });

    const shopOrderDetailRes = await page.goto('/shop/b2b/orders/B2B-DEMO-SHOP1-SS27', GOTO);
    expect(shopOrderDetailRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-detail-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-detail-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-detail-matrix-link')).toHaveAttribute(
      'href',
      /collection=SS27/
    );
    await expect(
      page
        .getByTestId('shop-co-detail-chat-link')
        .or(page.getByTestId('shop-order-detail-chat-link'))
    ).toBeVisible({ timeout: 30_000 });

    const matrixRes = await page.goto(
      '/shop/b2b/matrix?collection=SS27&article=demo-ss27-01',
      GOTO
    );
    expect(matrixRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-matrix-entry-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-sc-matrix-entry-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-matrix-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-matrix-context-strip')).toHaveCount(0);
    await expect(page.getByTestId('shop-co-matrix-registry-link')).toHaveAttribute(
      'href',
      '/shop/b2b/orders'
    );
    await expect(page.getByTestId('shop-b2b-buyer-switcher')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .locator(
          '[data-testid^="shop-co-matrix-article-chat-"], [data-testid^="shop-b2b-matrix-article-chat-"]'
        )
        .first()
    ).toBeVisible({ timeout: 60_000 });

    const partnersRes = await page.goto('/shop/b2b/partners/discover', GOTO);
    expect(partnersRes?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('shop-sc-partners-source-note')
        .or(page.getByTestId('partners-discover-source-note'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('shop-sc-partners-collections-brand_syntha_lab')
        .or(page.getByTestId('partners-discover-collections-brand_syntha_lab'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-partners-showroom-brand_syntha_lab')
        .or(page.getByTestId('partners-discover-showroom-brand_syntha_lab'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-partners-matrix-brand_syntha_lab')
        .or(page.getByTestId('partners-discover-matrix-brand_syntha_lab'))
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-sc-cabinet-golden-path')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-partners-chat-brand_nordic_wool')
        .or(page.getByTestId('shop-sc-partners-invite-brand_nordic_wool'))
        .or(page.locator('[data-audit-legacy="shop-sc-partners-invite-brand_nordic_wool"]'))
    ).toBeVisible({
      timeout: 30_000,
    });

    const showroomRes = await page.goto('/brand/showroom?collection=SS27', GOTO);
    expect(showroomRes?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('brand-sc-showroom-context-strip')
        .or(page.getByTestId('brand-showroom-summary-strip'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-sc-showroom-shop-matrix-link')
        .or(page.getByTestId('brand-showroom-shop-matrix-link'))
    ).toBeVisible({ timeout: 30_000 });

    const calRes = await page.goto(
      '/shop/b2b/calendar?layers=orders,logistics&order=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(calRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-comms-cross-nav')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-cm-banner')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-cm-order-context-strip')).toHaveCount(0);
    await expect(page.getByTestId('shop-cm-calendar-events-badge')).toBeVisible({
      timeout: 30_000,
    });

    const shopOrdersRes = await page.goto('/shop/b2b/orders', GOTO);
    expect(shopOrdersRes?.status() ?? 599).toBeLessThan(500);
    await expect(
      page
        .getByTestId('shop-co-registry-export-csv')
        .or(page.getByTestId('shop-op-registry-export-csv'))
        .or(page.getByTestId('shop-b2b-registry-export-csv'))
    ).toBeVisible({ timeout: 30_000 });
    const activeOrderId = await fetchPlatformCoreActiveOrderId(request);

    const orderDetailRes = await page.goto(
      `/shop/b2b/orders/${encodeURIComponent(activeOrderId)}`,
      GOTO
    );
    expect(orderDetailRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-detail-chat-link')).toBeVisible({ timeout: 30_000 });

    const trackingRes = await page.goto(
      `/shop/b2b/tracking?order=${encodeURIComponent(activeOrderId)}&orderId=${encodeURIComponent(activeOrderId)}`,
      GOTO
    );
    expect(trackingRes?.status() ?? 599).toBeLessThan(500);
    await expect(
      shopTrackingTestId(page, 'sse-live-badge').or(shopTrackingTestId(page, 'poll-badge'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      shopTrackingTestId(page, 'context-strip').or(
        page.getByTestId('shop-tracking-order-context-strip')
      )
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      shopTrackingTestId(page, 'focus-row').or(shopTrackingRow(page, activeOrderId))
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .locator(`[data-testid^="platform-core-chain-step-"][data-order="${activeOrderId}"]`)
        .first()
    ).toBeVisible({ timeout: 90_000 });
    await expect(
      page.locator(
        `[data-testid="platform-core-chain-step-production_po"][data-order="${activeOrderId}"]`
      )
    ).toBeVisible({ timeout: 90_000 });
    await expect(
      shopTrackingTestId(page, 'export-csv').or(page.getByTestId('shop-b2b-tracking-export-csv'))
    ).toBeVisible({ timeout: 90_000 });

    const buyerMatrixRes = await page.goto('/shop/b2b/matrix?collection=SS27&buyer=shop1', {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    expect(buyerMatrixRes?.status() ?? 599).toBeLessThan(500);
    const buyerSwitcher = page.getByTestId('shop-b2b-buyer-switcher');
    await expect(buyerSwitcher).toBeVisible({ timeout: 90_000 });
    await buyerSwitcher.click();
    await expect(page.getByTestId('shop-b2b-buyer-option-shop2')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('shop-b2b-buyer-option-shop2').click();
    await expect(page).toHaveURL(/buyer=shop2/, { timeout: 10_000 });

    const shop2OrdersRes = await page.goto('/shop/b2b/orders?buyer=shop2', GOTO);
    expect(shop2OrdersRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-b2b-order-row-B2B-DEMO-SHOP2-SS27')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('manufacturer core pillars: связи и audit testids', async ({ page }) => {
    test.setTimeout(360_000);
    const pillars = [
      {
        pillar: 'development',
        testId: 'development-pillar-card',
        extra: 'mfr-dev-cabinet-brand-w2-link',
      },
      {
        pillar: 'order_production',
        testId: 'order-production-pillar-card',
        extra: 'mfr-op-wms-reserve-badge',
      },
      { pillar: 'comms', testId: 'comms-pillar-card' },
    ] as const;

    for (const { pillar, testId, extra } of pillars) {
      const res = await gotoRoleCoreCabinet(page, `/factory/production/core?pillar=${pillar}`);
      expect(res?.status() ?? 599).toBeLessThan(500);
      if (pillar === 'order_production') {
        await expect(
          page.getByTestId('mfr-op-cabinet-panel').or(page.getByTestId(testId))
        ).toBeVisible({ timeout: 60_000 });
      } else if (pillar === 'development') {
        await expect(
          page
            .getByTestId('mfr-dev-cabinet-panel')
            .or(page.getByTestId('development-pillar-card'))
            .first()
        ).toBeVisible({ timeout: 60_000 });
        await expect(page.getByTestId('mfr-dev-cabinet-context-strip')).toBeVisible({
          timeout: 30_000,
        });
      } else {
        await expect(page.getByTestId(testId)).toBeVisible({ timeout: 60_000 });
      }
      if (extra) {
        await expect(
          page
            .getByTestId('mfr-op-cabinet-wms-reserve-badge')
            .or(page.getByTestId(extra))
            .or(page.getByTestId('mfr-dev-brand-w2-link'))
        ).toBeVisible({ timeout: 30_000 });
      }
      if (pillar === 'comms') {
        await expect(page.getByTestId('mfr-cm-order-chat-link')).toHaveAttribute(
          'href',
          /B2B-DEMO-SHOP1-SS27/
        );
        await expect(page.getByTestId('mfr-cm-calendar-link')).toHaveAttribute(
          'href',
          /B2B-DEMO-SHOP1-SS27/
        );
      }
      if (pillar === 'order_production') {
        await expect(page.getByTestId('mfr-op-cabinet-chain-steps')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('mfr-op-cabinet-handoff-link')).toHaveAttribute(
          'href',
          /order=B2B-DEMO-SHOP1-SS27/
        );
        await expect(page.getByTestId('mfr-op-cabinet-prod-orders-link')).toBeVisible({
          timeout: 30_000,
        });
        await expect(page.getByTestId('mfr-op-cabinet-dossier-link')).toHaveAttribute(
          'href',
          /pillar=order_production/
        );
        await expect(page.getByTestId('mfr-op-cabinet-tracking-link')).toBeVisible({
          timeout: 30_000,
        });
      }
    }

    const mfrDossierRes = await page.goto(
      '/factory/production/dossier/demo-ss27-01?collection=SS27&pillar=order_production&order=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(mfrDossierRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('mfr-op-dossier-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-op-dossier-print-btn')).toBeVisible({ timeout: 30_000 });

    const mfrMaterialsRes = await page.goto(
      '/factory/production/materials?collection=SS27&article=demo-ss27-01&view=procurement&po=PO-B2B-B2B-DEMO-SHOP1-SS27&order=B2B-DEMO-SHOP1-SS27',
      GOTO
    );
    expect(mfrMaterialsRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('materials-procurement-view')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-op-materials-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-op-materials-supplier-hint')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('materials-procurement-bulk-confirm')).toHaveCount(0);

    const supProcRes = await page.goto(
      '/factory/production/materials?collection=SS27&article=demo-ss27-01&view=procurement&po=PO-B2B-B2B-DEMO-SHOP1-SS27&order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27&role=supplier',
      GOTO
    );
    expect(supProcRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('sup-op-procurement-context-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('sup-op-procurement-handoff-link')).toHaveAttribute(
      'href',
      /order=B2B-DEMO-SHOP1-SS27/
    );
    await expect(
      page
        .getByTestId('sup-op-procurement-bulk-confirm')
        .or(page.getByTestId('materials-procurement-bulk-confirm'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-op-procurement-tracking-link')).toHaveAttribute(
      'href',
      /order=B2B-DEMO-SHOP1-SS27/
    );
    await expect(page.getByTestId('sup-op-bom-po-progress')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-op-chain-workspace')).toHaveCount(0);
    await expect(page.getByTestId('mfr-op-materials-supplier-hint')).toHaveCount(0);
  });

  test('supplier core pillars: order_production audit testids', async ({ page }) => {
    test.setTimeout(180_000);

    let res = await page.goto('/factory/supplier/core?pillar=order_production', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const supplierCabinet = page.getByTestId('role-core-cabinet-supplier');
    await expect(supplierCabinet).toBeVisible({ timeout: 30_000 });
    await expect(supplierCabinet.getByTestId('role-core-pillar-panel')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('sup-op-cabinet-panel')
        .or(page.getByTestId('supplier-procurement-pillar-card'))
        .first()
    ).toBeVisible({ timeout: 30_000 });
    {
      await expect(page.getByTestId('sup-op-cabinet-cta-production')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId('sup-op-chain-steps')).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId('supplier-procurement-bom-progress')).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page
          .getByTestId('sup-op-cabinet-handoff-link')
          .or(page.getByTestId('sup-op-handoff-read-queue-link'))
      ).toHaveAttribute('href', /order=B2B-DEMO-SHOP1-SS27/);
      await expect(page.getByTestId('sup-op-cabinet-tracking-link')).toHaveAttribute(
        'href',
        /order=B2B-DEMO-SHOP1-SS27/
      );
      await expect(page.getByTestId('sup-op-cabinet-procurement-link')).toHaveAttribute(
        'href',
        /role=supplier/
      );
    }
  });

  test('supplier core pillars: development audit testids', async ({ page }) => {
    const res = await page.goto('/factory/supplier/core?pillar=development', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-bom-preview-mini')).toBeVisible({ timeout: 30_000 });
  });

  test('supplier core pillars: comms audit testids', async ({ page }) => {
    const res = await page.goto('/factory/supplier/messages?order=B2B-DEMO-SHOP1-SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('factory-messages-core')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByTestId('sup-cm-order-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-cm-article-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-cm-order-procurement-link')).toHaveAttribute(
      'href',
      /role=supplier/
    );
  });
});
