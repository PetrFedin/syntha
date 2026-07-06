/**
 * Wave YQ — hub matrix 5×4 cell registry (4 roles × 5 pillars).
 * SoT for core-232 e2e + wave YY/YZ/YX hub href scans.
 */
import {
  PLATFORM_CORE_HUB_ROWS,
  PLATFORM_CORE_PILLARS,
  getRolePillarWorkspaceHref,
  platformCoreRolePillarHref,
  type CoreChainRoleId,
  type CoreHubPillarId,
} from '@/lib/platform-core-hub-matrix';

export const WAVE_YQ_COLLECTION_ID = 'SS27' as const;
export const WAVE_YQ_CORE_E2E_SPEC = 'core-232-wave-yq-hub-matrix-5x4.spec.ts' as const;

export type WaveYqHubMatrixCell = {
  id: string;
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  active: boolean;
  workspaceHref: string;
  hubCellTestId: string;
  hubScoreTestId: string;
  hubWorkspaceLinkTestId: string;
  anchorTestIds: readonly string[];
  urlPattern: RegExp;
  peerStripMinimums: readonly string[];
};

const CELL_ANCHORS: Partial<Record<string, readonly string[]>> = {
  'brand-development': ['brand-dev-w2-hub-panel'],
  'brand-sample_collection': ['brand-sc-cabinet-panel'],
  'brand-collection_order': ['brand-co-registry-panel', 'brand-co-cabinet-panel'],
  'brand-order_production': ['brand-op-registry-panel', 'brand-op-cabinet-panel'],
  'brand-comms': ['platform-core-comms-inbox-shell'],
  'shop-sample_collection': ['shop-sc-showroom-panel'],
  'shop-collection_order': ['shop-co-matrix-shell'],
  'shop-comms': ['platform-core-comms-inbox-shell'],
  'manufacturer-development': ['mfr-dev-dossier-panel'],
  'manufacturer-order_production': ['mfr-op-cabinet-panel'],
  'manufacturer-comms': ['platform-core-comms-inbox-shell', 'mfr-cm-banner'],
  'supplier-development': ['materials-view-switcher', 'sup-dev-cabinet-spine-peer-strip'],
  'supplier-order_production': ['sup-op-procurement-panel'],
  'supplier-comms': ['platform-core-comms-inbox-shell'],
};

const CELL_PEER_STRIPS: Partial<Record<string, readonly string[]>> = {
  'brand-development': ['brand-dev-w2-hub-co-peer-strip'],
  'shop-sample_collection': ['shop-sc-showroom-b2b-peer-strip'],
  'shop-collection_order': ['shop-co-matrix-spine-peer-strip'],
};

function urlPatternForWorkspaceHref(href: string): RegExp {
  const path = href.split('#')[0]?.split('?')[0] ?? href;
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(\\?|#|$)`);
}

function buildHubMatrixCell(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): WaveYqHubMatrixCell {
  const id = `${roleId}-${pillarId}`;
  const row = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === roleId)!;
  const active = row.pillars[pillarId].kind === 'active';
  const workspaceHref = active
    ? getRolePillarWorkspaceHref(roleId, pillarId)
    : platformCoreRolePillarHref(roleId, pillarId, WAVE_YQ_COLLECTION_ID);

  return {
    id,
    roleId,
    pillarId,
    active,
    workspaceHref,
    hubCellTestId: `readiness-cell-${roleId}-${pillarId}`,
    hubScoreTestId: `readiness-score-${roleId}-${pillarId}`,
    hubWorkspaceLinkTestId: `readiness-workspace-${roleId}-${pillarId}`,
    anchorTestIds: CELL_ANCHORS[id] ?? [`readiness-workspace-${roleId}-${pillarId}`],
    urlPattern: urlPatternForWorkspaceHref(workspaceHref),
    peerStripMinimums: CELL_PEER_STRIPS[id] ?? [],
  };
}

export const WAVE_YQ_HUB_MATRIX_CELLS: readonly WaveYqHubMatrixCell[] = PLATFORM_CORE_HUB_ROWS.flatMap(
  (row) => PLATFORM_CORE_PILLARS.map((pillar) => buildHubMatrixCell(row.id, pillar.id))
);

export const WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS = WAVE_YQ_HUB_MATRIX_CELLS.filter((c) => c.active);
export const WAVE_YQ_HUB_MATRIX_INACTIVE_HUB_CELLS = WAVE_YQ_HUB_MATRIX_CELLS.filter((c) => !c.active);

export function waveYqCoreE2eSpecGlob(basename = WAVE_YQ_CORE_E2E_SPEC): string {
  return `**/${basename}`;
}
