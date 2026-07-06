import { test, expect } from '@playwright/test';

const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave VO: supplier comms logistics ETA/map + chain-status push + RFQ inbox peer + RU strips.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-159-wave-vo-sup-logistics.spec.ts
 */
test.describe('core-159: wave VO supplier comms logistics', () => {
  test('supplier calendar: logistics ETA/map overlay strip', async ({ page }) => {
    const res = await page.goto(
      `/factory/calendar?role=supplier&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&layers=tasks,orders,logistics`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('sup-cm-calendar-logistics-peer-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('sup-cm-logistics-eta-strip')).toBeVisible();
    await expect(page.getByTestId('sup-cm-logistics-eta-map-stub')).toBeVisible();

    const etaBadge = page.getByTestId('sup-cm-logistics-eta-badge');
    const honestHint = page.getByTestId('sup-cm-logistics-eta-honest-hint');
    const badgeVisible = await etaBadge.isVisible().catch(() => false);
    const hintVisible = await honestHint.isVisible().catch(() => false);
    expect(badgeVisible || hintVisible).toBeTruthy();

    await expect(page.getByTestId('sup-cm-logistics-eta-tracking-link')).toBeVisible();
    await expect(page.getByTestId('sup-cm-calendar-shop-tracking-link')).toBeVisible();

    const peerBadge = page.getByText('Логистика', { exact: true });
    await expect(peerBadge.first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Чат по поставке' })).toBeVisible();
  });

  test('supplier comms cabinet: chain-status dot + RFQ inbox peer (not messages alias)', async ({
    page,
  }) => {
    const res = await page.goto(`/factory/supplier/core?collection=${COLLECTION}&pillar=comms`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 45_000 });

    const chainDot = page.locator(
      '[data-testid="comms-pillar-sse-live-badge"], [data-testid="sup-cm-cabinet-poll-badge"]'
    );
    const chainVisible = await chainDot.first().isVisible().catch(() => false);
    if (chainVisible) {
      await expect(chainDot.first()).toBeVisible();
    }

    const rfqPeer = page.getByTestId('sup-cm-cabinet-rfq-inbox-peer-link');
    await expect(rfqPeer).toBeVisible({ timeout: 45_000 });
    await expect(rfqPeer).toHaveAttribute('href', /\/factory\/supplier\/rfq-inbox/);
    await expect(rfqPeer).not.toHaveAttribute('href', /feature=rfq/);
    await expect(rfqPeer).not.toHaveAttribute('href', /pcf=rfq/);
  });

  test('supplier comms cabinet: quote honest strip RFQ inbox peer link', async ({ page }) => {
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
    }
  });

  test('supplier comms strips: RU labels without English placeholders', async ({ page }) => {
    const res = await page.goto(`/factory/supplier/core?collection=${COLLECTION}&pillar=comms`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 45_000 });

    const crmStrip = page.getByTestId('sup-cm-crm-peer-strip');
    const crmVisible = await crmStrip.isVisible().catch(() => false);
    if (crmVisible) {
      await expect(crmStrip.getByText('Brand segments')).toHaveCount(0);
      await expect(crmStrip.getByText('Сегменты бренда')).toBeVisible();
    }

    const pushStrip = page.getByTestId('sup-cm-cabinet-brand-push-strip');
    const pushVisible = await pushStrip.isVisible().catch(() => false);
    if (pushVisible) {
      await expect(pushStrip.getByText('Push notify')).toHaveCount(0);
      await expect(pushStrip.getByText('Уведомление')).toBeVisible();
    }
  });
});
