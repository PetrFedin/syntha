/**
 * Platform Core · Article Spine (канон продукта).
 *
 * Главная ось: **артикул** (не коллекция). Коллекция — группировка готовых сэмплов для витрины магазинам.
 *
 * Два пути к сэмплу:
 * - `full_production` — ТЗ → производство → образец
 * - `buy_or_import` — закупка/импорт готового, заведение характеристик без полного цикла производства
 *
 * Пользовательские роли v1: только Brand и Shop. Цехи и поставщики остаются внутренними
 * контрагентами/акторами процессов и не получают отдельные пользовательские кабинеты.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export type ArticleCreationMode = 'full_production' | 'buy_or_import';

export type ArticleSpineStageId =
  | 'article_create'
  | 'article_tz_dossier'
  | 'sample_production'
  | 'collection_offer'
  | 'wholesale_order'
  | 'order_fulfillment'
  | 'comms_calendar';

export type ArticleSpineStage = {
  id: ArticleSpineStageId;
  titleRu: string;
  summaryRu: string;
  pillarId: CoreHubPillarId;
  primaryRoleId: CoreChainRoleId;
};

export const PLATFORM_CORE_ARTICLE_SPINE_STAGES: readonly ArticleSpineStage[] = [
  {
    id: 'article_create',
    titleRu: 'Создание артикула',
    summaryRu: 'Новый SKU: полное ТЗ и производство или закупка/образец с характеристиками.',
    pillarId: 'development',
    primaryRoleId: 'brand',
  },
  {
    id: 'article_tz_dossier',
    titleRu: 'ТЗ и досье',
    summaryRu: 'Tech-pack, материалы, BOM и вся информация для образца или закупки.',
    pillarId: 'development',
    primaryRoleId: 'brand',
  },
  {
    id: 'sample_production',
    titleRu: 'Образец',
    summaryRu: 'Отшив или приёмка закупленного сэмпла; статус готовности артикула.',
    pillarId: 'development',
    primaryRoleId: 'brand',
  },
  {
    id: 'collection_offer',
    titleRu: 'Коллекция и витрина',
    summaryRu: 'Выбор из готовых артикулов-сэмплов и публикация коллекции магазинам.',
    pillarId: 'sample_collection',
    primaryRoleId: 'brand',
  },
  {
    id: 'wholesale_order',
    titleRu: 'Оптовый заказ',
    summaryRu: 'Магазин формирует заказ; бренд подтверждает объёмы и условия.',
    pillarId: 'collection_order',
    primaryRoleId: 'shop',
  },
  {
    id: 'order_fulfillment',
    titleRu: 'Исполнение заказа',
    summaryRu: 'Бренд управляет производством или закупкой готового товара под заказ.',
    pillarId: 'order_production',
    primaryRoleId: 'brand',
  },
  {
    id: 'comms_calendar',
    titleRu: 'Связь и календарь',
    summaryRu: 'Бренд и магазин ведут чат, заметки и сроки в контексте процесса.',
    pillarId: 'comms',
    primaryRoleId: 'brand',
  },
];

export const PLATFORM_CORE_ARTICLE_SPINE_LEAD =
  'Артикул — центр: ТЗ или закупка → образец → коллекция → оптовый заказ → производство или закупка под заказ. Бренд и магазин работают в одной цепочке.';

export const PLATFORM_CORE_BASELINE_ROLE_IDS = ['brand', 'shop'] as const;
export type PlatformCoreBaselineRoleId = (typeof PLATFORM_CORE_BASELINE_ROLE_IDS)[number];

/**
 * Extended roles больше не являются частью пользовательского Platform Core.
 * Функция сохранена для обратной совместимости старых импортов и всегда возвращает false.
 */
export function isPlatformCoreExtendedRolesEnabled(): boolean {
  return false;
}

export function isPlatformCoreTwoRoleBaseline(): boolean {
  return true;
}

export function filterPlatformCoreHubRowsForBaseline<T extends { id: CoreChainRoleId }>(
  rows: readonly T[]
): T[] {
  const allowed = new Set<string>(PLATFORM_CORE_BASELINE_ROLE_IDS);
  return rows.filter((row) => allowed.has(row.id));
}

/** Внутренние процессные акторы; не выводятся как роли пользовательского продукта. */
export const PLATFORM_CORE_EXTENDED_ROLE_IDS = ['manufacturer', 'supplier'] as const;

export function isPlatformCoreBaselineRoleId(
  roleId: CoreChainRoleId
): roleId is PlatformCoreBaselineRoleId {
  return (PLATFORM_CORE_BASELINE_ROLE_IDS as readonly string[]).includes(roleId);
}

export function filterGoldenCrossRoleStopsForBaseline<T extends { roleId: CoreChainRoleId }>(
  stops: readonly T[]
): T[] {
  return stops.filter((stop) => isPlatformCoreBaselineRoleId(stop.roleId));
}

export const ARTICLE_SPINE_ARCHIVE_SECTION_IDS: ReadonlySet<string> = new Set([
  'brand-co-wssi-plan',
  'brand-co-crm-segmentation',
  'brand-co-agent-rep',
  'brand-co-pricelist',
  'brand-co-pack-rules',
  'brand-co-landed-margin',
  'brand-co-retailers',
  'brand-co-chain',
  'brand-op-inventory-ops',
  'brand-cm-banner',
  'brand-cm-section-groups',
  'brand-dev-investor',
  'shop-dev-bridge',
  'shop-sc-partners',
  'shop-co-replenishment',
  'shop-co-agent-rep',
  'shop-co-landed-margin',
  'shop-co-collaborative-order',
  'shop-co-working-order',
  'shop-op-inventory-ops',
  'shop-cm-calendar-logistics',
  'sup-dev-comms-peer',
  'sup-dev-cabinet',
]);

export function isPlatformCoreArticleSpineMode(): boolean {
  if (!isPlatformCoreMode()) return false;
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PC_ARTICLE_SPINE_OFF === '1') {
    return false;
  }
  return true;
}

export function isArticleSpineArchiveSection(sectionId: string | null | undefined): boolean {
  const id = sectionId?.trim();
  if (!id) return false;
  return ARTICLE_SPINE_ARCHIVE_SECTION_IDS.has(id);
}

export function filterCabinetSectionsForArticleSpine<T extends { id: string }>(sections: T[]): T[] {
  if (!isPlatformCoreArticleSpineMode()) return sections;
  return sections.filter((section) => !isArticleSpineArchiveSection(section.id));
}

export function articleCreationModeLabelRu(mode: ArticleCreationMode): string {
  return mode === 'full_production' ? 'Производство по ТЗ' : 'Закупка / импорт образца';
}

export const PLATFORM_CORE_ARTICLE_CREATION_MODES: readonly ArticleCreationMode[] = [
  'full_production',
  'buy_or_import',
] as const;

export function isArticleCreationMode(value: unknown): value is ArticleCreationMode {
  return value === 'full_production' || value === 'buy_or_import';
}

export function resolveArticleCreationMode(
  line: { articleCreationMode?: unknown } | null | undefined
): ArticleCreationMode {
  return isArticleCreationMode(line?.articleCreationMode)
    ? line.articleCreationMode
    : 'full_production';
}

export function articleCreationModeSummaryRu(mode: ArticleCreationMode): string {
  return mode === 'full_production'
    ? 'Полный цикл: ТЗ, материалы, производство образца.'
    : 'Готовый образец или импорт — характеристики и досье без полного цикла производства.';
}

export const W2_ARTICLE_MAIN_TABS_BUY_OR_IMPORT = ['tz', 'fit', 'vault'] as const;

const W2_BUY_OR_IMPORT_TAB_SET = new Set<string>(W2_ARTICLE_MAIN_TABS_BUY_OR_IMPORT);

export function isW2MainTabVisibleForCreationMode(
  tabId: string,
  mode: ArticleCreationMode
): boolean {
  if (mode === 'full_production') return true;
  return W2_BUY_OR_IMPORT_TAB_SET.has(tabId);
}
