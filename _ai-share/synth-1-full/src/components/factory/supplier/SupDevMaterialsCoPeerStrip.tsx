'use client';

import Link from 'next/link';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
};

/** Dev materials · forecast + replenishment spine peers (не дубль price journal). */
export function SupDevMaterialsCoPeerStrip({ collectionId, articleId, orderId }: Props) {
  const proc = buildSupplierProcurementSession({ collectionId, articleId, orderId });
  const replen = buildShopReplenishmentSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-dev-materials-co-peer-strip">
      <Link
        href={proc.forecastHref}
        data-testid="sup-dev-materials-forecast-link"
        className={hubGadget.goldenLink}
      >
        Прогноз CO
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={proc.bomHref}
        data-testid="sup-dev-materials-bom-tab-link"
        className={hubGadget.goldenLink}
      >
        BOM tab
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={replen.stockAtpHref}
        data-testid="sup-dev-materials-replenishment-atp-link"
        className={hubGadget.goldenLink}
      >
        Shop ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={proc.shopTrackingHref}
        data-testid="sup-dev-materials-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
    </div>
  );
}
