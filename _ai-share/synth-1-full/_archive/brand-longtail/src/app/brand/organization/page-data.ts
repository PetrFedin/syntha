/**
 * Данные для Обзор организации: метаданные секций, карточки, активность.
 * Синхронизировано с brand-navigation и entity-links.
 * Только реэкспорты и barrel — логика в соседних `organization-*.ts`.
 */

export { ALERT_BLOCK_META, SECTION_META } from './organization-section-meta';

export {
  NAVIGATION_CARDS,
  mergeNavigationCardsWithModuleStats,
  type ModuleStatPatch,
  type NavigationCardStatStatus,
  type NavigationModuleCard,
} from './organization-navigation-cards';

export {
  ACTIVITY_PARTICIPANTS,
  HEALTH_METRIC_TEAM,
  RECENT_ACTIVITIES,
  getRecentActivities,
  type RecentActivity,
} from './organization-recent-activity';

export type { HealthMetric } from '@/lib/brand/organization-types';

export {
  HEALTH_LABEL_TO_ONBOARDING_KEY,
  HEALTH_METRICS,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from './organization-health-metrics-demo';

export {
  PARTNER_GROWTH_BY_PERIOD,
  mergePartnerGrowthSlice,
  type PartnerGrowthSlice,
} from './organization-partner-growth';

export {
  PARTNER_COUNTS,
  mergePartnerCountsWithPatches,
  type PartnerCountApiPatch,
  type PartnerCountItem,
} from './organization-partner-counts';

export {
  PARTNER_BUSINESS_PROCESSES,
  mergePartnerBusinessProcessesWithPatches,
  type PartnerProcessApiPatch,
  type PartnerProcessItem,
} from './organization-partner-processes';

export {
  PARTNER_ECOSYSTEM_BLOCKS,
  mergePartnerEcosystemBlocksWithPatches,
  type PartnerEcosystemBlock,
  type PartnerEcosystemBlockApiPatch,
} from './organization-partner-ecosystem-blocks';

export {
  PARTNER_ROLE_LABELS,
  PARTNER_ROLE_ORDER,
  PARTNER_ROLE_WIDGETS,
  type PartnerEcosystemRole,
  type PartnerRoleWidget,
  type PartnerRoleWidgetItem,
} from './organization-partner-role-meta';

export {
  ATTENTION_BY_PERIOD,
  ATTENTION_WIDGET_DESCRIPTION,
  ATTENTION_WIDGET_TIPS,
  PARTNER_ECOSYSTEM_TABS,
  PARTNER_WORK_LINKS,
  PARTNERS_ECOSYSTEM_OVERVIEW_HREF,
  type PartnerEcosystemTabId,
} from './organization-org-hub-static';

export { pickPartnerEcosystemPatches } from './organization-partner-ecosystem-patches';
