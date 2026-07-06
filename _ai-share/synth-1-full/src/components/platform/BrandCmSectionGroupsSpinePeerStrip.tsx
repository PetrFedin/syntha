'use client';

import Link from 'next/link';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Brand section-groups · CO spine peers for contextual threads. */
export function BrandCmSectionGroupsSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildBrandOrderCommsSession({ collectionId, orderId });
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-cm-section-groups-spine-peer-strip">
      <Link href={session.registryHref} data-testid="brand-cm-section-groups-registry-link" className={hubGadget.goldenLink}>
        Реестр
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.handoffHref} data-testid="brand-cm-section-groups-handoff-link" className={hubGadget.goldenLink}>
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.shopTrackingHref} data-testid="brand-cm-section-groups-shop-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.calendarHref} data-testid="brand-cm-section-groups-calendar-link" className={hubGadget.goldenLink}>
        Calendar
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.factoryQueueHref} data-testid="brand-cm-section-groups-factory-queue-link" className={hubGadget.goldenLink}>
        Очередь цеха
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={pricelistHref} data-testid="brand-cm-section-groups-pricelist-link" className={hubGadget.goldenLink}>
        Прайс-лист
      </Link>
    </div>
  );
}
