import { brandAttributeSchemaReleaseChecklistHref } from '@/lib/fashion/brand-attribute-schema-workspace';
import { brandDevTasksKanbanPeerHref } from '@/lib/platform/brand-dev-tasks-kanban-calendar';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';

export { brandDevTasksKanbanPeerHref };

/** Wave WE · investor-readiness PG dashboard labels + peer hrefs (brand dev cabinet). */

export function brandDevInvestorReadinessReadyLabelRu(ready: boolean): string {
  return ready ? 'Готов' : 'Черновик';
}

export function brandDevInvestorReadinessPgSourceLabelRu(pgOnly: boolean): string {
  return pgOnly ? 'PG' : 'memory';
}

export function brandDevInvestorReadinessFillLabelRu(fillPct: number): string {
  return `ТЗ ${fillPct}%`;
}

export function brandDevInvestorReadinessArticlesLabelRu(count: number): string {
  return `${count} арт.`;
}

export function brandDevInvestorReleaseGatePeerHref(collectionId: string): string {
  return `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=techpack-gate&collection=${encodeURIComponent(collectionId)}`;
}

export function brandDevInvestorSummaryHref(collectionId: string, articleId: string): string {
  return `/brand/production/workshop2/investor-summary?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;
}

/** SC release checklist — peer для cross-pillar audit. */
export function brandDevInvestorReleaseChecklistPeerHref(collectionId: string): string {
  return brandAttributeSchemaReleaseChecklistHref(collectionId);
}

export const BRAND_DEV_INVESTOR_READINESS_API = '/api/workshop2/investor-readiness';
