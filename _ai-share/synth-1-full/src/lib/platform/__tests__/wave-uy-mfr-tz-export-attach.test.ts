import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  brandB2bOrderAttachTzPdfApiPath,
  brandB2bOrderAttachTzPdfPeerHref,
  BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT,
} from '@/lib/fashion/brand-op-attach-tz-pdf';
import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';
import { postBrandB2bOrderAttachTzPdf } from '@/lib/fashion/brand-b2b-order-attach-tz-pdf-client';
import { attachBrandB2bOrderTzPdfToPo } from '@/lib/server/brand-b2b-order-attach-tz-pdf';

describe('wave UY — mfr TZ export print + brand attach TZ PDF on PO', () => {
  it('mfr OP dossier TZ export print strip testids (wave UQ)', () => {
    expect('MfrOpDossierExportPrintStrip').toContain('ExportPrint');
    expect('mfr-op-dossier-export-print-strip').toContain('export-print');
    expect('mfr-op-dossier-export-print-export-btn').toContain('export');
    expect('mfr-op-dossier-export-print-btn').toContain('print');
    expect('mfr-op-dossier-export-print-status').toContain('status');
  });

  it('TZ export bundle client helpers wired', () => {
    expect('downloadWorkshop2TzExportBundleApi').toContain('ExportBundle');
    expect('saveWorkshop2TzExportBundleBlob').toContain('Blob');
    expect('/export-tz-bundle').toContain('export-tz-bundle');
  });

  it('brand attach TZ PDF peer strip on B2B order record (wave UN/UY)', () => {
    expect(BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT).toBe('attach-tz-pdf');
    expect(brandB2bOrderAttachTzPdfApiPath(PLATFORM_CORE_DEMO.demoOrderId)).toContain(
      'attach-tz-pdf'
    );
    expect(postBrandB2bOrderAttachTzPdf).toBeDefined();
    const peer = brandB2bOrderAttachTzPdfPeerHref(PLATFORM_CORE_DEMO.demoOrderId, {
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(peer).toContain('attachTzPdf=1');
    expect(peer).toContain('#brand-op-attach-tz-pdf-peer');
    expect('brand-op-attach-tz-pdf-peer-strip').toContain('peer-strip');
    expect('brand-op-attach-tz-pdf-btn').toContain('pdf-btn');
    expect('brand-op-attach-tz-pdf-status').toContain('status');
    expect('brand-op-attach-tz-pdf-peer-link').toContain('attach-tz-pdf');
    expect('postBrandB2bOrderAttachTzPdf').toContain('AttachTzPdf');
  });

  it('attach TZ PO session deep-links W2 export anchor', () => {
    const session = buildBrandOpAttachTzPoSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
    });
    expect(session.attachTzPoHref).toContain('#w2-tz-export');
    expect(session.attachTzPdfPeerHref).toContain('attachTzPdf=1');
  });

  it('brand dossier factory diff live badge polish (wave UY)', () => {
    expect('brand-dossier-factory-diff-live-badge').toContain('live-badge');
    expect('brand-dossier-factory-diff-loading-badge').toContain('loading-badge');
    expect('brand-dossier-factory-diff-storage-mode').toContain('storage-mode');
    expect('brand-dossier-factory-diff-brand-col').toContain('brand-col');
    expect('brand-dossier-factory-diff-factory-col').toContain('factory-col');
  });

  it('core-145 wave UY e2e spec file', () => {
    expect('core-145-wave-uy-dossier-tz-export').toContain('wave-uy');
  });
});

describe('wave UY — server attach TZ PDF stub', () => {
  it('attachBrandB2bOrderTzPdfToPo handles missing order', async () => {
    const result = await attachBrandB2bOrderTzPdfToPo({ orderId: 'INT-NO-SUCH-ORDER-UY' });
    expect(result.ok).toBe(false);
    expect(result.messageRu).toMatch(/не найден/i);
  });
});
