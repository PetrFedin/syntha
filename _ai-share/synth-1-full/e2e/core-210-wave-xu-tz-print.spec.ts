import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import {
  MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_PEER_STRIP_TESTID,
  MFR_OP_PO_TZ_PDF_PEER_STRIP_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID,
  WAVE_XU_MFR_EXPORT_DOWNLOAD_LABEL_RU,
  WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU,
  buildMfrDossierExportPrintHref,
} from '../src/lib/platform/wave-xu-mfr-tz-export-print';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XU: mfr dossier TZ export-print route + PO TZ PDF cross-link (UN/UY polish).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-210-wave-xu-tz-print.spec.ts
 */
test.describe('core-210: wave XU mfr TZ export print + PO TZ PDF', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
  const PO = PLATFORM_CORE_DEMO.productionOrderId;

  test('GET export-print route renders TZ document', async ({ page }) => {
    const printPath = buildMfrDossierExportPrintHref(ARTICLE, {
      collectionId: COLLECTION,
      orderId: DEMO_ORDER,
    });
    const res = await page.goto(printPath, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_TESTID)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-dossier-export-print-document')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('GET export-tz-bundle responds for demo article', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/articles/${encodeURIComponent(COLLECTION)}/${encodeURIComponent(ARTICLE)}/export-tz-bundle`
    );
    expect(res.status()).toBeLessThan(500);
  });

  test('POST attach-tz-pdf on B2B order PO record (UN/UY)', async ({ request }) => {
    const res = await request.post(
      `/api/brand/b2b/orders/${encodeURIComponent(DEMO_ORDER)}/attach-tz-pdf`,
      {
        data: {
          collectionId: COLLECTION,
          articleId: ARTICLE,
          productionOrderId: PO,
        },
      }
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; tzPdfHref?: string };
    if (json.ok) {
      expect(json.tzPdfHref).toContain('export-tz-bundle.pdf');
    }
  });

  test('UI: mfr OP dossier export strip RU + deduped print CTA', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(ARTICLE)}?collection=${COLLECTION}&pillar=order_production&order=${encodeURIComponent(DEMO_ORDER)}`,
      GOTO
    );
    const strip = page.getByTestId(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID);
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await expect(strip).toContainText(WAVE_XU_MFR_EXPORT_PRINT_BADGE_RU);
    await expect(page.getByTestId('mfr-op-dossier-export-print-export-btn')).toContainText(
      WAVE_XU_MFR_EXPORT_DOWNLOAD_LABEL_RU
    );
    await expect(page.getByTestId('mfr-op-dossier-export-print-btn')).toContainText(
      WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU
    );
    await expect(page.getByTestId('mfr-op-dossier-print-btn')).toHaveCount(0);
  });

  test('UI: dossier PO TZ PDF peer + production orders cross-link', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(ARTICLE)}?collection=${COLLECTION}&pillar=order_production&order=${encodeURIComponent(DEMO_ORDER)}`,
      GOTO
    );
    await expect(page.getByTestId(MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_PEER_STRIP_TESTID)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-dossier-attach-tz-pdf-po-link')).toBeVisible({
      timeout: 15_000,
    });

    await page.goto(
      `/factory/production/orders?order=${encodeURIComponent(DEMO_ORDER)}&po=${encodeURIComponent(PO)}&tzPdf=1#mfr-op-po-tz-pdf-peer`,
      GOTO
    );
    await expect(page.getByTestId(MFR_OP_PO_TZ_PDF_PEER_STRIP_TESTID)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-po-tz-pdf-download-link')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('mfr-op-po-tz-pdf-dossier-print-link')).toBeVisible({
      timeout: 15_000,
    });
  });
});
