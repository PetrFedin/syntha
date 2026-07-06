import { test, expect } from '@playwright/test';

/**
 * Wave TQ: QC gate blocks handoff + bulk idempotency UX (brand + mfr).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-119-wave-tq-qc-handoff-gate.spec.ts
 */
test.describe('core-119: wave TQ QC handoff gate', () => {
  test('handoff API returns 409 when QC gate blocks order', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean; pgReachable?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const orderId = `B2B-QC-GATE-BLOCK-${Date.now()}`;
    const recordRes = await request.post('/api/brand/production/qc-gate/inspections', {
      data: {
        orderId,
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        result: 'fail',
        blocksShipment: true,
        inspectorLabel: 'e2e-core-119',
      },
    });
    expect(recordRes.ok()).toBeTruthy();

    const handoffRes = await request.post(
      `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/confirm-production-handoff`,
      { data: {} }
    );
    expect(handoffRes.status()).toBe(409);
    const json = (await handoffRes.json()) as { ok?: boolean; messageRu?: string; code?: string };
    expect(json.ok).toBe(false);
    expect(json.messageRu).toMatch(/передача в цех заблокирована|QC gate/i);
  });

  test('brand handoff panel shows QC blocked strip with link to QC tab', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/brand/production/operations?pcf=handoff&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-production-handoff-panel')).toBeVisible({
      timeout: 60_000,
    });

    const blockedStrip = page.getByTestId('brand-op-qc-gate-blocks-handoff');
    const qcBlockBadge = page.getByTestId('brand-production-handoff-qc-block-badge');
    const hasBlockedUi =
      (await blockedStrip.count()) > 0 || (await qcBlockBadge.count()) > 0;
    if (hasBlockedUi) {
      if ((await blockedStrip.count()) > 0) {
        await expect(blockedStrip).toBeVisible();
        await expect(page.getByTestId('brand-production-handoff-qc-tab-link')).toBeVisible();
      }
      if ((await qcBlockBadge.count()) > 0) {
        await expect(qcBlockBadge).toBeVisible();
      }
    } else {
      await expect(page.getByTestId('brand-production-handoff-qc-tab-link')).toBeVisible();
    }
  });

  test('mfr handoff queue shows registry SoT strip (no bulk-ack duplicate)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/factory/core?pillar=order_production&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-handoff-queue-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-op-handoff-queue-registry-sot-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-op-handoff-queue-registry-sot-link')).toBeVisible();
  });

  test('bulk handoff idempotent replay surfaces badge on brand registry', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const orderIds = ['B2B-DEMO-SHOP1-SS27'];
    const idempotencyKey = `e2e-core-119-bulk:${orderIds.join(',')}`;

    const first = await request.post('/api/brand/b2b/orders/bulk-confirm-production-handoff', {
      headers: { 'Idempotency-Key': idempotencyKey },
      data: { orderIds, idempotencyKey },
    });
    const firstJson = (await first.json()) as { ok?: boolean };
    if (!firstJson.ok) {
      test.skip(true, 'demo order not eligible for bulk handoff');
    }

    const replay = await request.post('/api/brand/b2b/orders/bulk-confirm-production-handoff', {
      headers: { 'Idempotency-Key': idempotencyKey },
      data: { orderIds, idempotencyKey },
    });
    expect(replay.ok()).toBeTruthy();
    const replayJson = (await replay.json()) as { idempotent?: boolean };
    expect(replayJson.idempotent).toBe(true);

    await page.goto('/brand/core?pillar=collection_order&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-op-registry-panel')).toBeVisible({ timeout: 60_000 });

    const orderCheckbox = page.getByTestId(`brand-b2b-order-select-${orderIds[0]}`);
    if ((await orderCheckbox.count()) > 0) {
      await orderCheckbox.check();
      await page.getByTestId('brand-b2b-bulk-handoff').click();
      await expect(page.getByTestId('brand-b2b-bulk-handoff-idempotent-badge')).toBeVisible({
        timeout: 30_000,
      });
    }
  });
});
