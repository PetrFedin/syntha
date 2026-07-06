import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import { gotoPlatformCoreWorkspace } from './helpers/core-chain-overview';

const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
const PO = PLATFORM_CORE_DEMO.productionOrderId;

const PROCUREMENT_URL =
  `/factory/production/materials?collection=${COLLECTION}&article=${ARTICLE}` +
  `&view=procurement&role=supplier&order=${DEMO_ORDER}&po=${PO}`;

/**
 * Wave YJ: supplier OP procurement honest chain strip — reserve/partial/bulk/WMS webhook + PO on comms tail hrefs.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-225-wave-yj-sup-op.spec.ts
 */
test.describe('core-225: wave YJ supplier OP procurement chain 7.5', () => {
  test('honest chain strip RU includes reserve, partial/bulk, webhook steps', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoPlatformCoreWorkspace(page, PROCUREMENT_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 30_000 });

    const chain = page.getByTestId('sup-op-procurement-chain-steps');
    await expect(chain).toBeVisible({ timeout: 15_000 });
    await expect(chain).toHaveAttribute('data-procurement-honest-chain', '1');
    await expect(chain).toContainText(/Этапы цепочки/i);
    await expect(chain).toContainText(/Резерв WMS/i);
    await expect(page.getByTestId('platform-core-chain-step-wms_reserve')).toBeVisible();
    await expect(
      page.getByTestId('platform-core-chain-step-partial_ship').or(
        page.getByTestId('platform-core-chain-step-bulk_confirm')
      )
    ).toBeVisible();
  });

  test('comms tail hrefs on procurement workspace carry po= query', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await gotoPlatformCoreWorkspace(page, PROCUREMENT_URL);

    await expect(page.getByTestId('sup-op-procurement-panel')).toBeVisible({ timeout: 30_000 });

    const trackingLink = page.getByTestId('sup-op-procurement-tracking-link');
    await expect(trackingLink).toBeVisible({ timeout: 15_000 });
    const trackingHref = await trackingLink.getAttribute('href');
    expect(trackingHref).toContain(`po=${encodeURIComponent(PO)}`);

    const peerTracking = page.getByTestId('sup-op-chain-peer-tracking-link');
    await expect(peerTracking).toBeVisible({ timeout: 15_000 });
    const peerTrackingHref = await peerTracking.getAttribute('href');
    expect(peerTrackingHref).toContain('po=');

    const peerChat = page.getByTestId('sup-op-chain-peer-brand-chat-link');
    await expect(peerChat).toBeVisible({ timeout: 15_000 });
    const peerChatHref = await peerChat.getAttribute('href');
    expect(peerChatHref).toContain('po=');
  });

  test('WMS confirm webhook API responds (env-gated stub)', async ({ request }) => {
    const res = await request.post('/api/workshop2/supplier/wms-confirm', {
      data: {
        b2bOrderId: DEMO_ORDER,
        productionOrderId: PO,
        collectionId: COLLECTION,
        articleId: ARTICLE,
        partialShipQty: 1,
      },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('bulk-confirm API contract', async ({ request }) => {
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
        updatedBy: 'e2e-yj',
      },
    });
    expect(patchRes.status()).toBeLessThan(500);
  });
});
