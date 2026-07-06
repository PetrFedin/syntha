'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { buildBrandPricelistSession } from '@/lib/platform-core-ports/b2b/brand-pricelist-workspace';
import { buildShopWholesaleMatrixSession } from '@/lib/platform-core-ports/b2b/shop-wholesale-matrix-workspace';
import {
  SHOP_CO_MATRIX_SECTION,
  shopCoMatrixEmbeddedTabHref,
} from '@/lib/platform-core-cabinet-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId?: string;
  articleId?: string;
  activeTab?: 'matrix' | 'inspector' | 'prepack';
  /** Явно: табы в `/shop/core?section=shop-co-matrix` (native hub). */
  embedded?: boolean;
};

/** Инспектор ↔ препак ↔ правила упаковки бренда / прайс-лист. */
export function ShopCoMatrixInspectorPrepackPeerStrip({
  collectionId,
  orderId,
  articleId,
  activeTab,
  embedded: embeddedProp,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const embedded =
    embeddedProp ??
    (searchParams.get('section') === SHOP_CO_MATRIX_SECTION &&
      (pathname === '/shop/core' || pathname.endsWith('/shop/core')));

  const session = buildShopWholesaleMatrixSession({ collectionId, orderId, articleId });
  const brandPricelist = buildBrandPricelistSession({ collectionId, orderId });
  const tabInput = { collectionId, orderId, articleId };
  const matrixHref = embedded
    ? shopCoMatrixEmbeddedTabHref('matrix', tabInput)
    : session.matrixHref;
  const inspectorHref = embedded
    ? shopCoMatrixEmbeddedTabHref('inspector', tabInput)
    : session.inspectorHref;
  const prepackHref = embedded
    ? shopCoMatrixEmbeddedTabHref('prepack', tabInput)
    : session.prepackHref;

  const linkClass = (tab: Props['activeTab']) =>
    cn(hubGadget.goldenLink, activeTab === tab && 'font-bold underline');

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-co-matrix-inspector-prepack-peer-strip">
      <Link href={matrixHref} data-testid="shop-co-matrix-tab-matrix-link" className={linkClass('matrix')}>
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={inspectorHref}
        data-testid="shop-co-matrix-tab-inspector-link"
        className={linkClass('inspector')}
      >
        Инспектор
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={prepackHref} data-testid="shop-co-matrix-tab-prepack-link" className={linkClass('prepack')}>
        Препак
      </Link>
      {!embedded ? (
        <>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandPackRulesShopPrepackHref}
        data-testid="shop-co-matrix-brand-pack-rules-link"
        className={hubGadget.goldenLink}
      >
        Правила упаковки бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandPricelist.versionsHref}
        data-testid="shop-co-matrix-brand-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист бренда
      </Link>
        </>
      ) : null}
    </div>
  );
}
