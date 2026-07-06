import { test, expect } from '@playwright/test';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';
const DEMO_ARTICLE = 'demo-ss27-01';

/**
 * Wave TZ: mfr P2 — dossier comments, sample PATCH, PO ack material-request, WIP floor tablet.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-127-wave-tz-mfr-dev-op.spec.ts
 */
test.describe('core-127: wave TZ mfr dev + OP', () => {
  test('dossier comments API POST + GET', async ({ request }) => {
    const post = await request.post('/api/workshop2/manufacturer/dossier/comments', {
      data: {
        collectionId: COLLECTION,
        articleId: DEMO_ARTICLE,
        text: 'E2E комментарий цеха к read-only ТЗ',
        actor: 'e2e-core-127',
      },
    });
    expect(post.ok()).toBeTruthy();
    const posted = (await post.json()) as { ok?: boolean; comment?: { commentId?: string } };
    expect(posted.ok).toBe(true);
    expect(posted.comment?.commentId).toBeTruthy();

    const get = await request.get(
      `/api/workshop2/manufacturer/dossier/comments?collectionId=${COLLECTION}&articleId=${DEMO_ARTICLE}`
    );
    expect(get.ok()).toBeTruthy();
    const listed = (await get.json()) as { comments?: unknown[] };
    expect(Array.isArray(listed.comments)).toBe(true);
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
          note: 'core-127 factory PATCH',
        },
      }
    );
    expect(patch.ok()).toBeTruthy();
  });

  test('PO ack creates material-request drafts', async ({ request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!queueRes.ok(), 'handoff queue недоступен');
    const queue = (await queueRes.json()) as {
      items?: Array<{
        productionOrderId: string;
        collectionId: string;
        articleId: string;
        status: string;
        b2bOrderId: string;
      }>;
    };
    const row = queue.items?.find((i) => i.b2bOrderId === DEMO_ORDER) ?? queue.items?.[0];
    test.skip(!row, 'нет PO в очереди');

    if (row.status === 'pending_erp') {
      const ack = await request.post(
        '/api/workshop2/factory/production-handoff-queue/bulk-acknowledge',
        {
          data: {
            factoryId: FACTORY_ID,
            items: [
              {
                productionOrderId: row.productionOrderId,
                collectionId: row.collectionId,
                articleId: row.articleId,
              },
            ],
            actor: 'e2e-core-127',
          },
        }
      );
      expect(ack.ok()).toBeTruthy();
    }

    const matRes = await request.get(
      `/api/workshop2/articles/${encodeURIComponent(row.collectionId)}/${encodeURIComponent(row.articleId)}/sample-material-request`
    );
    test.skip(!matRes.ok(), 'material-request API недоступен');
    const mat = (await matRes.json()) as { requisitions?: unknown[] };
    expect(Array.isArray(mat.requisitions)).toBe(true);
  });

  test('WIP status PATCH from floor tablet API', async ({ request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${FACTORY_ID}`
    );
    test.skip(!queueRes.ok(), 'handoff queue недоступен');
    const queue = (await queueRes.json()) as {
      items?: Array<{
        productionOrderId: string;
        collectionId: string;
        articleId: string;
        status: string;
      }>;
    };
    const row = queue.items?.find((i) => i.status === 'synced') ?? queue.items?.[0];
    test.skip(!row, 'нет synced PO');

    const patch = await request.patch(
      `/api/workshop2/manufacturer/production-orders/${encodeURIComponent(row.productionOrderId)}/wip-status`,
      {
        data: {
          factoryId: FACTORY_ID,
          collectionId: row.collectionId,
          articleId: row.articleId,
          advance: row.status === 'synced',
        },
      }
    );
    if (row.status !== 'synced') {
      expect([409, 403]).toContain(patch.status());
      return;
    }
    expect(patch.ok()).toBeTruthy();
    const json = (await patch.json()) as { ok?: boolean; stage?: string };
    expect(json.ok).toBe(true);
    expect(typeof json.stage).toBe('string');
  });

  test('UI: dossier annotation panel + floor tablet strip', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(DEMO_ARTICLE)}?collection=${COLLECTION}`
    );
    await expect(page.getByTestId('mfr-dev-dossier-annotation-panel')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-dev-dossier-annotation-peer-strip')).toBeVisible();

    await page.goto(`/factory/production/orders?collection=${COLLECTION}&order=${DEMO_ORDER}`);
    await expect(page.getByTestId('factory-production-orders-core')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-wip-floor-tablet-strip')).toBeVisible({ timeout: 30_000 });
  });

  test('UI: empty pillar publish badge + handoff count', async ({ page }) => {
    await page.goto('/factory/core?collection=EMPTY27');
    await expect(page.getByTestId('mfr-empty-sc-publish-badge').or(page.getByTestId('manufacturer-sample-collection-pg-table'))).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-empty-co-handoff-count-badge')).toBeVisible({
      timeout: 30_000,
    });
  });
});
