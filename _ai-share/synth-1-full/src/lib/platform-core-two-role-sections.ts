/**
 * Two-role baseline (brand + shop): канон разделов столпов.
 * Аналог JOOR / NuORDER wholesale — без CRM/WSSI/agent-rep/mfr/sup UI.
 *
 * Поток:
 * 1. Brand dev: артикулы → досье (Tech pack)
 * 2. Brand SC: лайншит → витрина → публикация (Linesheet / Digital showroom)
 * 3. Shop SC: витрина коллекций (Buyer catalog)
 * 4. Shop CO: матрица → checkout → реестр → карточка → tracking (Wholesale order)
 * 5. Brand CO: реестр → карточка (Order management)
 * 6. Brand OP: передача / PO / досье серии (Fulfillment в кабинете бренда)
 * 7. Comms: чат · календарь · заметки
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  isPlatformCoreBaselineRoleId,
  isPlatformCoreTwoRoleBaseline,
} from '@/lib/platform-core-article-spine';
import type { ReadinessSubItem } from '@/lib/platform-core-readiness-audit';

/**
 * Wholesale baseline: скрываем только CRM/WSSI/agent-rep и supplier-only разделы.
 * Полный SECTION_AUDIT (brand + shop) остаётся в матрице и кабинете.
 */
export const PLATFORM_CORE_TWO_ROLE_SECTION_DENYLIST = new Set<string>([
  'brand-co-wssi-plan',
  'brand-co-crm-segmentation',
  'brand-co-agent-rep',
  'brand-dev-rfq-supplier',
  'brand-dev-supplier-bom',
  'shop-co-agent-rep',
  'shop-dev-bridge',
]);

/** @deprecated Используйте denylist + PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW для golden path. */
export const PLATFORM_CORE_TWO_ROLE_SECTION_ALLOWLIST: Partial<
  Record<CoreChainRoleId, Partial<Record<CoreHubPillarId, readonly string[]>>>
> = {
  brand: {
    development: ['brand-dev-w2-hub', 'brand-dev-dossier'],
    sample_collection: ['brand-sc-linesheets', 'brand-sc-showroom', 'brand-sc-publish'],
    collection_order: ['brand-co-registry', 'brand-co-detail'],
    order_production: ['brand-op-handoff', 'brand-op-registry', 'brand-op-dossier'],
    comms: ['brand-cm-order-chat', 'brand-cm-article-chat', 'brand-cm-calendar', 'brand-cm-notes'],
  },
  shop: {
    sample_collection: ['shop-sc-showroom'],
    collection_order: [
      'shop-co-matrix',
      'shop-co-checkout',
      'shop-co-registry',
      'shop-co-detail',
      'shop-co-buyer-tracking',
    ],
    comms: ['shop-cm-order-chat', 'shop-cm-calendar-order'],
  },
};

export type TwoRoleWholesaleFlowStep = {
  step: number;
  roleId: 'brand' | 'shop';
  pillarId: CoreHubPillarId;
  sectionId: string;
  labelRu: string;
  joorNuorderAnalogRu: string;
};

/** Сквозной wholesale-путь для hub / planner (read-only). */
export const PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW: readonly TwoRoleWholesaleFlowStep[] = [
  {
    step: 1,
    roleId: 'brand',
    pillarId: 'development',
    sectionId: 'brand-dev-w2-hub',
    labelRu: 'Артикулы',
    joorNuorderAnalogRu: 'Style creation / tech pack hub',
  },
  {
    step: 2,
    roleId: 'brand',
    pillarId: 'development',
    sectionId: 'brand-dev-dossier',
    labelRu: 'Досье · ТЗ',
    joorNuorderAnalogRu: 'Product details & attributes',
  },
  {
    step: 3,
    roleId: 'brand',
    pillarId: 'sample_collection',
    sectionId: 'brand-sc-linesheets',
    labelRu: 'Лайншит',
    joorNuorderAnalogRu: 'Linesheet build',
  },
  {
    step: 4,
    roleId: 'brand',
    pillarId: 'sample_collection',
    sectionId: 'brand-sc-showroom',
    labelRu: 'Витрина бренда',
    joorNuorderAnalogRu: 'Digital showroom (brand view)',
  },
  {
    step: 5,
    roleId: 'shop',
    pillarId: 'sample_collection',
    sectionId: 'shop-sc-showroom',
    labelRu: 'Витрина · коллекции',
    joorNuorderAnalogRu: 'Buyer linesheet / catalog',
  },
  {
    step: 6,
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-matrix',
    labelRu: 'Матрица заказа',
    joorNuorderAnalogRu: 'Size × color matrix',
  },
  {
    step: 7,
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-checkout',
    labelRu: 'Оформление',
    joorNuorderAnalogRu: 'Review & submit order',
  },
  {
    step: 8,
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-registry',
    labelRu: 'Мои заказы',
    joorNuorderAnalogRu: 'Order history',
  },
  {
    step: 9,
    roleId: 'brand',
    pillarId: 'collection_order',
    sectionId: 'brand-co-registry',
    labelRu: 'Входящие опт',
    joorNuorderAnalogRu: 'Brand order inbox',
  },
  {
    step: 10,
    roleId: 'brand',
    pillarId: 'collection_order',
    sectionId: 'brand-co-detail',
    labelRu: 'Карточка заказа',
    joorNuorderAnalogRu: 'Order detail & confirm',
  },
  {
    step: 11,
    roleId: 'brand',
    pillarId: 'order_production',
    sectionId: 'brand-op-handoff',
    labelRu: 'Исполнение · передача',
    joorNuorderAnalogRu: 'Production / fulfillment (brand-owned)',
  },
  {
    step: 12,
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-buyer-tracking',
    labelRu: 'Статус заказа',
    joorNuorderAnalogRu: 'Buyer order tracking',
  },
] as const;

export function isTwoRoleBaselineSectionAllowed(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  sectionId: string
): boolean {
  void pillarId;
  if (!isPlatformCoreTwoRoleBaseline()) return true;
  if (!isPlatformCoreBaselineRoleId(roleId)) return false;
  return !PLATFORM_CORE_TWO_ROLE_SECTION_DENYLIST.has(sectionId);
}

/** Фильтр sidebar «Разделы» и audit sub-items — убираем CRM/WSSI/supplier-only. */
export function filterReadinessSubItemsForTwoRoleBaseline(
  items: ReadinessSubItem[],
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): ReadinessSubItem[] {
  void pillarId;
  if (!isPlatformCoreTwoRoleBaseline()) return items;
  if (!isPlatformCoreBaselineRoleId(roleId)) return [];
  return items.filter((item) => !PLATFORM_CORE_TWO_ROLE_SECTION_DENYLIST.has(item.id));
}
