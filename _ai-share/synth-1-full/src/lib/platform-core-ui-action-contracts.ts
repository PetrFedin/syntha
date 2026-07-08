/**
 * Platform Core UI Action Contracts
 *
 * Canonical action registry for the visible Brand/Shop baseline.
 * The goal is to stop spreading the same primary action across multiple tabs,
 * peer strips and legacy panels.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';

export type PlatformCoreUiActionId =
  | 'create_article'
  | 'open_dossier'
  | 'build_linesheet'
  | 'publish_collection'
  | 'open_shop_showroom'
  | 'build_order_matrix'
  | 'submit_order'
  | 'review_order'
  | 'request_revision'
  | 'handoff_order'
  | 'write_qc_gate'
  | 'create_packing_list'
  | 'accept_delivery'
  | 'close_order'
  | 'open_article_chat'
  | 'open_collection_chat'
  | 'open_order_chat'
  | 'open_order_calendar';

export type PlatformCoreUiActionStatus = 'ACTIVE' | 'PENDING_P0' | 'PENDING_P1';

export type PlatformCoreUiActionContract = {
  actionId: PlatformCoreUiActionId;
  labelRu: string;
  ownerRoleId: Extract<CoreChainRoleId, 'brand' | 'shop'>;
  pillarId: CoreHubPillarId;
  primarySectionId: string;
  status: PlatformCoreUiActionStatus;
  duplicatePolicy: 'single_primary' | 'secondary_links_only';
  userResultRu: string;
};

export const PLATFORM_CORE_UI_ACTION_CONTRACTS: readonly PlatformCoreUiActionContract[] = [
  {
    actionId: 'create_article',
    labelRu: 'Создать артикул',
    ownerRoleId: 'brand',
    pillarId: 'development',
    primarySectionId: 'brand-dev-w2-hub',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Бренд создаёт рабочую модель/артикул и получает следующий шаг в досье.',
  },
  {
    actionId: 'open_dossier',
    labelRu: 'Открыть досье / ТЗ',
    ownerRoleId: 'brand',
    pillarId: 'development',
    primarySectionId: 'brand-dev-dossier',
    status: 'ACTIVE',
    duplicatePolicy: 'secondary_links_only',
    userResultRu: 'Пользователь видит tech pack, документы, sample/readiness и переход в коллекцию.',
  },
  {
    actionId: 'build_linesheet',
    labelRu: 'Собрать лайншит',
    ownerRoleId: 'brand',
    pillarId: 'sample_collection',
    primarySectionId: 'brand-sc-linesheets',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Готовые артикулы собираются в коммерческий лайншит коллекции.',
  },
  {
    actionId: 'publish_collection',
    labelRu: 'Опубликовать коллекцию',
    ownerRoleId: 'brand',
    pillarId: 'sample_collection',
    primarySectionId: 'brand-sc-publish',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Коллекция становится доступна магазину в showroom и далее в матрице заказа.',
  },
  {
    actionId: 'open_shop_showroom',
    labelRu: 'Открыть витрину коллекций',
    ownerRoleId: 'shop',
    pillarId: 'sample_collection',
    primarySectionId: 'shop-sc-showroom',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Магазин видит опубликованную коллекцию и переходит к выбору SKU.',
  },
  {
    actionId: 'build_order_matrix',
    labelRu: 'Собрать матрицу заказа',
    ownerRoleId: 'shop',
    pillarId: 'collection_order',
    primarySectionId: 'shop-co-matrix',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Магазин выбирает размеры, цвета и количества для оптового заказа.',
  },
  {
    actionId: 'submit_order',
    labelRu: 'Отправить заказ',
    ownerRoleId: 'shop',
    pillarId: 'collection_order',
    primarySectionId: 'shop-co-checkout',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Заказ отправляется бренду и появляется во входящих заказах.',
  },
  {
    actionId: 'review_order',
    labelRu: 'Рассмотреть заказ',
    ownerRoleId: 'brand',
    pillarId: 'collection_order',
    primarySectionId: 'brand-co-detail',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Бренд подтверждает заказ, запрашивает правку или передаёт заказ в исполнение.',
  },
  {
    actionId: 'request_revision',
    labelRu: 'Запросить правку заказа',
    ownerRoleId: 'shop',
    pillarId: 'collection_order',
    primarySectionId: 'shop-co-revision',
    status: 'PENDING_P0',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Магазин и бренд согласуют изменения заказа внутри 12-step flow.',
  },
  {
    actionId: 'handoff_order',
    labelRu: 'Передать заказ в исполнение',
    ownerRoleId: 'brand',
    pillarId: 'order_production',
    primarySectionId: 'brand-op-handoff',
    status: 'ACTIVE',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Подтверждённый заказ получает производственный/fulfillment статус.',
  },
  {
    actionId: 'write_qc_gate',
    labelRu: 'Зафиксировать QC',
    ownerRoleId: 'brand',
    pillarId: 'order_production',
    primarySectionId: 'brand-op-qc',
    status: 'PENDING_P0',
    duplicatePolicy: 'single_primary',
    userResultRu: 'QC становится реальным PG/BFF статусом, видимым бренду и магазину.',
  },
  {
    actionId: 'create_packing_list',
    labelRu: 'Создать packing list',
    ownerRoleId: 'brand',
    pillarId: 'order_production',
    primarySectionId: 'brand-op-packing',
    status: 'PENDING_P0',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Бренд формирует состав отгрузки и документы упаковки.',
  },
  {
    actionId: 'accept_delivery',
    labelRu: 'Принять поставку',
    ownerRoleId: 'shop',
    pillarId: 'order_production',
    primarySectionId: 'shop-op-acceptance',
    status: 'PENDING_P0',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Магазин подтверждает получение и расхождения по поставке.',
  },
  {
    actionId: 'close_order',
    labelRu: 'Закрыть заказ',
    ownerRoleId: 'shop',
    pillarId: 'order_production',
    primarySectionId: 'shop-op-closeout',
    status: 'PENDING_P0',
    duplicatePolicy: 'single_primary',
    userResultRu: 'Заказ переходит в закрытое состояние с итоговой историей и документами.',
  },
  {
    actionId: 'open_article_chat',
    labelRu: 'Открыть чат артикула',
    ownerRoleId: 'brand',
    pillarId: 'comms',
    primarySectionId: 'brand-cm-article-chat',
    status: 'ACTIVE',
    duplicatePolicy: 'secondary_links_only',
    userResultRu: 'Обсуждение привязано к артикулу/досье, а не теряется в общем чате.',
  },
  {
    actionId: 'open_collection_chat',
    labelRu: 'Открыть чат коллекции',
    ownerRoleId: 'brand',
    pillarId: 'comms',
    primarySectionId: 'brand-cm-collection-chat',
    status: 'PENDING_P0',
    duplicatePolicy: 'secondary_links_only',
    userResultRu: 'Сезонная история обсуждения коллекции доступна бренду и магазину.',
  },
  {
    actionId: 'open_order_chat',
    labelRu: 'Открыть чат заказа',
    ownerRoleId: 'brand',
    pillarId: 'comms',
    primarySectionId: 'brand-cm-order-chat',
    status: 'ACTIVE',
    duplicatePolicy: 'secondary_links_only',
    userResultRu: 'Обсуждение привязано к заказу и доступно из order/detail/tracking.',
  },
  {
    actionId: 'open_order_calendar',
    labelRu: 'Открыть календарь заказа',
    ownerRoleId: 'shop',
    pillarId: 'comms',
    primarySectionId: 'shop-cm-calendar-order',
    status: 'ACTIVE',
    duplicatePolicy: 'secondary_links_only',
    userResultRu: 'Магазин видит сроки заказа, ship window и связанные календарные события.',
  },
] as const;

export const PLATFORM_CORE_UI_ACTION_CONTRACTS_BY_ID = new Map(
  PLATFORM_CORE_UI_ACTION_CONTRACTS.map((action) => [action.actionId, action])
);

export function getPlatformCoreUiActionContract(actionId: PlatformCoreUiActionId) {
  return PLATFORM_CORE_UI_ACTION_CONTRACTS_BY_ID.get(actionId);
}

export function getPlatformCoreActivePrimaryActionSectionIds(): string[] {
  return PLATFORM_CORE_UI_ACTION_CONTRACTS.filter((action) => action.status === 'ACTIVE').map(
    (action) => action.primarySectionId
  );
}

export function getPlatformCorePendingPrimaryActionSectionIds(): string[] {
  return PLATFORM_CORE_UI_ACTION_CONTRACTS.filter((action) => action.status !== 'ACTIVE').map(
    (action) => action.primarySectionId
  );
}
