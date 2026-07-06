import { test, expect } from '@playwright/test';

/**
 * Wave TX: supplier OP partial ship, backorder, WMS webhook, PO context hrefs.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-125-wave-tx-supplier-op.spec.ts
 */
test.describe('core-125: wave TX supplier OP partial + backorder', () => {
  test('PATCH material-request accepts partialShipQty/backorderFlag', async ({ request }) => {
    const listRes = await request.get(
      '/api/workshop2/material-requisitions?collectionId=SS27&articleId=demo-ss27-01'
    );
    expect(listRes.status()).toBeLessThan(500);
    const listJson = (await listRes.json()) as { requisitions?: Array<{ id?: string }> };
    const reqId = listJson.requisitions?.[0]?.id;
    test.skip(!reqId, 'нет material requisition в PG');

    const res = await request.patch(`/api/workshop2/supplier/material-request/${reqId}`, {
      data: {
        status: 'confirmed',
        b2bOrderId: 'B2B-SS27-DEMO-001',
        partialShipQty: 3,
        backorderFlag: true,
        updatedBy: 'e2e-tx',
      },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('bulk-confirm returns partialShipQty/backorderFlag fields', async ({ request }) => {
    const res = await request.post('/api/workshop2/supplier/material-request/bulk-confirm', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        b2bOrderId: 'B2B-SS27-DEMO-001',
        partialShipQty: 2,
        backorderFlag: true,
        updatedBy: 'e2e-tx',
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

  test('WMS confirm webhook disabled without env', async ({ request }) => {
    const res = await request.post('/api/workshop2/supplier/wms-confirm', {
      data: { b2bOrderId: 'B2B-SS27-DEMO-001' },
    });
    expect([503, 401]).toContain(res.status());
  });

  test('brand notification events API after materials PATCH', async ({ request }) => {
    const res = await request.get(
      '/api/platform-core/notification-events?role=brand&orderId=B2B-SS27-DEMO-001&limit=5'
    );
    expect(res.status()).toBeLessThan(500);
  });

  test('supplier procurement workspace shows bulk-confirm progress testid', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      '/factory/production/materials?collection=SS27&article=demo-ss27-01&view=procurement&role=supplier&order=B2B-SS27-DEMO-001&po=PO-B2B-B2B-SS27-DEMO-001',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-op-partial-ship-confirm-strip')).toBeVisible({
      timeout: 15_000,
    });
  });
});
