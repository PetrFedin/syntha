'use client';

import Link from 'next/link';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { buildShopInventoryOpsSession } from '@/lib/platform-core-ports/b2b/shop-inventory-ops';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId?: string };

export function BrandOpInventoryCoPeerStrip({ collectionId, orderId }: Props) {
  const inv = buildShopInventoryOpsSession({ collectionId, orderId });
  const comms = buildBrandOrderCommsSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-op-inventory-co-peer-strip">
      <Link href={comms.handoffHref} data-testid="brand-op-inventory-handoff-link" className={hubGadget.goldenLink}>
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={comms.shopTrackingHref} data-testid="brand-op-inventory-shop-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={inv.replenishmentAtpHref} data-testid="brand-op-inventory-replenishment-link" className={hubGadget.goldenLink}>
        Shop ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={comms.registryHref} data-testid="brand-op-inventory-registry-link" className={hubGadget.goldenLink}>
        Реестр
      </Link>
    </div>
  );
}
