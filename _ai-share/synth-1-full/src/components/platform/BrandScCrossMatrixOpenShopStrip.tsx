'use client';

import Link from 'next/link';
import {
  BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU,
  BRAND_SC_CROSS_MATRIX_PREFILL_HINT_RU,
  brandScCrossMatrixOpenShopHref,
  brandScCrossMatrixMiniMatrixHintRu,
} from '@/lib/platform-core-ports/b2b/brand-sc-cross-matrix';
import {
  WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID,
  WAVE_YR_BRAND_SC_OPEN_SHOP_PREFILL_HINT_TESTID,
  WAVE_YR_BRAND_SC_OPEN_SHOP_STRIP_TESTID,
  brandScCrossMatrixOneClickAriaLabelRu,
} from '@/lib/platform-core-ports/platform/wave-yr-brand-sc-matrix-cta';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleIds: readonly string[];
  carryQtyTotal?: number;
  buyerId?: string;
  variant?: 'strip' | 'btn-only';
};

/** One-click cross-role: brand linesheet SKUs → shop matrix prefill. */
export function BrandScCrossMatrixOpenShopStrip({
  collectionId,
  articleIds,
  carryQtyTotal,
  buyerId,
  variant = 'strip',
}: Props) {
  const href = brandScCrossMatrixOpenShopHref(collectionId, articleIds, {
    buyerId,
    carryQtyTotal,
  });
  const ids = articleIds.filter((id) => id.trim());
  const hint =
    ids.length > 0
      ? brandScCrossMatrixMiniMatrixHintRu(ids.length, carryQtyTotal)
      : BRAND_SC_CROSS_MATRIX_PREFILL_HINT_RU;
  const ariaLabel = brandScCrossMatrixOneClickAriaLabelRu(ids.length, 'open-shop');

  if (variant === 'btn-only') {
    return (
      <Link
        href={href}
        className={hubGadget.goldenLink}
        data-testid={WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU}
      </Link>
    );
  }

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_YR_BRAND_SC_OPEN_SHOP_STRIP_TESTID}>
      <Link
        href={href}
        className={hubGadget.goldenLink}
        data-testid={WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <span
        className="text-text-muted text-[10px] leading-snug"
        data-testid={WAVE_YR_BRAND_SC_OPEN_SHOP_PREFILL_HINT_TESTID}
      >
        {hint}
      </span>
    </div>
  );
}
