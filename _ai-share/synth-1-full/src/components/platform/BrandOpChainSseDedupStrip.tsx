'use client';

import Link from 'next/link';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID,
  brandOpChainContextHrefForSseDedup,
  brandOpChainSseDedupChainLinkLabelRu,
  brandOpChainSseDedupStripLeadRu,
} from '@/lib/platform-core-ports/fashion/brand-op-wave-vq';

type Props = {
  orderId: string;
  sseConnected: boolean;
  stripTestId: string;
  chainLinkTestId: string;
  /** Wave YT: omit live dot when section list owns chain-status. */
  omitLiveBadge?: boolean;
};

/** Registry/cabinet: SSE dot + link to chain card (dedup vs full badge on B2bOrderChainStatusCard). */
export function BrandOpChainSseDedupStrip({
  orderId,
  sseConnected,
  stripTestId,
  chainLinkTestId,
  omitLiveBadge = false,
}: Props) {
  const chainHref = brandOpChainContextHrefForSseDedup(orderId);

  return (
    <div className={hubGadget.goldenPath} data-testid={stripTestId}>
      {!omitLiveBadge ? (
        <PlatformCoreChainStatusRefreshBadge
          sseConnected={sseConnected}
          enabled
          variant="dot"
          sseTestId={BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID}
          pollTestId={`${BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID}-poll`}
        />
      ) : null}
      <span className={hubGadget.muted}>{brandOpChainSseDedupStripLeadRu()}</span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={chainHref} data-testid={chainLinkTestId} className={hubGadget.goldenLink}>
        {brandOpChainSseDedupChainLinkLabelRu()}
      </Link>
    </div>
  );
}
