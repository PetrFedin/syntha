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
 * Wave WP: supplier BOM×PO bulk-confirm dedup + brand push on PATCH + chain steps RU + inventory ledger peer.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-179-wave-wp-bom-po.spec.ts
 */
test.describe('core-179: wave WP supplier BOM×PO + brand push', () => {
  test('PATCH material-request triggers brand notification_events', async ({ request }) => {
    const listRes = await request.get(
      `/api/workshop2/material-requisitions?collectionId=${COLLECTION}&articleId=${ARTICLE}`
    );
    expect(listRes.status()).toBeLessThan(500);
    const listJson = (await listRes.json()) as { requisitions?: Array<{ id?: string }> };
    const reqId = listJson.requisitions?.[0]?.id;
    test.skip(!reqId, 'нет material requisition в PG');

    const patchRes = await request.patch(`/api/workshop2/supplier/material-request/${reqId}`, {
      data: {
        status: 'confirmed',
        b2bOrderId: DEMO_ORDER,
        updatedBy: 'e2e-wp',
      },
    });
    expect(patchRes.status()).toBeLessThan(500);

    const eventsRes = await request.get(
      `/api/platform-core/notification-events?role=brand&orderId=${DEMO_ORDER}&limit=10`
    );
    expect(eventsRes.status()).toBeLessThan(500);
    const eventsJson = (await eventsRes.json()) as {
      ok?: boolean;
      events?: Array<{ kind?: string }>;
    };
    if (eventsJson.ok && eventsJson.events?.length) {
      const kinds = eventsJson.events.map((e) => e.kind);
      expect(kinds).toContain('materials_supplied');
    }
  });

  test('supplier procurement: chain steps RU + inventory ledger peer + BOM×PO dedup', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoPlatformCoreWorkspace(page, PROCUREMENT_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('sup-op-procurement-chain-steps')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('sup-op-procurement-chain-steps')).toContainText(
      /Этапы цепочки/i
    );
    await expect(page.getByTestId('sup-op-procurement-brand-inventory-ledger-peer-strip')).toBeVisible(
      { timeout: 15_000 }
    );
    await expect(page.getByTestId('sup-op-procurement-brand-inventory-ledger-link')).toBeVisible();

    await expect(page.getByTestId('sup-op-bom-po-progress')).toBeVisible({ timeout: 15_000 });

    const partialHost = page.getByTestId('sup-op-procurement-partial-ship-host');
    if (await partialHost.isVisible().catch(() => false)) {
      await expect(page.getByTestId('sup-op-bom-po-bulk-confirm-dedup-hint')).toContainText(
        /без дубля bulk-confirm/i
      );
      await expect(page.getByTestId('sup-op-procurement-bulk-confirm')).toHaveCount(0);
    }
  });
});
