import { test, expect } from '@playwright/test';

/**
 * Wave UF: supplier RFQ SLA timer + quote card + price delta alerts.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-132-wave-uf-supplier-rfq-sla.spec.ts
 */
test.describe('core-132: wave UF supplier RFQ SLA + price delta', () => {
  test('price-delta-alerts GET API', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await request.get(
      '/api/workshop2/supplier/price-delta-alerts?collectionId=SS27&articleId=demo-ss27-01'
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; alerts?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.alerts)).toBe(true);
  });

  test('supplier RFQ inbox: SLA timer + quote card', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/factory/supplier/rfq-inbox?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('supplier-rfq-inbox-panel')).toBeVisible({ timeout: 60_000 });

    const slaStrip = page.getByTestId('sup-dev-rfq-sla-timer-strip');
    const quotePanel = page.getByTestId('sup-dev-rfq-quote-card-panel');
    await expect(slaStrip.or(quotePanel).first()).toBeVisible({ timeout: 30_000 });
  });

  test('supplier core nav: material catalog link', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/factory/core?pillar=development&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('role-core-pillar-nav')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('supplier-core-material-catalog-nav')).toBeVisible({
      timeout: 30_000,
    });
  });
});
