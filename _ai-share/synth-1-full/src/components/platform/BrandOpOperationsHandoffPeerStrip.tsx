'use client';

import Link from 'next/link';
import { buildBrandProductionHandoffSession } from '@/lib/platform-core-ports/brand-production-handoff';
import {
  BRAND_PRODUCTION_OPS_FACTORY_QUEUE_LINK_RU,
  BRAND_PRODUCTION_OPS_HANDOFF_PEER_LINK_RU,
  BRAND_PRODUCTION_OPS_OPERATIONS_PEER_LINK_RU,
  brandProductionOpsHandoffPeerHref,
  brandProductionOpsOperationsPeerHref,
} from '@/lib/platform-core-ports/platform/brand-production-ops-pg';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
  collectionId: string;
  factoryId?: string;
  /** Omit self-link when inline on the active tab (dedup). */
  activeFeature?: 'operations' | 'handoff';
};

/** Brand OP operations ↔ handoff peer strip (wave XI PG console). */
export function BrandOpOperationsHandoffPeerStrip({
  orderId,
  collectionId,
  factoryId,
  activeFeature,
}: Props) {
  const handoff = buildBrandProductionHandoffSession({ orderId, collectionId, factoryId });
  const operationsHref = brandProductionOpsOperationsPeerHref(orderId, collectionId);
  const handoffHref = brandProductionOpsHandoffPeerHref(orderId, collectionId);
  const showOps = activeFeature !== 'operations';
  const showHandoff = activeFeature !== 'handoff';

  const links: { href: string; testId: string; label: string }[] = [];
  if (showOps) {
    links.push({
      href: operationsHref,
      testId: 'brand-op-handoff-operations-peer-link',
      label: BRAND_PRODUCTION_OPS_OPERATIONS_PEER_LINK_RU,
    });
  }
  if (showHandoff) {
    links.push({
      href: handoffHref,
      testId: 'brand-op-handoff-peer-link',
      label: BRAND_PRODUCTION_OPS_HANDOFF_PEER_LINK_RU,
    });
  }
  links.push({
    href: handoff.factoryQueueHref,
    testId: 'brand-op-handoff-factory-queue-peer-link',
    label: BRAND_PRODUCTION_OPS_FACTORY_QUEUE_LINK_RU,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-op-operations-handoff-peer-strip">
      {links.map((link, index) => (
        <span key={link.testId} className="inline-flex items-center gap-1">
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link href={link.href} data-testid={link.testId} className={hubGadget.goldenLink}>
            {link.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
