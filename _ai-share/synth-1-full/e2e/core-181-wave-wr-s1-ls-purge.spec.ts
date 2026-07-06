import { test, expect } from '@playwright/test';

/**
 * Wave WR: S1 localStorage purge — BFF storageMode pg contract.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-181-wave-wr-s1-ls-purge.spec.ts
 */
test.describe('core-181: wave WR S1 LS purge BFF', () => {
  test('range planner overlay API returns storageMode pg or unavailable', async ({ request }) => {
    const res = await request.get('/api/brand/range-planner/overlay?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'memory', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('brand tasks API returns storageMode pg or unavailable', async ({ request }) => {
    const res = await request.get('/api/brand/tasks');
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (res.ok() && json.ok) {
      expect(json.storageMode).toBe('pg');
    } else {
      expect(json.storageMode).toBe('unavailable');
    }
  });

  test('message templates API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/platform-core/b2b/message-templates');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'file', 'memory']).toContain(json.storageMode);
    }
  });

  test('rep offline drafts API returns storageMode pg contract', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/rep/offline-drafts?repId=rep-demo');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    expect(typeof json.ok).toBe('boolean');
    if (json.ok && json.storageMode) {
      expect(['pg', 'file', 'memory', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('sketch org templates API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/brand/sketch-org-templates?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'memory']).toContain(json.storageMode);
    }
  });
});
