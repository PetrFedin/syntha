/** Parse inline qty from showroom card input (MOQ-aware). */
export function parseShopShowroomInlineQty(raw: string, minQty: number): number | null {
  const parsed = Math.floor(Number(raw));
  if (!Number.isFinite(parsed) || parsed < minQty) return null;
  return parsed;
}

export function shopShowroomInlineQtyMin(moq?: number): number {
  return Math.max(1, moq ?? 1);
}

export const SHOP_SHOWROOM_INLINE_SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;
export type ShopShowroomInlineSize = (typeof SHOP_SHOWROOM_INLINE_SIZES)[number];

export function parseShopShowroomInlineSize(raw?: string | null): ShopShowroomInlineSize {
  const normalized = raw?.trim().toUpperCase();
  if (normalized && SHOP_SHOWROOM_INLINE_SIZES.includes(normalized as ShopShowroomInlineSize)) {
    return normalized as ShopShowroomInlineSize;
  }
  return 'M';
}
