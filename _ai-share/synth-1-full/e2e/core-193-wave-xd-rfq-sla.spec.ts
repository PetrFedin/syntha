import { test, expect } from '@playwright/test';

/**
 * Wave XD: supplier RFQ thread SLA timer + quote card RU + RFQ inbox route dedupe.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-193-wave-xd-rfq-sla.spec.ts
 */
test.describe('core-193: wave XD supplier RFQ thread SLA', () => {
  test('rfq-sla-anchor GET API', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await request.get(
      '/api/workshop2/supplier/rfq-sla-anchor?collectionId=SS27&articleId=demo-ss27-01'
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      anchorSource?: string;
      anchorAt?: string | null;
    };
    expect(json.ok).toBe(true);
    expect(['centric_imported_at', 'thread_created_at', 'none']).toContain(json.anchorSource);
  });

  test('supplier RFQ inbox: SLA strip + quote card RU links', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/factory/supplier/rfq-inbox?collection=SS27&article=demo-ss27-01', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('supplier-rfq-inbox-panel')).toBeVisible({ timeout: 60_000 });

    const slaStrip = page.getByTestId('sup-dev-rfq-sla-timer-strip');
    const quotePanel = page.getByTestId('sup-dev-rfq-quote-card-panel');
    await expect(slaStrip.or(quotePanel).first()).toBeVisible({ timeout: 30_000 });

    const inboxLink = page.getByTestId('sup-dev-rfq-quote-card-inbox-link');
    if (await inboxLink.isVisible().catch(() => false)) {
      const href = await inboxLink.getAttribute('href');
      expect(href ?? '').toContain('/factory/supplier/rfq-inbox');
      expect(href ?? '').not.toContain('feature=rfq');
    }
  });

  test('supplier comms entity thread RFQ: inline SLA badge', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      '/factory/supplier/messages?pcf=entities&collection=SS27&article=demo-ss27-01',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByTestId('supplier-comms-entity-threads-panel')).toBeVisible({
      timeout: 60_000,
    });
    const rfqThread = page.getByTestId('supplier-comms-entity-thread-rfq');
    await expect(rfqThread).toBeVisible({ timeout: 30_000 });
    await expect(
      rfqThread.getByTestId(/^sup-dev-rfq-sla-timer-thread-badge-/)
    ).toBeVisible({ timeout: 30_000 });
  });
});
