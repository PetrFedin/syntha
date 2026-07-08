'use client';

import Link from 'next/link';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import {
  factorySupplierCoreOrderProductionCabinetHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  demo: PlatformCoreDemoContext;
  orderId: string;
};

/** Single golden owner for supplier OP hub — procurement · handoff · tracking · comms · dev. */
export function SupplierOpCabinetSpineNavStrip({ demo, orderId }: Props) {
  const demoWithOrder = { ...demo, demoOrderId: orderId };
  const cabinetHref = factorySupplierCoreOrderProductionCabinetHref(demo.collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-op-cabinet-spine-nav-strip">
      <span className={hubGadget.muted}>Столп 4 SoT</span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={factoryMaterialsProcurementHrefForDemo(demoWithOrder, { role: 'supplier' })}
        data-testid="sup-op-spine-procurement-link"
        className={hubGadget.goldenLink}
      >
        Закупка
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={factoryHandoffQueueHrefForDemo(demoWithOrder)}
        data-testid="sup-op-spine-handoff-link"
        className={hubGadget.goldenLink}
      >
        Очередь
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopB2bTrackingOrderHref(orderId)}
        data-testid="sup-op-spine-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={factorySupplierMessagesB2bOrderContextHref(orderId)}
        data-testid="sup-op-spine-comms-link"
        className={hubGadget.goldenLink}
      >
        Связь
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={factoryMaterialsHrefForDemo(demoWithOrder)}
        data-testid="sup-op-spine-dev-materials-link"
        className={hubGadget.goldenLink}
      >
        BOM разработки
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={cabinetHref}
        data-testid="sup-op-spine-cabinet-link"
        className={hubGadget.goldenLink}
      >
        Кабинет
      </Link>
    </div>
  );
}
