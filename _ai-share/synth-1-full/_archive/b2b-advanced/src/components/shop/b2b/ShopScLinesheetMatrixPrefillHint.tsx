'use client';

import {
  BRAND_SC_CROSS_MATRIX_PREFILL_HINT_RU,
  parseLinesheetArticleIdsParam,
} from '@/lib/b2b/brand-sc-cross-matrix';

type Props = {
  linesheetArticleIdsParam: string | null;
  carryQtyTotalParam?: string | null;
};

/** Shop matrix · hint when opened from brand linesheet cross-role prefill. */
export function ShopScLinesheetMatrixPrefillHint({
  linesheetArticleIdsParam,
  carryQtyTotalParam,
}: Props) {
  const articleIds = parseLinesheetArticleIdsParam(linesheetArticleIdsParam);
  if (articleIds.length === 0) return null;

  const carryQty = carryQtyTotalParam ? Number(carryQtyTotalParam) : 0;
  const qtyPart =
    Number.isFinite(carryQty) && carryQty > 0 ? ` · qty ${carryQty} из лайншита` : '';

  return (
    <p
      className="border-border-subtle bg-bg-surface2/60 text-text-secondary rounded-lg border px-3 py-2 text-[11px] leading-snug"
      data-testid="shop-sc-matrix-linesheet-prefill-hint"
    >
      {BRAND_SC_CROSS_MATRIX_PREFILL_HINT_RU} · {articleIds.length} SKU{qtyPart}
    </p>
  );
}
