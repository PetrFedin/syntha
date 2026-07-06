import { test, expect } from '@playwright/test';

/**
 * Wave TE/TF/TH batch API smoke.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-114-wave-te-tf-th-batch.spec.ts
 */
test.describe('core-114: wave TE TF TH batch', () => {
  test('rep commissions GET', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/commissions?repId=rep-demo');
    expect(res.status()).toBeLessThan(500);
  });

  test('linesheet syndicate POST', async ({ request }) => {
    const res = await request.post('/api/brand/linesheets/syndicate', {
      data: { collectionId: 'SS27', shopBuyerId: 'shop1' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('checkout payment intent probe', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/checkout/payment-intent?orderId=B2B-SS27-DEMO-001');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { status?: string; messageRu?: string };
    if (json.messageRu) expect(typeof json.messageRu).toBe('string');
  });
});
