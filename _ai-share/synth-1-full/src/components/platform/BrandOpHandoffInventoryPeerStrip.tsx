'use client';

import Link from 'next/link';
import { buildBrandInventoryOpsSession } from '@/lib/platform-core-ports/b2b/brand-inventory-ops';
import { buildBrandProductionHandoffSession } from '@/lib/platform-core-ports/brand-production-handoff';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
  collectionId: string;
  factoryId?: string;
};

/** Вкладка передачи · inventory ledger + order comms downstream. */
export function BrandOpHandoffInventoryPeerStrip({ orderId, collectionId, factoryId }: Props) {
  const handoff = buildBrandProductionHandoffSession({ orderId, collectionId, factoryId });
  const inventory = buildBrandInventoryOpsSession({ orderId, collectionId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-op-handoff-inventory-peer-strip">
      <Link
        href={inventory.overviewHref}
        data-testid="brand-op-handoff-inventory-overview-link"
        className={hubGadget.goldenLink}
      >
        Склад
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={handoff.brandOrderCommsChatHref}
        data-testid="brand-op-handoff-order-comms-link"
        className={hubGadget.goldenLink}
      >
        Чат по заказу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={handoff.shopReplenishmentAtpHref}
        data-testid="brand-op-handoff-replenishment-link"
        className={hubGadget.goldenLink}
      >
        Пополнение
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={handoff.qcGateTabHref} data-testid="brand-op-handoff-qc-gate-link" className={hubGadget.goldenLink}>
        Гейт КК
      </Link>
    </div>
  );
}
