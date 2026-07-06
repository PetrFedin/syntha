import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UY: mfr dossier TZ export/print + brand attach TZ PDF on PO + live diff panel.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-145-wave-uy-dossier-tz-export.spec.ts
 */
test.describe('core-145: wave UY dossier TZ export + attach', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;

  test('POST attach-tz-pdf on B2B order PO record', async ({ request }) => {
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

  test('GET export-tz-bundle responds for demo article', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/articles/${encodeURIComponent(COLLECTION)}/${encodeURIComponent(ARTICLE)}/export-tz-bundle`
    );
    expect(res.status()).toBeLessThan(500);
  });

  test('UI: mfr OP dossier TZ export + print strip', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(ARTICLE)}?collection=${COLLECTION}&pillar=order_production&order=${encodeURIComponent(DEMO_ORDER)}`,
      GOTO
    );
    await expect(page.getByTestId('mfr-op-dossier-export-print-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-dossier-export-print-export-btn')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-op-dossier-export-print-btn')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('UI: brand W2 live diff panel + attach TZ PDF peer on order', async ({ page }) => {
    await page.goto(
      `/brand/production/workshop2/c/${COLLECTION}/a/${ARTICLE}?w2sec=general`,
      GOTO
    );
    await expect(page.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId('brand-dossier-factory-diff-live-badge')
        .or(page.getByTestId('brand-dossier-factory-diff-loading-badge'))
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('brand-op-attach-tz-pdf-peer-link')).toBeVisible({
      timeout: 15_000,
    });

    await page.goto(
      `/brand/b2b-orders/${encodeURIComponent(DEMO_ORDER)}?pillar=order_production&attachTzPdf=1#brand-op-attach-tz-pdf-peer`,
      GOTO
    );
    await expect(page.getByTestId('brand-op-attach-tz-pdf-peer-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-op-attach-tz-pdf-btn')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('brand-op-attach-tz-pdf-peer-link')).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByTestId('brand-op-attach-tz-pdf-status').or(page.getByTestId('brand-op-attach-tz-pdf-download-link'))
    ).toBeVisible({ timeout: 30_000 });
  });
});
