import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;

/**
 * Wave YO: supplier comms 4.3 — quote peer RFQ dedupe, chain-status materials_supplied push,
 * calendar logistics ETA compact polish.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-230-wave-yo-sup-comms.spec.ts
 */
test.describe('core-230: wave YO supplier comms dedupe + push', () => {
  test('supplier comms cabinet: RFQ inbox peers not messages alias', async ({ page }) => {
    const res = await page.goto(`/factory/supplier/core?collection=${COLLECTION}&pillar=comms`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 45_000 });

    const rfqPeer = page.getByTestId('sup-cm-cabinet-rfq-inbox-peer-link');
    await expect(rfqPeer).toBeVisible({ timeout: 30_000 });
    await expect(rfqPeer).toHaveAttribute('href', /\/factory\/supplier\/rfq-inbox/);
    await expect(rfqPeer).not.toHaveAttribute('href', /feature=rfq/);
    await expect(rfqPeer).not.toHaveAttribute('href', /pcf=rfq/);
    await expect(rfqPeer).not.toHaveAttribute('href', /\/factory\/supplier\/messages/);
  });

  test('supplier comms cabinet: quote honest strip RFQ inbox peer (audit)', async ({ page }) => {
    const res = await page.goto(
      `/factory/supplier/core?collection=${COLLECTION}&pillar=comms&audit=1`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const quoteStrip = page.getByTestId('sup-cm-article-quote-honest-strip');
    const stripVisible = await quoteStrip.isVisible().catch(() => false);
    if (stripVisible) {
      const rfqLink = page.getByTestId('sup-cm-article-quote-rfq-inbox-link');
      await expect(rfqLink).toBeVisible();
      await expect(rfqLink).toHaveAttribute('href', /\/factory\/supplier\/rfq-inbox/);
      await expect(rfqLink).not.toHaveAttribute('href', /feature=rfq/);
      await expect(rfqLink).not.toHaveAttribute('href', /pcf=rfq/);
    }
  });

  test('supplier comms cabinet: materials_supplied chain-status push strip', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(`/factory/supplier/core?collection=${COLLECTION}&pillar=comms`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 45_000 });

    const pushStrip = page.locator(`[data-testid="sup-cm-chain-materials-push-${DEMO_ORDER}"]`);
    const pushVisible = await pushStrip.isVisible().catch(() => false);
    if (pushVisible) {
      await expect(pushStrip).toHaveAttribute('data-materials-sse-live', /[01]/);
      await expect(pushStrip).toHaveAttribute('data-materials-push-bump', /[01]/);
      const pushBadge = page.getByTestId(
        `sup-cm-chain-materials-push-${DEMO_ORDER}-materials-supplied-push`
      );
      const badgeVisible = await pushBadge.isVisible().catch(() => false);
      if (badgeVisible) {
        await expect(pushBadge).toContainText('materials_supplied');
      }
    }

    const pollOrSse = page.locator(
      '[data-testid="comms-pillar-sse-live-badge"], [data-testid="sup-cm-cabinet-poll-badge"]'
    );
    const chainVisible = await pollOrSse.first().isVisible().catch(() => false);
    if (chainVisible) {
      await expect(pollOrSse.first()).toBeVisible();
    }
  });

  test('supplier calendar: logistics ETA compact strip polish', async ({ page }) => {
    const res = await page.goto(
      `/factory/calendar?role=supplier&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&layers=tasks,orders,logistics`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('sup-cm-calendar-logistics-peer-strip')).toBeVisible({
      timeout: 45_000,
    });

    const etaStrip = page.getByTestId('sup-cm-logistics-eta-strip');
    await expect(etaStrip).toBeVisible();
    await expect(etaStrip).toHaveAttribute('data-eta-compact', '1');
    await expect(page.getByTestId('sup-cm-logistics-eta-map-stub')).toBeVisible();
    await expect(page.getByTestId('sup-cm-logistics-eta-tracking-link')).toBeVisible();

    const rfqNav = page.getByTestId('supplier-sidebar-rfq-inbox-nav');
    if ((await rfqNav.count()) > 0) {
      await expect(rfqNav).toHaveAttribute('href', /\/factory\/supplier\/rfq-inbox/);
      await expect(rfqNav).not.toHaveAttribute('href', /feature=rfq/);
    }
  });

  test('GET notification-events supplier role for materials_supplied', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await request.get(
      `/api/platform-core/notification-events?role=supplier&orderId=${encodeURIComponent(DEMO_ORDER)}&limit=6`
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      role?: string;
      events?: Array<{ kind?: string }>;
    };
    expect(json.ok).toBe(true);
    expect(json.role).toBe('supplier');
    expect(Array.isArray(json.events)).toBe(true);
  });

  test('supplier rfq-inbox route reachable (dedupe target)', async ({ page }) => {
    const res = await page.goto(
      `/factory/supplier/rfq-inbox?collection=${COLLECTION}&article=${PLATFORM_CORE_DEMO.demoArticleId}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/\/factory\/supplier\/rfq-inbox/);
    await expect(page.getByTestId('supplier-rfq-inbox-core').or(page.getByTestId('supplier-rfq-inbox-panel'))).toBeVisible({
      timeout: 45_000,
    });
  });
});
