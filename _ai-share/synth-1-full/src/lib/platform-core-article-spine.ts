/**
 * Platform Core · Article Spine (канон продукта).
 *
 * Главная ось: **артикул** (не коллекция). Коллекция — группировка готовых сэмплов для витрины магазинам.
 *
 * Два пути к сэмплу:
 * - `full_production` — ТЗ → производство → образец (цех + поставщики сырья)
 * - `buy_or_import` — закупка/импорт готового, заведение характеристик без полного цикла производства
 *
 * Дальше: коллекция (лайншит/витрина) → оптовый заказ магазина → выпуск/закупка под заказ → связь и календарь.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export type ArticleCreationMode = 'full_production' | 'buy_or_import';

/** Этапы spine в порядке бизнес-потока (для golden path и onboarding). */
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

/** Каноническая последовательность — источник правды для UI copy и e2e (wave 6+). */
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
    summaryRu: 'Tech-pack, материалы, BOM, RFQ — всё что нужно для образца или закупки.',
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
    summaryRu: 'Выбор из списка артикулов-сэмплов; несколько коллекций в сезон — норма.',
    pillarId: 'sample_collection',
    primaryRoleId: 'brand',
  },
  {
    id: 'wholesale_order',
    titleRu: 'Оптовый заказ',
    summaryRu: 'Магазин формирует заказ; бренд подтверждает объёмы.',
    pillarId: 'collection_order',
    primaryRoleId: 'shop',
  },
  {
    id: 'order_fulfillment',
    titleRu: 'Исполнение заказа',
    summaryRu: 'Производство под заказ, закупка готового, передача в цех, сырьё поставщиков.',
    pillarId: 'order_production',
    primaryRoleId: 'brand',
  },
  {
    id: 'comms_calendar',
    titleRu: 'Связь и календарь',
    summaryRu: 'Чат, заметки, сроки — надстройка над spine, не отдельный продукт.',
    pillarId: 'comms',
    primaryRoleId: 'brand',
  },
];

export const PLATFORM_CORE_ARTICLE_SPINE_LEAD =
  'Артикул — центр: ТЗ или закупка → образец → коллекция из сэмплов → оптовый заказ → выпуск/закупка под заказ. Связь и календарь координируют все этапы.';

/** Публичные роли v1 — только бренд и магазин (байер). */
export const PLATFORM_CORE_BASELINE_ROLE_IDS = ['brand', 'shop'] as const;

export type PlatformCoreBaselineRoleId = (typeof PLATFORM_CORE_BASELINE_ROLE_IDS)[number];

/** Расширенные роли (цех/поставщик) в hub — только с флагом. */
export function isPlatformCoreExtendedRolesEnabled(): boolean {
  return typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES === '1';
}

export function isPlatformCoreTwoRoleBaseline(): boolean {
  if (!isPlatformCoreMode()) return false;
  return !isPlatformCoreExtendedRolesEnabled();
}

export function filterPlatformCoreHubRowsForBaseline<T extends { id: CoreChainRoleId }>(
  rows: readonly T[]
): T[] {
  if (!isPlatformCoreTwoRoleBaseline()) return [...rows];
  const allowed = new Set<string>(PLATFORM_CORE_BASELINE_ROLE_IDS);
  return rows.filter((row) => allowed.has(row.id));
}

/** Роли вне baseline (backend-акторы; UI только с `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`). */
export const PLATFORM_CORE_EXTENDED_ROLE_IDS = ['manufacturer', 'supplier'] as const;

export function isPlatformCoreBaselineRoleId(
  roleId: CoreChainRoleId
): roleId is PlatformCoreBaselineRoleId {
  return (PLATFORM_CORE_BASELINE_ROLE_IDS as readonly string[]).includes(roleId);
}

export function filterGoldenCrossRoleStopsForBaseline<T extends { roleId: CoreChainRoleId }>(
  stops: readonly T[]
): T[] {
  if (!isPlatformCoreTwoRoleBaseline()) return [...stops];
  return stops.filter((s) => isPlatformCoreBaselineRoleId(s.roleId));
}

/**
 * Разделы hub, которые **не входят** в spine v1 — скрываем в Platform Core навигации.
 * Маршруты и код остаются (deep-link, legacy); retail/CRM — Wave 7; monetization/investor/B2B peer — Wave 9 в `_archive/` + stub null в spine.
 */
export const ARTICLE_SPINE_ARCHIVE_SECTION_IDS: ReadonlySet<string> = new Set([
  // Brand · monetization / CRM / planning noise
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
  // Shop · retail / advanced wholesale extras
  'shop-dev-bridge',
  'shop-sc-partners',
  'shop-co-replenishment',
  'shop-co-agent-rep',
  'shop-co-landed-margin',
  'shop-co-collaborative-order',
  'shop-co-working-order',
  'shop-op-inventory-ops',
  'shop-cm-calendar-logistics',
  // Supplier · dev peer strips not in order path
  'sup-dev-comms-peer',
  'sup-dev-cabinet',
]);

/** Platform Core работает в режиме article spine (можно отключить для audit). */
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

/** Фильтр списка разделов кабинета (hub sidebar / section list). */
export function filterCabinetSectionsForArticleSpine<T extends { id: string }>(sections: T[]): T[] {
  if (!isPlatformCoreArticleSpineMode()) return sections;
  return sections.filter((s) => !isArticleSpineArchiveSection(s.id));
}

/** Краткая подпись режима создания артикула (UI badges). */
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

/** Режим из строки инвентаря W2; по умолчанию — полное производство. */
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
    : 'Готовый образец или импорт — характеристики и досье без полного цикла цеха.';
}

/** Wave 8b · вкладки досье при «Закупка / импорт» (без BOM, пошива, QC). */
export const W2_ARTICLE_MAIN_TABS_BUY_OR_IMPORT = ['tz', 'fit', 'vault'] as const;

const W2_BUY_OR_IMPORT_TAB_SET = new Set<string>(W2_ARTICLE_MAIN_TABS_BUY_OR_IMPORT);

export function isW2MainTabVisibleForCreationMode(
  tabId: string,
  mode: ArticleCreationMode
): boolean {
  if (mode === 'full_production') return true;
  const id = tabId === 'overview' ? 'tz' : tabId;
  return W2_BUY_OR_IMPORT_TAB_SET.has(id);
}

export function filterW2MainTabsForCreationMode<T extends { id: string }>(
  tabs: readonly T[],
  mode: ArticleCreationMode
): T[] {
  if (mode === 'full_production') return [...tabs];
  return tabs.filter((t) => W2_BUY_OR_IMPORT_TAB_SET.has(t.id));
}

/** Если deep-link ведёт на скрытую вкладку — открываем ТЗ. */
export function resolveW2MainTabForCreationMode(
  tab: string | null | undefined,
  mode: ArticleCreationMode
): string {
  const normalized = !tab || tab === 'overview' ? 'tz' : tab;
  if (isW2MainTabVisibleForCreationMode(normalized, mode)) return normalized;
  return 'tz';
}

/** Wave 9 · monetization/investor/B2B peer → `_archive/` + stub null в spine. */
export { PLATFORM_CORE_WAVE9_MONETIZATION_MFR_ARCHIVE_PATHS } from '@/lib/platform-core-wave9-monetization-mfr-archive';
