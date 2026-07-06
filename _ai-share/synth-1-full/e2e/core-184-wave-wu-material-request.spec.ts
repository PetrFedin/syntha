import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace } from './helpers/core-chain-overview';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';
const DEMO_ARTICLE = 'demo-ss27-01';

const MFR_MATERIALS_URL =
  `/factory/production/materials?collection=${COLLECTION}&article=${DEMO_ARTICLE}` +
  `&view=procurement&po=PO-B2B-${DEMO_ORDER}&order=${DEMO_ORDER}`;

/**
 * Wave WU: mfr PO ack auto material-request + supplier PATCH deep-link strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-184-wave-wu-material-request.spec.ts
 */
test.describe('core-184: wave WU mfr auto material-request', () => {
  test('PO ack auto-creates material-request drafts in PG', async ({ request }) => {
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

    let ackJson: {
      ok?: boolean;
      acknowledged?: string[];
      materialRequestAuto?: Array<{ created?: number; requisitionIds?: string[] }>;
    } = {};

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
            actor: 'e2e-core-184',
          },
        }
      );
      expect(ack.ok()).toBeTruthy();
      ackJson = (await ack.json()) as typeof ackJson;
      expect(ackJson.ok).toBe(true);
    }

    const matRes = await request.get(
      `/api/workshop2/articles/${encodeURIComponent(row.collectionId)}/${encodeURIComponent(row.articleId)}/sample-material-request`
    );
    test.skip(!matRes.ok(), 'material-request API недоступен');
    const mat = (await matRes.json()) as { requisitions?: unknown[] };
    expect(Array.isArray(mat.requisitions)).toBe(true);
    expect((mat.requisitions ?? []).length).toBeGreaterThan(0);

    if (ackJson.materialRequestAuto?.length) {
      const auto = ackJson.materialRequestAuto[0];
      expect((auto?.created ?? 0) + (auto?.requisitionIds?.length ?? 0)).toBeGreaterThan(0);
    }
  });

  test('mfr OP materials strip deep-links supplier PATCH procurement', async ({ page }) => {
    const res = await gotoPlatformCoreWorkspace(page, MFR_MATERIALS_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('materials-procurement-view')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('mfr-op-materials-supplier-patch-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-op-materials-supplier-hint')).toBeVisible();

    const patchLink = page
      .getByTestId('mfr-op-materials-supplier-link-patch')
      .or(page.getByTestId('mfr-op-materials-supplier-link-done'));
    await expect(patchLink).toBeVisible();
    await expect(patchLink).toHaveAttribute('href', /role=supplier/);
    await expect(patchLink).toHaveAttribute('href', /view=procurement/);
    await expect(page.getByTestId('materials-procurement-bulk-confirm')).toHaveCount(0);

    await patchLink.click();
    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 45_000 });
    await expect(
      page
        .getByTestId('sup-op-procurement-bulk-confirm')
        .or(page.getByTestId('materials-procurement-bulk-confirm'))
    ).toBeVisible();
    await expect(page.getByTestId('mfr-op-materials-supplier-patch-strip')).toHaveCount(0);
  });
});
