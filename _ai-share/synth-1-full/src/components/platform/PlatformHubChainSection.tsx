'use client';

import { PlatformCoreChainFlowStrip } from '@/components/platform/PlatformCoreChainFlowStrip';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

type Props = {
  collectionId?: string;
};

export function PlatformHubChainSection({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
}: Props) {
  return (
    <section className="space-y-2">
      <p className="text-text-muted text-[11px] font-semibold uppercase tracking-wide">
        Живая цепочка
      </p>
      <PlatformCoreChainFlowStrip collectionId={collectionId} />
    </section>
  );
}
