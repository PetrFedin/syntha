import { test, expect } from '@playwright/test';

/**
 * Wave SJ: mfr WIP timeline + supplier partial ship bulk-confirm.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-63-wave-sj-mfr-sup.spec.ts
 */
test.describe('core-63: wave SJ mfr timeline + sup partial ship', () => {
  test('production timeline API', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/manufacturer/production-timeline?orderId=B2B-SS27-DEMO-001'
    );
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as { timeline?: { steps?: unknown[] } };
    expect(Array.isArray(json.timeline?.steps)).toBe(true);
  });

  test('bulk-confirm accepts partial ship fields', async ({ request }) => {
    const res = await request.post('/api/workshop2/supplier/material-request/bulk-confirm', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        b2bOrderId: 'B2B-CORE63-PARTIAL',
        shippedQty: 3,
        backorder: true,
        updatedBy: 'core-63',
      },
    });
    const json = (await res.json()) as { ok?: boolean; messageRu?: string };
    expect(typeof json.messageRu).toBe('string');
    expect(typeof json.ok).toBe('boolean');
  });
});
