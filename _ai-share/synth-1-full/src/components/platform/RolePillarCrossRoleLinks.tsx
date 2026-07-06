'use client';

import Link from 'next/link';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  getPillarCrossRolePeersForDemo,
  getPlatformCorePillarEntityLabelForDemo,
} from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { prefetchPlatformCoreW2FromHref } from '@/lib/platform-core-w2-prefetch';
import { prefetchPillarSnapshot } from '@/lib/platform-core-pillar-prefetch';
import { waveYxCrossRoleLinkTitleRu } from '@/lib/platform-core-ports/platform/wave-yx-hub-dead-end-fix';

type Props = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  /** Только compact — одна строка peer-ссылок (канон Platform Core). */
  variant?: 'compact';
};

export function RolePillarCrossRoleLinks({ roleId, pillarId, variant = 'compact' }: Props) {
  const demo = usePlatformCoreDemoContext();
  const peers = getPillarCrossRolePeersForDemo(roleId, pillarId, demo);
  const activePeers = peers.filter((p) => p.participates);
  const entityLabel = getPlatformCorePillarEntityLabelForDemo(pillarId, demo);

  function warmPeerLink(href: string, peerRoleId: CoreChainRoleId) {
    prefetchPlatformCoreW2FromHref(href);
    prefetchPillarSnapshot({
      collectionId: demo.collectionId,
      pillarId,
      roleId: peerRoleId,
      factoryId: demo.factoryId,
    });
  }

  if (variant !== 'compact' || activePeers.length === 0) return null;

  return (
    <div
      data-testid={`role-pillar-cross-role-${pillarId}`}
      data-variant="compact"
      className="flex flex-wrap items-center gap-2"
    >
      {activePeers.map((peer) =>
        peer.demoHref ? (
          <Link
            key={peer.roleId}
            href={peer.demoHref}
            data-testid={`cross-role-demo-${peer.roleId}-${pillarId}`}
            className="text-accent-primary text-[11px] font-medium hover:underline"
            title={peer.title}
            onMouseEnter={() => {
              if (peer.demoHref) warmPeerLink(peer.demoHref, peer.roleId);
            }}
            onFocus={() => {
              if (peer.demoHref) warmPeerLink(peer.demoHref, peer.roleId);
            }}
          >
            {peer.label}
          </Link>
        ) : (
          <Link
            key={peer.roleId}
            href={peer.cabinetHref}
            data-testid={`cross-role-cabinet-${peer.roleId}-${pillarId}`}
            className="text-accent-primary text-[11px] font-medium hover:underline"
            title={waveYxCrossRoleLinkTitleRu(peer.label, peer.title)}
            aria-label={waveYxCrossRoleLinkTitleRu(peer.label, peer.title)}
            onMouseEnter={() => warmPeerLink(peer.cabinetHref, peer.roleId)}
            onFocus={() => warmPeerLink(peer.cabinetHref, peer.roleId)}
          >
            {peer.label}
          </Link>
        )
      )}
      <span className="sr-only" data-testid={`cross-role-entity-${pillarId}`}>
        {entityLabel}
      </span>
    </div>
  );
}
