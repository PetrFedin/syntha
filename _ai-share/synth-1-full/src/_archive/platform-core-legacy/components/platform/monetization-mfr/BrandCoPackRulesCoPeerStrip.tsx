'use client';

import Link from 'next/link';
import { buildBrandPackRulesSession } from '@/lib/platform-core-ports/fashion/brand-pack-rules-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId?: string };

export function BrandCoPackRulesCoPeerStrip({ collectionId, orderId }: Props) {
  const s = buildBrandPackRulesSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-pack-rules-co-peer-strip">
      <Link
        href={s.shopMatrixHref}
        data-testid="brand-co-pack-rules-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={s.shopMatrixPrepackHref}
        data-testid="brand-co-pack-rules-prepack-link"
        className={hubGadget.goldenLink}
      >
        Prepack
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={s.shopCheckoutHref}
        data-testid="brand-co-pack-rules-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={s.sizeChartHref}
        data-testid="brand-co-pack-rules-size-chart-link"
        className={hubGadget.goldenLink}
      >
        Size chart
      </Link>
    </div>
  );
}
