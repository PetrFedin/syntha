/**
 * Ручной аудит разделов внутри ячейки «роль × столп».
 * SoT для разворота «разделы» в матрице готовности на /platform.
 *
 * Редактировать данные по ролям: `brand-audit.ts`, `shop-audit.ts`, …
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreDemo, platformCoreRolePillarHref, rewriteHrefForDemo } from '@/lib/platform-core-hub-matrix';
import type { ReadinessSubItem } from '@/lib/platform-core-readiness-audit';
import { filterReadinessSubItemsForTwoRoleBaseline } from '@/lib/platform-core-two-role-sections';

import { BRAND_SECTION_AUDIT } from './brand-audit';
import { SHOP_SECTION_AUDIT } from './shop-audit';
import { MANUFACTURER_SECTION_AUDIT } from './manufacturer-audit';
import { SUPPLIER_SECTION_AUDIT } from './supplier-audit';
import { EMPTY_SECTION_AUDIT as EMPTY_SECTION_AUDIT_DATA } from './empty-cells-audit';
import type { SectionAuditMap } from './types';
import { deriveHonestLiveScore } from './scoring';

export type { SectionAuditTemplate, SectionAuditMap } from './types';
export {
  buildReadinessScoreBreakdown,
  deriveHonestLiveScore,
  roundReadinessScore,
} from './scoring';

/** Канон разделов по 15 активным ячейкам (hub CTA + кабинет + рабочие экраны + связи). */
export const SECTION_AUDIT: SectionAuditMap = {
  brand: BRAND_SECTION_AUDIT,
  shop: SHOP_SECTION_AUDIT,
  manufacturer: MANUFACTURER_SECTION_AUDIT,
  supplier: SUPPLIER_SECTION_AUDIT,
};

/**
 * Read-only insight-разделы для empty-ячеек (peer-контекст).
 * Порядок: статус → peer workspace → cross-role → кабинет.
 */
export const EMPTY_SECTION_AUDIT: SectionAuditMap = EMPTY_SECTION_AUDIT_DATA;

export function buildSectionSubItems(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId: string
): ReadinessSubItem[] {
  const templates = SECTION_AUDIT[roleId]?.[pillarId];
  if (!templates?.length) return [];

  const demo = getPlatformCoreDemo(collectionId);
  const items = templates.map((t) => ({
    id: t.id,
    label: t.label,
    order: t.order,
    staticScore: t.staticScore,
    liveScore: deriveHonestLiveScore(t.staticScore, t.good ?? [], t.bad ?? [], t.fix ?? []),
    summary: t.summary,
    good: t.good ?? [],
    bad: t.bad ?? [],
    fix: t.fix ?? [],
    href: rewriteHrefForDemo(t.resolveHref(demo), demo),
  }));
  return filterReadinessSubItemsForTwoRoleBaseline(items, roleId, pillarId);
}

/** Средняя оценка разделов ячейки (для сверки с CELL_AUDIT). */
export function averageSectionScores(
  subItems: ReadonlyArray<Pick<ReadinessSubItem, 'staticScore' | 'liveScore'>>,
  mode: 'static' | 'live',
  templates?: ReadonlyArray<{ scoreAliasOf?: string }>
): number | null {
  const scored = subItems.filter((_, index) => !templates?.[index]?.scoreAliasOf);
  if (scored.length === 0) return null;
  const sum = scored.reduce(
    (s, item) => s + (mode === 'live' ? item.liveScore : item.staticScore),
    0
  );
  return Math.round((sum / scored.length) * 10) / 10;
}

export function getExpectedSectionCount(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): number {
  return SECTION_AUDIT[roleId]?.[pillarId]?.length ?? 0;
}

export function buildEmptySectionSubItems(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId: string
): ReadinessSubItem[] {
  const templates = EMPTY_SECTION_AUDIT[roleId]?.[pillarId];
  if (!templates?.length) return [];

  const demo = getPlatformCoreDemo(collectionId);
  return templates.map((t) => ({
    id: t.id,
    label: t.label,
    order: t.order,
    staticScore: t.staticScore,
    liveScore: deriveHonestLiveScore(t.staticScore, t.good ?? [], t.bad ?? [], t.fix ?? []),
    summary: t.summary,
    good: t.good ?? [],
    bad: t.bad ?? [],
    fix: t.fix ?? [],
    adrBacklog: t.adrBacklog ?? [],
    href: rewriteHrefForDemo(t.resolveHref(demo), demo),
  }));
}

export function getExpectedEmptySectionCount(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): number {
  return EMPTY_SECTION_AUDIT[roleId]?.[pillarId]?.length ?? 0;
}

/** Fallback href если раздел без маршрута — кабинет столпа. */
export function fallbackSectionHref(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId?: string
): string {
  return platformCoreRolePillarHref(roleId, pillarId, collectionId);
}
