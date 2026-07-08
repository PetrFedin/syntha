/**
 * Platform Core UI Surface Manifest
 *
 * Machine-readable inventory of the visible two-role baseline UI.
 * This file is intentionally separate from readiness/audit scoring: it is a product
 * contract for what may be visible in Brand/Shop Platform Core.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_TWO_ROLE_PENDING_SECTION_BACKLOG,
  PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST,
} from '@/lib/platform-core-two-role-sections';

export type PlatformCoreUiSurfaceStatus =
  | 'CORE_WORKING'
  | 'CORE_PARTIAL'
  | 'PENDING_P0'
  | 'DEMO_ONLY'
  | 'LEGACY_ONLY'
  | 'DUPLICATE'
  | 'EMPTY'
  | 'BROKEN';

export type PlatformCoreUiSurfaceDecision = 'KEEP' | 'FIX' | 'HIDE' | 'MERGE' | 'ARCHIVE';

export type PlatformCoreUiSurfaceManifestItem = {
  roleId: Extract<CoreChainRoleId, 'brand' | 'shop'>;
  pillarId: CoreHubPillarId;
  sectionId: string;
  labelRu: string;
  routeKind: 'core' | 'workspace' | 'contextual' | 'pending';
  status: PlatformCoreUiSurfaceStatus;
  decision: PlatformCoreUiSurfaceDecision;
  primaryExpectation: string;
  nextLinkExpectation?: string;
};

export const PLATFORM_CORE_UI_SURFACE_MANIFEST: readonly PlatformCoreUiSurfaceManifestItem[] = [
  {
    roleId: 'brand',
    pillarId: 'development',
    sectionId: 'brand-dev-w2-hub',
    labelRu: 'Артикулы',
    routeKind: 'core',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Открывает рабочий hub разработки артикулов с созданием/статусом модели.',
    nextLinkExpectation: 'Переход в досье/ТЗ артикула.',
  },
  {
    roleId: 'brand',
    pillarId: 'development',
    sectionId: 'brand-dev-dossier',
    labelRu: 'Досье · ТЗ',
    routeKind: 'contextual',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Показывает tech pack, файлы, sample/readiness и next step в коллекцию.',
    nextLinkExpectation: 'Ready gate ведёт в лайншит/коллекцию.',
  },
  {
    roleId: 'brand',
    pillarId: 'sample_collection',
    sectionId: 'brand-sc-linesheets',
    labelRu: 'Лайншит',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Собирает коммерческий лайншит из готовых артикулов.',
    nextLinkExpectation: 'Переход в витрину бренда и publish.',
  },
  {
    roleId: 'brand',
    pillarId: 'sample_collection',
    sectionId: 'brand-sc-showroom',
    labelRu: 'Витрина бренда',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Показывает brand-side preview опубликованной коллекции.',
    nextLinkExpectation: 'Переход к publish и shop visibility.',
  },
  {
    roleId: 'brand',
    pillarId: 'sample_collection',
    sectionId: 'brand-sc-publish',
    labelRu: 'Публикация',
    routeKind: 'workspace',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Primary CTA публикации коллекции в shop showroom.',
    nextLinkExpectation: 'После publish открывает shop showroom/matrix path.',
  },
  {
    roleId: 'shop',
    pillarId: 'sample_collection',
    sectionId: 'shop-sc-showroom',
    labelRu: 'Витрина · коллекции',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Показывает опубликованные коллекции, карточки, цены и переход в матрицу.',
    nextLinkExpectation: 'Переход к shop-co-matrix.',
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-matrix',
    labelRu: 'Матрица заказа',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Позволяет выбрать SKU/size/qty и собрать заказ.',
    nextLinkExpectation: 'Переход к checkout.',
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-checkout',
    labelRu: 'Оформление',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Проверяет заказ и отправляет его бренду.',
    nextLinkExpectation: 'Переход к registry/detail.',
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-registry',
    labelRu: 'Мои заказы',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Показывает список оптовых заказов магазина.',
    nextLinkExpectation: 'Переход к detail или tracking.',
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-detail',
    labelRu: 'Карточка заказа',
    routeKind: 'contextual',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Показывает состав заказа, подтверждение бренда и revision state.',
    nextLinkExpectation: 'Переход к tracking/acceptance.',
  },
  {
    roleId: 'brand',
    pillarId: 'collection_order',
    sectionId: 'brand-co-registry',
    labelRu: 'Входящие опт',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Показывает входящие заказы от магазинов.',
    nextLinkExpectation: 'Переход к карточке заказа.',
  },
  {
    roleId: 'brand',
    pillarId: 'collection_order',
    sectionId: 'brand-co-detail',
    labelRu: 'Карточка заказа',
    routeKind: 'contextual',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Brand review/confirm/revision/handoff по заказу.',
    nextLinkExpectation: 'Переход к handoff в order_production.',
  },
  {
    roleId: 'brand',
    pillarId: 'order_production',
    sectionId: 'brand-op-handoff',
    labelRu: 'Исполнение · передача',
    routeKind: 'workspace',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Передаёт подтверждённый заказ в исполнение.',
    nextLinkExpectation: 'Переход к QC/packing/ship tracking.',
  },
  {
    roleId: 'brand',
    pillarId: 'order_production',
    sectionId: 'brand-op-registry',
    labelRu: 'Реестр исполнения',
    routeKind: 'workspace',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Показывает заказы в исполнении и текущий статус.',
    nextLinkExpectation: 'Переход к dossier/QC/packing.',
  },
  {
    roleId: 'brand',
    pillarId: 'order_production',
    sectionId: 'brand-op-dossier',
    labelRu: 'Досье серии',
    routeKind: 'contextual',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Показывает production dossier, документы, QC и shipment state.',
    nextLinkExpectation: 'Переход к shop tracking/closeout.',
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-buyer-tracking',
    labelRu: 'Статус заказа',
    routeKind: 'contextual',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Показывает buyer-facing fulfillment/tracking без legacy stub.',
    nextLinkExpectation: 'Переход к acceptance/closeout после реализации OP sections.',
  },
  {
    roleId: 'brand',
    pillarId: 'comms',
    sectionId: 'brand-cm-order-chat',
    labelRu: 'Чат заказа',
    routeKind: 'contextual',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Открывает thread по заказу.',
  },
  {
    roleId: 'brand',
    pillarId: 'comms',
    sectionId: 'brand-cm-article-chat',
    labelRu: 'Чат артикула',
    routeKind: 'contextual',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Открывает thread по артикулу/досье.',
  },
  {
    roleId: 'brand',
    pillarId: 'comms',
    sectionId: 'brand-cm-calendar',
    labelRu: 'Календарь',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Показывает календарь контекста заказа/артикула.',
  },
  {
    roleId: 'brand',
    pillarId: 'comms',
    sectionId: 'brand-cm-notes',
    labelRu: 'Заметки',
    routeKind: 'workspace',
    status: 'CORE_PARTIAL',
    decision: 'FIX',
    primaryExpectation: 'Должен показывать рабочие заметки, а не doc-only peer.',
  },
  {
    roleId: 'shop',
    pillarId: 'comms',
    sectionId: 'shop-cm-order-chat',
    labelRu: 'Чат заказа',
    routeKind: 'contextual',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Открывает thread по заказу для магазина.',
  },
  {
    roleId: 'shop',
    pillarId: 'comms',
    sectionId: 'shop-cm-calendar-order',
    labelRu: 'Календарь заказа',
    routeKind: 'workspace',
    status: 'CORE_WORKING',
    decision: 'KEEP',
    primaryExpectation: 'Показывает календарь заказа и ship window.',
  },
] as const;

export const PLATFORM_CORE_UI_SURFACE_MANIFEST_BY_SECTION_ID = new Map(
  PLATFORM_CORE_UI_SURFACE_MANIFEST.map((item) => [item.sectionId, item])
);

export function getPlatformCoreUiSurfaceManifestItem(sectionId: string) {
  return PLATFORM_CORE_UI_SURFACE_MANIFEST_BY_SECTION_ID.get(sectionId);
}

export function getPlatformCoreVisibleSurfaceIds(): string[] {
  return PLATFORM_CORE_UI_SURFACE_MANIFEST.map((item) => item.sectionId);
}

export function getPlatformCorePartialSurfaceIds(): string[] {
  return PLATFORM_CORE_UI_SURFACE_MANIFEST.filter((item) => item.status === 'CORE_PARTIAL').map(
    (item) => item.sectionId
  );
}

export function flattenVisibleAllowlist(): string[] {
  return Object.values(PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST).flatMap((pillarMap) =>
    Object.values(pillarMap ?? {}).flatMap((sectionIds) => [...sectionIds])
  );
}

export function flattenPendingBacklog(): string[] {
  return Object.values(PLATFORM_CORE_TWO_ROLE_PENDING_SECTION_BACKLOG).flatMap((pillarMap) =>
    Object.values(pillarMap ?? {}).flatMap((sectionIds) => [...sectionIds])
  );
}
