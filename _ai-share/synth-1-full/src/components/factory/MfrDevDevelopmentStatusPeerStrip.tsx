'use client';

import Link from 'next/link';
import {
  WAVE_YS_BRAND_DEV_STATUS_RU,
  WAVE_YS_MFR_DEV_BRAND_DEV_STATUS_LINK_TESTID,
  WAVE_YS_MFR_DEV_SAMPLE_QUEUE_PEER_LINK_TESTID,
  WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID,
  WAVE_YS_SAMPLE_QUEUE_RU,
  buildMfrDevBrandDevelopmentStatusPeerHref,
  buildMfrDevSampleQueuePeerHref,
} from '@/lib/platform/wave-ys-mfr-dev-status-mirror';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  factoryId?: string;
  articleId?: string;
};

/** Mfr dev cabinet · brand development-status + sample queue peers (wave YS). */
export function MfrDevDevelopmentStatusPeerStrip({ collectionId, factoryId, articleId }: Props) {
  const brandDevHref = buildMfrDevBrandDevelopmentStatusPeerHref(collectionId);
  const sampleQueueHref = buildMfrDevSampleQueuePeerHref({ collectionId, factoryId, articleId });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid={WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID}
    >
      <Link
        href={brandDevHref}
        data-testid={WAVE_YS_MFR_DEV_BRAND_DEV_STATUS_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_YS_BRAND_DEV_STATUS_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={sampleQueueHref}
        data-testid={WAVE_YS_MFR_DEV_SAMPLE_QUEUE_PEER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_YS_SAMPLE_QUEUE_RU}
      </Link>
    </div>
  );
}
