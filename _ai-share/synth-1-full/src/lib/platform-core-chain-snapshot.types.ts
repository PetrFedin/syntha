/**
 * Canonical chain-overview snapshot shapes (hub + client mirror).
 * Single source — pillar-snapshot BFF uses separate discriminated union in
 * platform-core-pillar-snapshot.types.ts.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';

/** Hub chain strip / chain-overview API — one pillar cell. */
export type PlatformCoreChainPillarSnapshot = {
  id: CoreHubPillarId;
  title: string;
  done: boolean;
  detailRu: string;
  primaryHref: string;
};

/** Hub chain-overview — role participation summary. */
export type PlatformCoreChainRoleSnapshot = {
  id: CoreChainRoleId;
  label: string;
  landingHref: string;
  activePillarCount: number;
  participatesIn: CoreHubPillarId[];
};

/** Full chain-overview payload (server + client cache). */
export type PlatformCoreChainOverviewState = {
  collectionId: string;
  demoOrderId: string;
  demoArticleId: string;
  demoBuyerId?: string;
  pillars: PlatformCoreChainPillarSnapshot[];
  roles: PlatformCoreChainRoleSnapshot[];
  commsThreadCount: number;
};

/** @deprecated Use PlatformCoreChainPillarSnapshot — compatibility alias. */
export type ChainPillarSnap = PlatformCoreChainPillarSnapshot;

/** @deprecated Use PlatformCoreChainRoleSnapshot — compatibility alias. */
export type ChainRoleSnap = PlatformCoreChainRoleSnapshot;
