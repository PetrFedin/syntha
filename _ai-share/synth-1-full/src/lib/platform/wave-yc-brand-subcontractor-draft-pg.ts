import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { SubcontractOrder } from '@/lib/production/subcontractor';
import { SEWING_ENTERPRISE_PARTNER_OPTIONS } from '@/lib/production/workshop2-sewing-enterprise-partners';
import { floorTabDraftStorageKey } from '@/lib/production-data/floor-tab-draft-store';

/** Wave YC · brand subcontractor floor-tab draft → PG SoT in Platform Core. */

export const WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_SCOPE = 'subcontractor' as const;
export const WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_TAB_API =
  '/api/brand/production/floor-tabs/subcontractor';
export const WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_PG_TESTID =
  'brand-floor-tab-subcontractor-storage-pg';
export const WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_UNAVAILABLE_TESTID =
  'brand-floor-tab-subcontractor-storage-unavailable';
export const WAVE_YC_BRAND_SUBCONTRACTOR_PAGE_TESTID = 'brand-subcontractor-floor-page';

export const WAVE_YC_BRAND_SUBCONTRACTOR_PG_BADGE_RU = 'PostgreSQL';
export const WAVE_YC_BRAND_SUBCONTRACTOR_PG_UNAVAILABLE_RU = 'PG недоступен';
export const WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TITLE_RU = 'Сохранено';
export const WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TOAST_RU = 'Субподряд записан';
export const WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_TITLE_RU = 'Заказы на сторону';
export const WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_DESC_RU =
  'Статусы до интеграции с актами выполненных работ';
export const WAVE_YC_BRAND_SUBCONTRACTOR_HUB_TITLE_RU = 'Кабинет субподряда';
export const WAVE_YC_BRAND_SUBCONTRACTOR_HUB_DESC_RU =
  'Заказы на сторону — контроль статусов по заказам на производство и актам';

export const WAVE_YC_BRAND_SUBCONTRACTOR_STATUS_LABELS_RU: Record<
  SubcontractOrder['status'],
  string
> = {
  requested: 'Заявка',
  in_progress: 'В работе',
  completed: 'Выполнено',
  cancelled: 'Отменено',
};

export const WAVE_YC_BRAND_FLOOR_TAB_DRAFT_LS_PREFIX = 'brand_floor_tab_draft_v1__';

export function waveYcBrandSubcontractorFloorTabStorageKey(): string {
  return floorTabDraftStorageKey(WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_SCOPE);
}

function enterprisePartner(id: string) {
  return SEWING_ENTERPRISE_PARTNER_OPTIONS.find((p) => p.id === id);
}

/** Demo seed aligned with enterprise partners (no placeholder-brand duplicates). */
export function createBrandSubcontractorFloorDemoSeed(): { v: 1; orders: SubcontractOrder[] } {
  const lab = enterprisePartner('syntha-lab');
  const factory = enterprisePartner('factory-01');
  return {
    v: 1,
    orders: [
      {
        id: 'sub-seed-1',
        subcontractorId: lab?.id ?? 'syntha-lab',
        subcontractorName: lab?.label ?? 'Syntha Lab · Москва (демо B2B)',
        orderId: 'PO-201',
        workType: 'sewing',
        workTypeLabel: 'Пошив',
        quantity: 500,
        unit: 'шт',
        status: 'in_progress',
        requestedAt: '2026-03-05T10:00:00Z',
      },
      {
        id: 'sub-seed-2',
        subcontractorId: factory?.id ?? 'factory-01',
        subcontractorName: factory?.label ?? 'Factory 01',
        orderId: 'PO-202',
        workType: 'cutting',
        workTypeLabel: 'Раскрой',
        quantity: 1200,
        unit: 'шт',
        status: 'completed',
        requestedAt: '2026-03-01T08:00:00Z',
        completedAt: '2026-03-08T17:00:00Z',
        actNumber: 'АКТ-2026-014',
      },
    ],
  };
}

export function createBrandSubcontractorFloorEmptySeed(): { v: 1; orders: SubcontractOrder[] } {
  return { v: 1, orders: [] };
}

/** Core: empty until PG hydrate; non-core: enterprise-aligned demo. */
export function resolveBrandSubcontractorFloorDefaultSeed(): {
  v: 1;
  orders: SubcontractOrder[];
} {
  return isPlatformCoreMode()
    ? createBrandSubcontractorFloorEmptySeed()
    : createBrandSubcontractorFloorDemoSeed();
}
