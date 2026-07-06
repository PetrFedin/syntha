import { brandB2bOrderHref } from '@/lib/routes';

export const BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT = 'attach-tz-pdf' as const;

/** POST stub path: `/api/brand/b2b/orders/[id]/attach-tz-pdf` */
export function brandB2bOrderAttachTzPdfApiPath(orderId: string): string {
  return `/api/brand/b2b/orders/${encodeURIComponent(orderId.trim())}/${BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT}`;
}

/** Peer link on B2B order record · TZ PDF attachment strip (Wave UN). */
export function brandB2bOrderAttachTzPdfPeerHref(
  orderId: string,
  opts?: { collectionId?: string; articleId?: string; productionOrderId?: string }
): string {
  const sp = new URLSearchParams({ pillar: 'order_production', attachTzPdf: '1' });
  if (opts?.collectionId?.trim()) sp.set('collection', opts.collectionId.trim());
  if (opts?.articleId?.trim()) sp.set('article', opts.articleId.trim());
  if (opts?.productionOrderId?.trim()) sp.set('po', opts.productionOrderId.trim());
  return `${brandB2bOrderHref(orderId)}?${sp.toString()}#brand-op-attach-tz-pdf-peer`;
}

export type BrandOpAttachTzPdfResult = {
  ok: boolean;
  orderId: string;
  productionOrderId?: string;
  tzPdfHref?: string;
  attachedAt?: string;
  messageRu?: string;
  storageMode?: 'pg' | 'file';
};
