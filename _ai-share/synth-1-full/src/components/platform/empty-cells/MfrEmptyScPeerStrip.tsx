'use client';

import Link from 'next/link';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { brandLinesheetsHrefForDemo } from '@/lib/platform-core-hub-matrix';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { manufacturerHandoffFeatureHref } from '@/lib/platform-core-ports/manufacturer-handoff';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  demo: PlatformCoreDemoContext;
};

/** Manufacturer empty SC · shop monetization + brand linesheet + sample queue. */
export function MfrEmptyScPeerStrip({ demo }: Props) {
  const { collectionId, factoryId } = demo;
  const shop = buildShopShowroomBuySession({ collectionId });
  const linesheetHref = brandLinesheetsHrefForDemo(demo);
  const sampleQueueHref = manufacturerHandoffFeatureHref('sample-queue', {
    factoryId,
    collectionId,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="mfr-empty-sc-peer-strip">
      <Link href={shop.showroomHref} data-testid="mfr-empty-sc-shop-showroom-link" className={hubGadget.goldenLink}>
        Shop showroom
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={shop.matrixHref} data-testid="mfr-empty-sc-shop-matrix-link" className={hubGadget.goldenLink}>
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={linesheetHref} data-testid="mfr-empty-sc-brand-linesheet-link" className={hubGadget.goldenLink}>
        Brand linesheet
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={sampleQueueHref} data-testid="mfr-empty-sc-sample-queue-link" className={hubGadget.goldenLink}>
        Очередь образцов
      </Link>
    </div>
  );
}
