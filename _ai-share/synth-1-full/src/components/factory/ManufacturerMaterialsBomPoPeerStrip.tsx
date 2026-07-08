'use client';

import Link from 'next/link';
import { factoryMaterialsProcurementHrefForDemo } from '@/lib/platform-core-hub-matrix';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  demo: PlatformCoreDemoContext;
  orderId?: string;
};

/** Mfr materials procurement — BOM×PO + WMS + handoff/tracking peers. */
export function ManufacturerMaterialsBomPoPeerStrip({ demo, orderId }: Props) {
  const oid = orderId?.trim() || demo.demoOrderId;
  const demoWithOrder = { ...demo, demoOrderId: oid };
  const procurementHref = factoryMaterialsProcurementHrefForDemo(demoWithOrder, {
    role: 'manufacturer',
  });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-op-materials-bom-po-peer-strip"
    >
      <Link
        href={procurementHref}
        data-testid="mfr-op-materials-procurement-link"
        className={hubGadget.goldenLink}
      >
        Закупка BOM×PO
      </Link>
    </div>
  );
}
