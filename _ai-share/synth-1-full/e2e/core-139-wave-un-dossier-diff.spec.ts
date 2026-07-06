import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

/**
 * Wave UN: live dossier factory diff + attach TZ PDF on B2B order PO record.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-139-wave-un-dossier-diff.spec.ts
 */
test.describe('core-139: wave UN dossier diff + TZ PDF attach', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;

  test('GET dossier-factory-diff returns rows', async ({ request }) => {
    const res = await request.get(
      `/api/brand/workshop2/dossier-factory-diff?collectionId=${encodeURIComponent(COLLECTION)}&articleId=${encodeURIComponent(ARTICLE)}`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      live?: boolean;
      summaryRu?: string;
      rows?: unknown[];
      storageMode?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.summaryRu).toBe('string');
    expect(Array.isArray(json.rows)).toBe(true);
    if (json.storageMode) expect(['pg', 'file', 'stub']).toContain(json.storageMode);
  });

  test('POST attach-tz-pdf stub on B2B order', async ({ request }) => {
    const res = await request.post(
      `/api/brand/b2b/orders/${encodeURIComponent(DEMO_ORDER)}/attach-tz-pdf`,
      {
        data: {
          collectionId: COLLECTION,
          articleId: ARTICLE,
          productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
        },
      }
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; messageRu?: string; tzPdfHref?: string };
    expect(typeof json.messageRu).toBe('string');
    if (json.ok) {
      expect(json.tzPdfHref).toContain('export-tz-bundle.pdf');
    }
  });

  test('W2 article shows live diff panel + attach TZ PO/PDF peer links', async ({ page }) => {
    await page.goto(
      `/brand/production/workshop2/c/${COLLECTION}/a/${ARTICLE}?w2sec=general`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-op-attach-tz-po-link')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('brand-op-attach-tz-pdf-peer-link')).toBeVisible({
      timeout: 15_000,
    });
  });
});
