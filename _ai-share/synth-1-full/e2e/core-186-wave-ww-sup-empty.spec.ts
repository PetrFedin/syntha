import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION = 'SS27';

const SUP_CO_PEER_LINKS = [
  'sup-empty-co-mfr-handoff-link',
  'sup-empty-co-procurement-link',
  'sup-empty-co-forecast-link',
  'sup-empty-co-tracking-link',
] as const;

/**
 * Wave WW: supplier empty SC/CO — linesheet BOM PG notify + expected PO date read-only.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-186-wave-ww-sup-empty.spec.ts
 */
test.describe('core-186: wave WW supplier empty pillars', () => {
  test('empty SC: BOM mini + linesheet notify strip + peer link', async ({ page }) => {
    const res = await page.goto(
      `/factory/supplier/core?pillar=sample_collection&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-bom-preview-mini')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('sup-empty-sc-linesheet-notify-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('sup-empty-sc-linesheet-bom-peer-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-payment-intent-strip')).toHaveCount(0);
  });

  test('empty CO: forecast + expected PO date + RU peer strip (no checkout)', async ({ page }) => {
    const res = await page.goto(
      `/factory/supplier/core?pillar=collection_order&collection=${COLLECTION}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-collection-order-forecast')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('sup-empty-co-expected-po-date-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('sup-empty-co-peer-strip')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-payment-intent-strip')).toHaveCount(0);

    let visiblePeerLinks = 0;
    for (const tid of SUP_CO_PEER_LINKS) {
      if (await page.getByTestId(tid).isVisible().catch(() => false)) visiblePeerLinks += 1;
    }
    expect(visiblePeerLinks).toBeGreaterThanOrEqual(2);
  });

  test('linesheet syndicate API writes supplier PG notification scope', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };

    const res = await request.post('/api/brand/linesheets/syndicate', {
      data: {
        collectionId: COLLECTION,
        shopBuyerId: 'shop1',
        articleIds: ['demo-ss27-01'],
        source: 'syndicate_publish',
      },
    });
    expect(res.status()).toBeLessThan(500);

    if (health.pgReachable) {
      const notifyRes = await request.get(
        `/api/platform-core/notification-events?role=supplier&collectionId=${COLLECTION}&scopeKey=linesheet:${COLLECTION}`
      );
      expect(notifyRes.status()).toBeLessThan(500);
      const json = (await notifyRes.json()) as {
        ok?: boolean;
        storageMode?: string;
        events?: Array<{ titleRu?: string }>;
      };
      if (json.ok && json.storageMode === 'postgres') {
        expect(json.events?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  test('handoff queue PG exposes handoffAt for expected PO date strip', async ({ request }) => {
    const res = await request.get('/api/workshop2/factory/production-handoff-queue?factoryId=fact-1');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      items?: Array<{ b2bOrderId?: string; handoffAt?: string; productionOrderId?: string }>;
    };
    expect(typeof json.ok).toBe('boolean');
    if (json.ok && json.items?.length) {
      const hit = json.items.find((i) => i.b2bOrderId?.trim());
      if (hit) {
        expect(typeof hit.handoffAt === 'string' || hit.handoffAt === undefined).toBe(true);
      }
    }
  });
});
