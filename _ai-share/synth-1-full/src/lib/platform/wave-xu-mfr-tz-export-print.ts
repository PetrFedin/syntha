/**
 * Wave XU — mfr OP dossier TZ export print route + PO TZ PDF cross-link (UN/UY polish).
 */
import {
  factoryProductionDossierContextHref,
  factoryProductionOrdersOrderContextHref,
} from '@/lib/routes';
import { ROUTES } from '@/lib/routes';

export const WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_SEGMENT = 'export-print' as const;

export const WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_TESTID = 'mfr-op-dossier-export-print-route';
export const WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID = 'mfr-op-dossier-export-print-strip';
export const WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_EXPORT_BTN_TESTID =
  'mfr-op-dossier-export-print-export-btn';
export const WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_BTN_TESTID = 'mfr-op-dossier-export-print-btn';
export const WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STATUS_TESTID = 'mfr-op-dossier-export-print-status';

export const MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_PEER_STRIP_TESTID =
  'mfr-op-dossier-attach-tz-pdf-po-peer-strip';
export const MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_LINK_TESTID = 'mfr-op-dossier-attach-tz-pdf-po-link';
export const MFR_OP_DOSSIER_ATTACH_TZ_PDF_EXPORT_PRINT_LINK_TESTID =
  'mfr-op-dossier-attach-tz-pdf-export-print-link';

export const MFR_OP_PO_TZ_PDF_PEER_STRIP_TESTID = 'mfr-op-po-tz-pdf-peer-strip';
export const MFR_OP_PO_TZ_PDF_PEER_LINK_TESTID = 'mfr-op-po-tz-pdf-peer-link';
export const MFR_OP_PO_TZ_PDF_DOWNLOAD_LINK_TESTID = 'mfr-op-po-tz-pdf-download-link';
export const MFR_OP_PO_TZ_PDF_DOSSIER_PRINT_LINK_TESTID = 'mfr-op-po-tz-pdf-dossier-print-link';

export const WAVE_XU_MFR_EXPORT_PRINT_BADGE_RU = 'Экспорт ТЗ';
export const WAVE_XU_MFR_EXPORT_DOWNLOAD_LABEL_RU = 'Скачать пакет ТЗ';
export const WAVE_XU_MFR_EXPORT_DOWNLOAD_BUSY_RU = 'Формирование…';
export const WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU = 'Печать ТЗ';
export const WAVE_XU_MFR_EXPORT_STATUS_OK_RU = 'Пакет ТЗ скачан (ZIP).';
export const WAVE_XU_MFR_EXPORT_STATUS_NETWORK_RU = 'Сеть недоступна — повторите позже.';
export const WAVE_XU_MFR_EXPORT_PRINT_ROUTE_TITLE_RU = 'Печать ТЗ · цех';
export const WAVE_XU_MFR_EXPORT_PRINT_ROUTE_BACK_RU = 'Назад к досье';
export const WAVE_XU_MFR_EXPORT_PRINT_ROUTE_HINT_RU =
  'Печать финального ТЗ (read-only) · wave XU export-print route';

export const WAVE_XU_MFR_PO_TZ_PDF_PEER_BADGE_RU = 'ТЗ PDF на PO';
export const WAVE_XU_MFR_PO_TZ_PDF_PEER_HINT_RU = 'Прикрепление бренда (wave UN/UY)';
export const WAVE_XU_MFR_PO_TZ_PDF_DOWNLOAD_LABEL_RU = 'Скачать ТЗ PDF';
export const WAVE_XU_MFR_PO_TZ_PDF_DOSSIER_PRINT_LABEL_RU = 'Печать из досье';
export const WAVE_XU_MFR_DOSSIER_PO_RECORD_LABEL_RU = 'Запись PO · ТЗ PDF';

export const WAVE_XU_MFR_PO_TZ_PDF_PEER_HASH = '#mfr-op-po-tz-pdf-peer' as const;

export function buildMfrTzPdfBundleApiHref(collectionId: string, articleId: string): string {
  return `/api/workshop2/articles/${encodeURIComponent(collectionId.trim())}/${encodeURIComponent(
    articleId.trim()
  )}/export-tz-bundle.pdf`;
}

export function buildMfrDossierExportPrintHref(
  articleId: string,
  opts?: { collectionId?: string; orderId?: string }
): string {
  const base = `/factory/production/dossier/${encodeURIComponent(articleId.trim())}/${WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_SEGMENT}`;
  const sp = new URLSearchParams({ pillar: 'order_production' });
  const cid = opts?.collectionId?.trim();
  if (cid) sp.set('collection', cid);
  const oid = opts?.orderId?.trim();
  if (oid) sp.set('order', oid);
  return `${base}?${sp.toString()}`;
}

/** Deep-link to production orders PO row · TZ PDF attachment (brand UN/UY attach-tz-pdf). */
export function buildMfrOpPoTzPdfPeerHref(
  orderId: string,
  opts?: {
    productionOrderId?: string;
    collectionId?: string;
    articleId?: string;
    factoryId?: string;
  }
): string {
  const sp = new URLSearchParams({ order: orderId.trim() });
  const po = opts?.productionOrderId?.trim();
  if (po) sp.set('po', po);
  const cid = opts?.collectionId?.trim();
  if (cid) sp.set('collection', cid);
  const article = opts?.articleId?.trim();
  if (article) sp.set('article', article);
  const factoryId = opts?.factoryId?.trim();
  if (factoryId) sp.set('factoryId', factoryId);
  sp.set('tzPdf', '1');
  return `${ROUTES.factory.productionOrders}?${sp.toString()}${WAVE_XU_MFR_PO_TZ_PDF_PEER_HASH}`;
}

export function buildMfrOpDossierAttachTzPdfPoSession(input: {
  orderId: string;
  collectionId: string;
  articleId: string;
  productionOrderId?: string;
  factoryId?: string;
}): {
  poRecordHref: string;
  exportPrintHref: string;
  tzPdfDownloadHref: string;
  dossierHref: string;
} {
  const productionOrderId = input.productionOrderId?.trim();
  return {
    poRecordHref: buildMfrOpPoTzPdfPeerHref(input.orderId, {
      productionOrderId,
      collectionId: input.collectionId,
      articleId: input.articleId,
      factoryId: input.factoryId,
    }),
    exportPrintHref: buildMfrDossierExportPrintHref(input.articleId, {
      collectionId: input.collectionId,
      orderId: input.orderId,
    }),
    tzPdfDownloadHref: buildMfrTzPdfBundleApiHref(input.collectionId, input.articleId),
    dossierHref: factoryProductionDossierContextHref(input.articleId, {
      collectionId: input.collectionId,
      orderId: input.orderId,
    }),
  };
}

export function mfrOpPoTzPdfPeerHrefCarriesPoContext(
  href: string,
  productionOrderId: string
): boolean {
  return href.includes(`po=${encodeURIComponent(productionOrderId)}`) && href.includes('tzPdf=1');
}

export function factoryProductionOrdersOrderContextHrefWithPo(
  orderId: string,
  opts?: { factoryId?: string; productionOrderId?: string }
): string {
  const base = factoryProductionOrdersOrderContextHref(orderId, { factoryId: opts?.factoryId });
  const po = opts?.productionOrderId?.trim();
  if (!po) return base;
  const url = new URL(base, 'http://local');
  url.searchParams.set('po', po);
  return `${url.pathname}${url.search}`;
}
