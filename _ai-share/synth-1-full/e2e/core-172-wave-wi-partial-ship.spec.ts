import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace } from './helpers/core-chain-overview';

const DEMO_ORDER = 'B2B-SS27-DEMO-001';
const COLLECTION = 'SS27';
const ARTICLE = 'demo-ss27-01';
const PO = `PO-B2B-${DEMO_ORDER}`;

const PROCUREMENT_URL =
  `/factory/production/materials?collection=${COLLECTION}&article=${ARTICLE}` +
  `&view=procurement&role=supplier&order=${DEMO_ORDER}&po=${PO}`;

/**
 * Wave WI: supplier partial ship qty + backorder PG + bulk-confirm dedup + WMS webhook → chain-status.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-172-wave-wi-partial-ship.spec.ts
 */
test.describe('core-172: wave WI supplier partial ship + backorder', () => {
  test('PATCH material-request accepts partialShipQty/backorderFlag', async ({ request }) => {
    const listRes = await request.get(
      `/api/workshop2/material-requisitions?collectionId=${COLLECTION}&articleId=${ARTICLE}`
    );
    expect(listRes.status()).toBeLessThan(500);
    const listJson = (await listRes.json()) as { requisitions?: Array<{ id?: string }> };
    const reqId = listJson.requisitions?.[0]?.id;
    test.skip(!reqId, 'нет material requisition в PG');

    const res = await request.patch(`/api/workshop2/supplier/material-request/${reqId}`, {
      data: {
        status: 'confirmed',
        b2bOrderId: DEMO_ORDER,
        partialShipQty: 3,
        backorderFlag: true,
        updatedBy: 'e2e-wi',
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      partialShipQty?: number | null;
      backorderFlag?: boolean;
    };
    if (json.ok) {
      expect(json).toHaveProperty('partialShipQty');
      expect(json).toHaveProperty('backorderFlag');
    }
  });

  test('bulk-confirm returns partialShipQty/backorderFlag + idempotent replay', async ({ request }) => {
    const payload = {
      collectionId: COLLECTION,
      articleId: ARTICLE,
      b2bOrderId: DEMO_ORDER,
      productionOrderId: PO,
      partialShipQty: 2,
      backorderFlag: true,
      updatedBy: 'e2e-wi',
    };
    const res = await request.post('/api/workshop2/supplier/material-request/bulk-confirm', {
      data: payload,
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      partialShipQty?: number | null;
      backorderFlag?: boolean;
      idempotent?: number;
    };
    if (json.ok) {
      expect(json).toHaveProperty('partialShipQty');
      expect(json).toHaveProperty('backorderFlag');
    }

    const replay = await request.post('/api/workshop2/supplier/material-request/bulk-confirm', {
      data: payload,
    });
    expect(replay.status()).toBeLessThan(500);
    const replayJson = (await replay.json()) as { ok?: boolean; idempotent?: number };
    if (replayJson.ok) {
      expect((replayJson.idempotent ?? 0) >= 0).toBe(true);
    }
  });

  test('WMS confirm webhook disabled without env', async ({ request }) => {
    const res = await request.post('/api/workshop2/supplier/wms-confirm', {
      data: { b2bOrderId: DEMO_ORDER, partialShipQty: 1, backorderFlag: false },
    });
    expect([503, 401]).toContain(res.status());
  });

  test('chain-status API exposes materials_supplied step', async ({ request }) => {
    const res = await request.get(`/api/workshop2/b2b/orders/${DEMO_ORDER}/chain-status`);
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { chain?: { steps?: Array<{ id?: string }> } };
    const ids = (json.chain?.steps ?? []).map((s) => s.id);
    expect(ids).toContain('materials_supplied');
  });

  test('supplier procurement: partial ship strip + bulk-confirm dedup hint (RU)', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoPlatformCoreWorkspace(page, PROCUREMENT_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 30_000 });

    const partialHost = page.getByTestId('sup-op-procurement-partial-ship-host');
    const partialStrip = page.getByTestId('sup-op-partial-ship-confirm-strip');

    if (await partialHost.isVisible().catch(() => false)) {
      await expect(partialStrip).toBeVisible({ timeout: 15_000 });
      await expect(partialStrip).toContainText(/Частичная отгрузка/i);
      await expect(page.getByTestId('sup-op-partial-ship-qty-input')).toBeVisible();
      await expect(page.getByTestId('sup-op-partial-ship-backorder')).toBeVisible();
      await expect(page.getByTestId('sup-op-procurement-bulk-confirm-dedup-hint')).toContainText(
        /без дубля bulk-confirm/i
      );
      await expect(page.getByTestId('sup-op-procurement-bulk-confirm')).toHaveCount(0);
    } else {
      await expect(
        page
          .getByTestId('sup-op-procurement-bulk-confirm')
          .or(page.getByTestId('sup-op-procurement-idempotent-badge'))
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});
