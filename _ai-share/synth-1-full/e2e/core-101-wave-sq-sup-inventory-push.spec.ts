import { test, expect } from '@playwright/test';

/**
 * Wave SQ: supplier PATCH → inventory reserve + brand push.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-101-wave-sq-sup-inventory-push.spec.ts
 */
test.describe('core-101: wave SQ sup inventory + push', () => {
  test('B2B inventory-reserve PATCH API', async ({ request }) => {
    const res = await request.patch(
      '/api/workshop2/b2b/orders/B2B-SS27-DEMO-001/inventory-reserve',
      { data: { source: 'supplier_materials' } }
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; messageRu?: string };
    if (json.ok !== undefined) expect(typeof json.messageRu).toBe('string');
  });

  test('brand notification events after materials', async ({ request }) => {
    const res = await request.get(
      '/api/platform-core/notification-events?role=brand&orderId=B2B-SS27-DEMO-001&limit=3'
    );
    expect(res.status()).toBeLessThan(500);
  });

  test('supplier bulk-confirm material API', async ({ request }) => {
    const res = await request.post('/api/workshop2/supplier/material-request/bulk-confirm', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        b2bOrderId: 'B2B-SS27-DEMO-001',
        updatedBy: 'e2e-sq',
      },
    });
    expect(res.status()).toBeLessThan(500);
  });
});
