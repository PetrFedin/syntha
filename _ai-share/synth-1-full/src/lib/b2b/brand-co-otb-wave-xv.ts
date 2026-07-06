import type { BrandCoOtbReplenishmentSyncStatus } from '@/lib/b2b/brand-co-otb-replenishment-sync';

/** Wave XV — brand CO WSSI/OTB PG plan sync × shop replenishment rules (deduped strip). */
export const BRAND_CO_OTB_PLAN_SYNC_API = '/api/brand/b2b/otb/plan-sync';

export const BRAND_CO_OTB_REPLENISHMENT_SYNC_STRIP_TESTID = 'brand-co-otb-replenishment-sync-strip';
export const BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_BADGE_TESTID =
  'brand-co-otb-replenishment-sync-summary-badge';
export const BRAND_CO_OTB_PLAN_SYNC_BADGE_TESTID = 'brand-co-otb-plan-sync-badge';

export const BRAND_CO_OTB_REPLENISHMENT_SYNC_SUMMARY_RU = 'OTB × пополнение';
export const BRAND_CO_OTB_PLAN_SYNC_RU = 'Синхрон плана OTB';
export const BRAND_CO_OTB_OTB_SOURCE_RU = 'OTB';
export const BRAND_CO_OTB_RULES_SOURCE_RU = 'Правила';

export const BRAND_CO_OTB_SYNC_STATUS_RU: Record<BrandCoOtbReplenishmentSyncStatus, string> = {
  aligned: 'Синхрон',
  review: 'Проверка',
  pending: 'Нет правил',
};

export function brandCoOtbReplenishmentSyncOtbSourceBadgeTestId(storageMode: string): string {
  return `brand-co-otb-replenishment-sync-otb-source-${storageMode}`;
}

export function brandCoOtbReplenishmentSyncRulesSourceBadgeTestId(storageMode: string): string {
  return `brand-co-otb-replenishment-sync-rules-source-${storageMode}`;
}

export function brandCoOtbReplenishmentSyncBuyerLinkTestId(buyerId: string): string {
  return `brand-co-otb-replenishment-sync-buyer-${buyerId}-link`;
}

export function brandCoOtbPlanSyncMessageRu(input: {
  aligned: number;
  buyers: number;
  collectionId: string;
  otbStorageMode: string;
  rulesStorageMode: string;
}): string {
  const otbLabel = input.otbStorageMode === 'pg' ? 'PG' : input.otbStorageMode;
  const rulesLabel = input.rulesStorageMode === 'pg' ? 'PG' : input.rulesStorageMode;
  return `${input.aligned}/${input.buyers} синхронизировано · OTB ${otbLabel} × правила ${rulesLabel} · ${input.collectionId}`;
}
