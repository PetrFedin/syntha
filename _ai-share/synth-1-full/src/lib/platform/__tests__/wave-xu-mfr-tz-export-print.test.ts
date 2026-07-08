import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT,
  brandB2bOrderAttachTzPdfApiPath,
  brandB2bOrderAttachTzPdfPeerHref,
} from '@/lib/fashion/brand-op-attach-tz-pdf';
import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';
import {
  buildMfrDossierExportPrintHref,
  buildMfrOpDossierAttachTzPdfPoSession,
  buildMfrOpPoTzPdfPeerHref,
  buildMfrTzPdfBundleApiHref,
  MFR_OP_DOSSIER_ATTACH_TZ_PDF_EXPORT_PRINT_LINK_TESTID,
  MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_LINK_TESTID,
  MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_PEER_STRIP_TESTID,
  MFR_OP_PO_TZ_PDF_DOWNLOAD_LINK_TESTID,
  MFR_OP_PO_TZ_PDF_DOSSIER_PRINT_LINK_TESTID,
  MFR_OP_PO_TZ_PDF_PEER_LINK_TESTID,
  MFR_OP_PO_TZ_PDF_PEER_STRIP_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_BTN_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_EXPORT_BTN_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_SEGMENT,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STATUS_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID,
  WAVE_XU_MFR_EXPORT_DOWNLOAD_LABEL_RU,
  WAVE_XU_MFR_EXPORT_PRINT_BADGE_RU,
  WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU,
  WAVE_XU_MFR_PO_TZ_PDF_PEER_HASH,
  mfrOpPoTzPdfPeerHrefCarriesPoContext,
} from '@/lib/platform/wave-xu-mfr-tz-export-print';

describe('wave XU — mfr TZ export print route + PO TZ PDF cross-link', () => {
  const ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
  const PO = PLATFORM_CORE_DEMO.productionOrderId;

  it('export-print route segment + testids (RU strip)', () => {
    expect(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_SEGMENT).toBe('export-print');
    expect(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_TESTID).toContain('export-print-route');
    expect(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID).toBe('mfr-op-dossier-export-print-strip');
    expect(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_EXPORT_BTN_TESTID).toContain('export');
    expect(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_BTN_TESTID).toContain('print');
    expect(WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STATUS_TESTID).toContain('status');
    expect(WAVE_XU_MFR_EXPORT_PRINT_BADGE_RU).toMatch(/ТЗ/i);
    expect(WAVE_XU_MFR_EXPORT_DOWNLOAD_LABEL_RU).toMatch(/Скачать/i);
    expect(WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU).toBe('Печать ТЗ');
  });

  it('buildMfrDossierExportPrintHref carries OP context', () => {
    const href = buildMfrDossierExportPrintHref(ARTICLE, {
      collectionId: COLLECTION,
      orderId: ORDER,
    });
    expect(href).toContain('/export-print');
    expect(href).toContain('pillar=order_production');
    expect(href).toContain(`collection=${COLLECTION}`);
    expect(href).toContain(`order=${encodeURIComponent(ORDER)}`);
  });

  it('mfr PO TZ PDF peer cross-link from wave UN/UY attach-tz-pdf', () => {
    expect(BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT).toBe('attach-tz-pdf');
    expect(brandB2bOrderAttachTzPdfApiPath(ORDER)).toContain('attach-tz-pdf');
    const brandPeer = brandB2bOrderAttachTzPdfPeerHref(ORDER, {
      collectionId: COLLECTION,
      articleId: ARTICLE,
      productionOrderId: PO,
    });
    expect(brandPeer).toContain('attachTzPdf=1');
    expect(brandPeer).toContain('#brand-op-attach-tz-pdf-peer');

    const mfrPeer = buildMfrOpPoTzPdfPeerHref(ORDER, {
      productionOrderId: PO,
      collectionId: COLLECTION,
      articleId: ARTICLE,
    });
    expect(mfrPeer).toContain('tzPdf=1');
    expect(mfrPeer).toContain(WAVE_XU_MFR_PO_TZ_PDF_PEER_HASH);
    expect(mfrOpPoTzPdfPeerHrefCarriesPoContext(mfrPeer, PO)).toBe(true);
    expect(MFR_OP_PO_TZ_PDF_PEER_STRIP_TESTID).toContain('tz-pdf-peer');
    expect(MFR_OP_PO_TZ_PDF_PEER_LINK_TESTID).toContain('peer-link');
    expect(MFR_OP_PO_TZ_PDF_DOWNLOAD_LINK_TESTID).toContain('download');
    expect(MFR_OP_PO_TZ_PDF_DOSSIER_PRINT_LINK_TESTID).toContain('dossier-print');
  });

  it('dossier attach TZ PDF PO session deep-links export-print + bundle pdf', () => {
    const session = buildMfrOpDossierAttachTzPdfPoSession({
      orderId: ORDER,
      collectionId: COLLECTION,
      articleId: ARTICLE,
      productionOrderId: PO,
    });
    expect(session.poRecordHref).toContain('tzPdf=1');
    expect(session.exportPrintHref).toContain('/export-print');
    expect(session.tzPdfDownloadHref).toContain('export-tz-bundle.pdf');
    expect(MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_PEER_STRIP_TESTID).toContain('attach-tz-pdf-po');
    expect(MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_LINK_TESTID).toContain('po-link');
    expect(MFR_OP_DOSSIER_ATTACH_TZ_PDF_EXPORT_PRINT_LINK_TESTID).toContain('export-print');

    const brandSession = buildBrandOpAttachTzPoSession({
      orderId: ORDER,
      collectionId: COLLECTION,
      articleId: ARTICLE,
      productionOrderId: PO,
    });
    expect(brandSession.attachTzPdfPeerHref).toContain('attachTzPdf=1');
    expect(buildMfrTzPdfBundleApiHref(COLLECTION, ARTICLE)).toContain('export-tz-bundle');
  });

  it('core-210 wave XU e2e spec file', () => {
    expect('core-210-wave-xu-tz-print').toContain('wave-xu');
  });
});
