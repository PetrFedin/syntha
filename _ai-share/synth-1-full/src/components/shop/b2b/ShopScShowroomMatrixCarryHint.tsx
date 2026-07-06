'use client';

import {
  SHOP_SHOWROOM_MATRIX_CARRY_PREFILL_HINT_RU,
  type ShopShowroomMatrixCarryOpts,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';

type Props = {
  articleId?: string;
  carry?: ShopShowroomMatrixCarryOpts;
};

/** Matrix entry hint when opened from shop showroom with qty/size carry (wave WA). */
export function ShopScShowroomMatrixCarryHint({ articleId, carry }: Props) {
  if (!articleId?.trim()) return null;
  const qty = carry?.carryQty ?? 0;
  if (qty <= 0) return null;

  const sizePart = carry?.carrySize?.trim() ? ` · ${carry.carrySize.trim()}` : '';

  return (
    <p
      className="border-border-subtle bg-accent-primary/5 text-text-secondary rounded-lg border px-3 py-2 text-[11px] leading-snug"
      data-testid="shop-sc-matrix-showroom-carry-hint"
    >
      {SHOP_SHOWROOM_MATRIX_CARRY_PREFILL_HINT_RU} · {articleId}
      {` · qty ${qty}${sizePart}`}
    </p>
  );
}
