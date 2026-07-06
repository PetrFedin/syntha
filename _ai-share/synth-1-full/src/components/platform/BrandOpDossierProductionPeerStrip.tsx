'use client';

import Link from 'next/link';
import { brandProductionOpsFeatureHref } from '@/lib/platform-core-ports/brand-production-handoff';
import { buildManufacturerQcGateSession } from '@/lib/platform-core-ports/manufacturer-handoff';
import {
  brandB2bOrderChainContextHref,
  brandB2bOrderHandoffContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  collectionId: string;
  articleId: string;
  poHandedOff?: boolean;
};

/** Order production dossier — QC/handoff/chain peers after W2 card. */
export function BrandOpDossierProductionPeerStrip({
  orderId,
  collectionId,
  articleId,
  poHandedOff,
}: Props) {
  const qc = buildManufacturerQcGateSession({ orderId, collectionId, articleId });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-op-dossier-production-peer-strip"
    >
      <Link
        href={brandB2bOrderChainContextHref(orderId)}
        data-testid="brand-op-dossier-chain-link"
        className={hubGadget.goldenLink}
      >
        Цепочка
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandB2bOrderHandoffContextHref(orderId)}
        data-testid="brand-op-dossier-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandProductionOpsFeatureHref(orderId, 'qc-gate')}
        data-testid="brand-op-dossier-qc-gate-link"
        className={hubGadget.goldenLink}
      >
        Гейт КК
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandProductionOpsFeatureHref(orderId, 'cut-ticket')}
        data-testid="brand-op-dossier-cut-ticket-link"
        className={hubGadget.goldenLink}
      >
        Техкарта раскроя
      </Link>
      {poHandedOff ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={qc.qcTabHref}
            data-testid="brand-op-dossier-mfr-qc-link"
            className={hubGadget.goldenLink}
          >
            QC цеха
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={shopB2bTrackingOrderHref(orderId)}
            data-testid="brand-op-dossier-shop-tracking-link"
            className={hubGadget.goldenLink}
          >
            Трекинг магазина
          </Link>
        </>
      ) : null}
    </div>
  );
}
