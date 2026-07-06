import { test, expect } from '@playwright/test';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';
const DEMO_ARTICLE = 'demo-ss27-01';

/**
 * Wave VL: mfr dev attach-photo DAM, PG development-status mirror, sample queue hash-scroll + PATCH.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-156-wave-vl-mfr-dev-dam.spec.ts
 */
test.describe('core-156: wave VL mfr dev DAM + status mirror', () => {
  test('sample attach-photo DAM stub POST', async ({ request }) => {
    const post = await request.post('/api/workshop2/manufacturer/samples/attach-photo', {
      data: {
        collectionId: COLLECTION,
        articleId: DEMO_ARTICLE,
        factoryId: FACTORY_ID,
        orderId: DEMO_ORDER,
        filename: 'sample-photo-front.jpg',
      },
    });
    expect(post.ok()).toBeTruthy();
    const json = (await post.json()) as { ok?: boolean; assetId?: string; url?: string };
    expect(json.ok).toBe(true);
    expect(json.assetId).toBeTruthy();
    expect(json.url).toContain('attach-photo');
  });

  test('development-status GET for PG mirror', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/collections/${COLLECTION}/development-status?skipRangePlanner=1&factoryId=${FACTORY_ID}`
    );
    test.skip(!res.ok(), 'PG development-status недоступен');
    const json = (await res.json()) as {
      ok?: boolean;
      status?: { steps?: unknown[]; articleCount?: number };
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.status?.steps)).toBe(true);
  });

  test('factory sample-queue PATCH limited fields', async ({ request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/sample-queue?factoryId=${FACTORY_ID}&status=draft,sent,in_progress`
    );
    test.skip(!queueRes.ok(), 'PG sample queue недоступен');
    const queue = (await queueRes.json()) as {
      items?: Array<{ orderId: string; collectionId: string; articleId: string; status: string }>;
    };
    const item = queue.items?.[0];
    test.skip(!item, 'нет образцов в очереди');

    const targetStatus = item.status === 'sent' ? 'in_progress' : 'received';
    const patch = await request.patch(
      `/api/workshop2/factory/sample-queue/${encodeURIComponent(item.orderId)}`,
      {
        data: {
          collectionId: item.collectionId,
          articleId: item.articleId,
          status: targetStatus,
          note: 'core-156 factory PATCH',
        },
      }
    );
    expect(patch.ok()).toBeTruthy();
  });

  test('UI: mfr dev cabinet development-status mirror strip', async ({ page }) => {
    await page.goto(
      `/factory/production/core?pillar=development&collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 90_000 }
    );
    await expect(page.getByTestId('mfr-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-dev-development-status-mirror-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-dev-development-status-mirror-pg-badge')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('UI: sample queue hash-scroll + DAM attach strip', async ({ page }) => {
    await page.goto(`/factory/production?collection=${COLLECTION}#sample-queue`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.getByTestId('factory-w2-sample-queue')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-dev-sample-photo-dam-stub-strip')).toBeVisible({
      timeout: 30_000,
    });
    const inProgressBtn = page.getByTestId('factory-sample-in-progress-button');
    const ackBtn = page.getByTestId('factory-sample-ack-button');
    await expect(inProgressBtn.or(ackBtn).first()).toBeVisible({ timeout: 30_000 });
  });

  test('UI: dossier attach-photo DAM strip', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(DEMO_ARTICLE)}?collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 90_000 }
    );
    await expect(page.getByTestId('mfr-dev-sample-photo-dam-stub-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-dev-sample-photo-dam-stub-btn')).toBeVisible({
      timeout: 30_000,
    });
  });
});
