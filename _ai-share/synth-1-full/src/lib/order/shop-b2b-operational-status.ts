/** Wave TS · shop-side operational status mirror (PG journal, amend outcomes). */

export const SHOP_B2B_OPERATIONAL_STATUS_API_SEGMENT = 'operational-status';

export const SHOP_B2B_OPERATIONAL_MIRROR_STATUSES = [
  'amendment_pending',
  'amendment_approved',
  'amendment_rejected',
] as const;

export type ShopB2bOperationalMirrorStatus = (typeof SHOP_B2B_OPERATIONAL_MIRROR_STATUSES)[number];

export type ShopB2bOperationalStatusEntry = {
  orderId: string;
  status: string;
  source: string;
  amendmentId?: string;
  updatedAt: string;
};

export function shopB2bOperationalStatusApiPath(orderId: string): string {
  return `/api/shop/b2b/orders/${encodeURIComponent(orderId.trim())}/${SHOP_B2B_OPERATIONAL_STATUS_API_SEGMENT}`;
}

export function isShopB2bOperationalMirrorStatus(v: string): v is ShopB2bOperationalMirrorStatus {
  return (SHOP_B2B_OPERATIONAL_MIRROR_STATUSES as readonly string[]).includes(v);
}

export function shopB2bOperationalMirrorStatusFromAmendment(
  amendmentStatus: 'pending' | 'approved' | 'rejected'
): ShopB2bOperationalMirrorStatus {
  if (amendmentStatus === 'approved') return 'amendment_approved';
  if (amendmentStatus === 'rejected') return 'amendment_rejected';
  return 'amendment_pending';
}
