'use client';

import Link from 'next/link';
import { buildBrandProductionHandoffSession } from '@/lib/platform-core-ports/brand-production-handoff';
import { brandB2bOrdersProductionRegistryHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  collectionId: string;
};

/** Brand OP cabinet compact · handoff + QC + tracking + inventory peers. */
export function BrandOpCabinetSpinePeerStrip({ orderId, collectionId }: Props) {
  const session = buildBrandProductionHandoffSession({ orderId, collectionId });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-op-cabinet-spine-peer-strip"
    >
      <Link href={session.handoffTabHref} data-testid="brand-op-cabinet-handoff-link" className={hubGadget.goldenLink}>
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.qcGateTabHref} data-testid="brand-op-cabinet-qc-gate-link" className={hubGadget.goldenLink}>
        Гейт КК
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.shopTrackingHref} data-testid="brand-op-cabinet-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.manufacturerOrderCommsHref} data-testid="brand-op-cabinet-mfr-comms-link" className={hubGadget.goldenLink}>
        Связь с цехом
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandB2bOrdersProductionRegistryHref(orderId)}
        data-testid="brand-op-cabinet-registry-link"
        className={hubGadget.goldenLink}
      >
        Реестр производства
      </Link>
    </div>
  );
}
