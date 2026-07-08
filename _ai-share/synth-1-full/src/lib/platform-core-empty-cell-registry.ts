import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_PILLARS,
  getPlatformCoreHubRow,
  isPlatformCoreEmptyChainCollection,
} from '@/lib/platform-core-hub-matrix';

/**
 * Peer-insight столпы: данные (`EMPTY_SECTION_AUDIT`, компоненты) — в nav кабинета и hub audit.
 */
/** Peer-insight панели в кабинете — выключены (не участвует = тишина). */
export const PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_UI = false;

/** Hub readiness matrix: без оценок в неактивных ячейках (—). */
export const PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_HUB_AUDIT = false;

/** Роли×столпы с insight-панелью (legacy / audit; см. SHOW_PEER_INSIGHT). */
export function hasEmptyCellInsightPanel(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): boolean {
  return (
    (roleId === 'shop' && pillarId === 'development') ||
    (roleId === 'manufacturer' && pillarId === 'collection_order') ||
    (roleId === 'manufacturer' && pillarId === 'sample_collection') ||
    (roleId === 'supplier' && pillarId === 'sample_collection') ||
    (roleId === 'supplier' && pillarId === 'collection_order')
  );
}

/** Показывать empty insight в nav / разделах кабинета. */
export function isEmptyCellInsightVisibleInUi(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): boolean {
  return PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_UI && hasEmptyCellInsightPanel(roleId, pillarId);
}

/** Hub cabinet: peer-insight панели для empty-cell ролей (forecast, BOM preview). */
export function isEmptyCellInsightVisibleInCabinetHub(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): boolean {
  return hasEmptyCellInsightPanel(roleId, pillarId);
}

/** Показывать empty insight в матрице готовности на hub (audit-only). */
export function isEmptyCellInsightVisibleInHubAudit(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): boolean {
  return PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_HUB_AUDIT && hasEmptyCellInsightPanel(roleId, pillarId);
}

/** Столпы в навигации кабинета: active + peer-insight empty (кроме EMPTY27). */
export function getRoleCabinetNavPillarIds(
  roleId: CoreChainRoleId,
  collectionId = 'SS27'
): CoreHubPillarId[] {
  const row = getPlatformCoreHubRow(roleId);
  if (!row) return [];

  const emptyChain = isPlatformCoreEmptyChainCollection(collectionId);

  return PLATFORM_CORE_PILLARS.filter((p) => {
    const cell = row.pillars[p.id];
    if (cell.kind === 'active') return true;
    if (emptyChain) return false;
    return hasEmptyCellInsightPanel(roleId, p.id);
  }).map((p) => p.id);
}

export function isRolePillarCabinetSelectable(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId = 'SS27'
): boolean {
  return getRoleCabinetNavPillarIds(roleId, collectionId).includes(pillarId);
}
