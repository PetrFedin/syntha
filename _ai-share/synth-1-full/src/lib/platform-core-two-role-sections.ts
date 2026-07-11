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
 * 7. Shop OP: tracking исполнения и переход к приёмке
 * 8. Comms: чат · календарь · заметки
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  isPlatformCoreBaselineRoleId,
  isPlatformCoreTwoRoleBaseline,
} from '@/lib/platform-core-article-spine';
import type { ReadinessSubItem } from '@/lib/platform-core-readiness-audit';

/**
 * Platform Core baseline работает по строгому visible allowlist.
 * В v1 показываем только явно подтверждённые рабочие секции brand/shop.
 */
export const PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST: Partial<
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
    order_production: ['shop-op-tracking'],
    comms: ['shop-cm-order-chat', 'shop-cm-calendar-order'],
  },
};

/**
 * Секции, нужные коммерчески, но ещё не готовые как видимые baseline-вкладки.
 * Они не должны показываться обычному пользователю до реализации и e2e-проверки.
 */
export const PLATFORM_CORE_TWO_ROLE_PENDING_SECTION_BACKLOG: Partial<
  Record<CoreChainRoleId, Partial<Record<CoreHubPillarId, readonly string[]>>>
> = {
  brand: {
    collection_order: ['brand-co-revision'],
    order_production: ['brand-op-qc', 'brand-op-packing', 'brand-op-closeout'],
    comms: ['brand-cm-collection-chat'],
  },
  shop: {
    development: ['shop-dev-bridge'],
    collection_order: ['shop-co-revision'],
    order_production: ['shop-op-acceptance', 'shop-op-closeout'],
    comms: ['shop-cm-collection-chat'],
  },
};

/**
 * Backward-compatible denylist for legacy tests/docs. В baseline-фильтрации больше
 * не используется как источник правды; source of truth — visible allowlist выше.
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

/** @deprecated Use PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST. */
export const PLATFORM_CORE_TWO_ROLE_SECTION_ALLOWLIST =
  PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST;

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
    pillarId: 'order_production',
    sectionId: 'shop-op-tracking',
    labelRu: 'Трекинг исполнения',
    joorNuorderAnalogRu: 'Buyer fulfillment tracking',
  },
] as const;

function getVisibleSectionIds(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): readonly string[] {
  return PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST[roleId]?.[pillarId] ?? [];
}

export function isTwoRoleBaselineSectionAllowed(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  sectionId: string
): boolean {
  if (!isPlatformCoreTwoRoleBaseline()) return true;
  if (!isPlatformCoreBaselineRoleId(roleId)) return false;
  return getVisibleSectionIds(roleId, pillarId).includes(sectionId);
}

/** Фильтр sidebar «Разделы» и audit sub-items — показываем только strict visible sections. */
export function filterReadinessSubItemsForTwoRoleBaseline(
  items: ReadinessSubItem[],
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): ReadinessSubItem[] {
  if (!isPlatformCoreTwoRoleBaseline()) return items;
  if (!isPlatformCoreBaselineRoleId(roleId)) return [];
  const visibleIds = new Set(getVisibleSectionIds(roleId, pillarId));
  return items.filter((item) => visibleIds.has(item.id));
}
