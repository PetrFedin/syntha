import { expect, test } from '@playwright/test';

/**
 * B2B size-run API: invalid input must be rejected before data/curve lookup.
 * Requires dev/e2e checkout auth configuration (production JWT gate remains active).
 */
test.describe('B2B size-run quantity integrity', () => {
  const route = '/api/shop/b2b/matrix/size-run-validate';
  const common = { collectionId: 'SS27', articleId: 'demo-ss27-01' };

  test('GET rejects fractional query quantities instead of rounding', async ({ request }) => {
    const q = new URLSearchParams({ ...common, size_M: '2.5' });
    const response = await request.get(`${route}?${q.toString()}`);
    expect(response.status()).toBe(400);
    const body = (await response.json()) as { ok: boolean; messageRu?: string };
    expect(body.ok).toBe(false);
    expect(body.messageRu).toContain('целым');
  });

  test('GET rejects malformed JSON and repeated size parameters', async ({ request }) => {
    const malformed = new URLSearchParams({ ...common, qtyBySize: '{broken' });
    expect((await request.get(`${route}?${malformed}`)).status()).toBe(400);

    const duplicated = new URLSearchParams(common);
    duplicated.append('size_M', '3');
    duplicated.append('size_M', '6');
    expect((await request.get(`${route}?${duplicated}`)).status()).toBe(400);
  });

  test('POST rejects fractional and negative matrix quantities', async ({ request }) => {
    for (const qty of [2.5, -1]) {
      const res = await request.post(route, {
        data: { ...common, qtyBySize: { M: qty } },
      });
      expect(res.status()).toBe(400);
      const body = (await res.json()) as { ok: boolean; messageRu?: string };
      expect(body.ok).toBe(false);
    }
  });

  test('POST batch rejects malformed nested qty and duplicate articles', async ({ request }) => {
    const invalidBatch = await request.post(route, {
      data: {
        collectionId: 'SS27',
        articles: [{ articleId: 'demo-ss27-01', qtyBySize: { M: 1.5 } }],
      },
    });
    expect(invalidBatch.status()).toBe(400);
    const duplicateBatch = await request.post(route, {
      data: {
        collectionId: 'SS27',
        articles: [
          { articleId: 'demo-ss27-01', qtyBySize: { M: 6 } },
          { articleId: 'demo-ss27-01', qtyBySize: { L: 6 } },
        ],
      },
    });
    expect(duplicateBatch.status()).toBe(400);
  });

  test('POST unknown sessionId fails closed instead of passing an empty cart', async ({
    request,
  }) => {
    const response = await request.post(route, {
      data: { collectionId: 'SS27', sessionId: 'missing-integrity-session' },
    });
    expect(response.status()).toBe(404);
    const body = (await response.json()) as { ok: boolean; messageRu?: string };
    expect(body.ok).toBe(false);
    expect(body.messageRu).toMatch(/не найдена/i);
  });
});
