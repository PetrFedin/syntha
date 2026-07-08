'use client';

import Link from 'next/link';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { factoryProductionDossierHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  factoryId: string;
  collectionId: string;
  articleId?: string;
  orderId?: string;
};

/** Sample queue · handoff + QC + dossier + production ops peers. */
export function MfrDevSampleQueueHandoffPeerStrip({
  factoryId,
  collectionId,
  articleId,
  orderId,
}: Props) {
  const resolvedArticleId = articleId?.trim() || 'demo-ss27-01';
  const resolvedOrderId = orderId?.trim() || '';
  const ops = buildManufacturerProductionOpsSession({
    factoryId,
    collectionId,
    orderId: resolvedOrderId || undefined,
    articleId: resolvedArticleId,
  });
  const handoffHref = manufacturerHandoffFeatureHref('handoff', {
    factoryId,
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const qcHref = manufacturerHandoffFeatureHref('qc-gate', {
    factoryId,
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const techpackHref = manufacturerHandoffFeatureHref('techpack-ack', {
    factoryId,
    collectionId,
    articleId: resolvedArticleId,
  });
  const dossierHref = factoryProductionDossierHref(resolvedArticleId, { collectionId });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-dev-sample-queue-handoff-peer-strip"
    >
      <Link
        href={handoffHref}
        data-testid="mfr-dev-sample-queue-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={qcHref}
        data-testid="mfr-dev-sample-queue-qc-link"
        className={hubGadget.goldenLink}
      >
        Гейт КК
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={techpackHref}
        data-testid="mfr-dev-sample-queue-techpack-link"
        className={hubGadget.goldenLink}
      >
        Подтверждение техпака
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={dossierHref}
        data-testid="mfr-dev-sample-queue-dossier-link"
        className={hubGadget.goldenLink}
      >
        Досье
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={ops.ordersHref}
        data-testid="mfr-dev-sample-queue-production-ops-link"
        className={hubGadget.goldenLink}
      >
        Операции цеха
      </Link>
    </div>
  );
}
