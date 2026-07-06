import { test, expect } from '@playwright/test';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';
const DEMO_ARTICLE = 'demo-ss27-01';

/**
 * Wave XC: mfr sample queue — factory PATCH limited fields, hash-scroll to item, PG mirror bump.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-192-wave-xc-sample-patch.spec.ts
 */
test.describe('core-192: wave XC mfr sample queue PATCH + hash-scroll', () => {
  test('factory sample-queue PATCH limited fields + development-status bump', async ({ request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/sample-queue?factoryId=${FACTORY_ID}&status=draft,sent,in_progress`
    );
    test.skip(!queueRes.ok(), 'PG sample queue недоступен');
    const queue = (await queueRes.json()) as {
      items?: Array<{ orderId: string; collectionId: string; articleId: string; status: string }>;
    };
    const item = queue.items?.[0];
    test.skip(!item, 'нет образцов в очереди');

    const beforeDev = await request.get(
      `/api/workshop2/collections/${COLLECTION}/development-status?skipRangePlanner=1&factoryId=${FACTORY_ID}`
    );
    test.skip(!beforeDev.ok(), 'PG development-status недоступен');

    const targetStatus = item.status === 'sent' ? 'in_progress' : 'received';
    const patch = await request.patch(
      `/api/workshop2/factory/sample-queue/${encodeURIComponent(item.orderId)}`,
      {
        data: {
          collectionId: item.collectionId,
          articleId: item.articleId,
          status: targetStatus,
          note: 'core-192 factory PATCH',
        },
      }
    );
    expect(patch.ok()).toBeTruthy();
    const patchJson = (await patch.json()) as { ok?: boolean; order?: { status?: string } };
    expect(patchJson.ok).toBe(true);
    expect(patchJson.order?.status).toBe(targetStatus);

    const afterDev = await request.get(
      `/api/workshop2/collections/${COLLECTION}/development-status?skipRangePlanner=1&factoryId=${FACTORY_ID}`
    );
    expect(afterDev.ok()).toBeTruthy();
    const devJson = (await afterDev.json()) as {
      ok?: boolean;
      status?: { factorySampleHref?: string; sampleQueueCount?: number };
    };
    expect(devJson.ok).toBe(true);
    expect(typeof devJson.status?.sampleQueueCount).toBe('number');
    if (devJson.status?.factorySampleHref) {
      expect(devJson.status.factorySampleHref).toContain('pcf=sample-queue');
    }
  });

  test('sample state-change webhook accepts factory PATCH mirror event', async ({ request }) => {
    const post = await request.post('/api/workshop2/samples/state-change-webhook', {
      data: {
        collectionId: COLLECTION,
        articleId: DEMO_ARTICLE,
        orderId: 'core-192-sample-order',
        eventId: `core-192-webhook-${Date.now()}`,
        fromStatus: 'sent',
        toStatus: 'in_progress',
        actor: 'e2e-core-192',
      },
    });
    expect(post.ok()).toBeTruthy();
    const json = (await post.json()) as { ok?: boolean; journalRecorded?: boolean };
    expect(json.ok).toBe(true);
    expect(json.journalRecorded).toBe(true);
  });

  test('UI: sample queue hash-scroll to item + RU poll badge', async ({ page }) => {
    const queueRes = await page.request.get(
      `/api/workshop2/factory/sample-queue?factoryId=${FACTORY_ID}&status=draft,sent,in_progress`
    );
    test.skip(!queueRes.ok(), 'PG sample queue недоступен');
    const queue = (await queueRes.json()) as {
      items?: Array<{ orderId: string }>;
    };
    const orderId = queue.items?.[0]?.orderId;
    test.skip(!orderId, 'нет образцов в очереди');

    const hash = `sample-queue-${encodeURIComponent(orderId)}`;
    await page.goto(`/factory/production?collection=${COLLECTION}&pcf=sample-queue#${hash}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.getByTestId('factory-w2-sample-queue')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-dev-sample-queue-poll-badge')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-dev-sample-queue-poll-badge')).not.toContainText(/SSE live|poll 15s/i);

    const item = page.locator(`[data-order-id="${orderId}"]`).first();
    await expect(item).toBeVisible({ timeout: 30_000 });
    await expect(item).toHaveAttribute('id', hash);
  });

  test('UI: mfr dev cabinet PG mirror strip (shared poll, no duplicate hook)', async ({ page }) => {
    await page.goto(`/factory/production/core?pillar=development&collection=${COLLECTION}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.getByTestId('mfr-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-dev-development-status-mirror-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-dev-development-status-mirror-meta')).not.toContainText(
      /SSE live|poll 15s/i
    );
    const sampleLink = page.getByTestId('mfr-dev-cabinet-sample-queue-link');
    await expect(sampleLink).toBeVisible({ timeout: 30_000 });
    const href = await sampleLink.getAttribute('href');
    expect(href ?? '').toContain('pcf=sample-queue');
    expect(href ?? '').toContain('#sample-queue');
  });
});
