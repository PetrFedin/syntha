/**
 * Platform Core UI Repair Queue
 *
 * The lifecycle/action contracts tell us what is missing. This file turns that
 * into an implementation queue so Phase 23 work does not drift into repeats,
 * cosmetic refactors or new scope.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import type { PlatformCoreUiActionId } from '@/lib/platform-core-ui-action-contracts';

export type PlatformCoreRepairPriority = 'P0' | 'P1' | 'P2';
export type PlatformCoreRepairKind = 'ui' | 'bff' | 'db' | 'test' | 'docs' | 'design-system';
export type PlatformCoreRepairStatus = 'READY_FOR_IMPLEMENTATION' | 'BLOCKED_BY_FLOW' | 'DEFERRED';

export type PlatformCoreUiRepairQueueItem = {
  repairId: string;
  priority: PlatformCoreRepairPriority;
  status: PlatformCoreRepairStatus;
  roleIds: readonly Extract<CoreChainRoleId, 'brand' | 'shop'>[];
  pillarId: CoreHubPillarId;
  actionIds: readonly PlatformCoreUiActionId[];
  kind: readonly PlatformCoreRepairKind[];
  titleRu: string;
  problemRu: string;
  fixRu: string;
  acceptanceRu: readonly string[];
};

export const PLATFORM_CORE_UI_REPAIR_QUEUE: readonly PlatformCoreUiRepairQueueItem[] = [
  {
    repairId: 'p0-sample-collection-publish-primary-cta',
    priority: 'P0',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['brand'],
    pillarId: 'sample_collection',
    actionIds: ['publish_collection'],
    kind: ['ui', 'test'],
    titleRu: 'Publish как primary CTA в Sample Collection Hub',
    problemRu: 'Публикация коллекции существует, но воспринимается как секционная функция, а не как главная цель столпа.',
    fixRu: 'Сделать publish_collection главным CTA brand sample_collection hub, связать с readiness и shop visibility.',
    acceptanceRu: [
      'Brand sample_collection показывает один главный CTA публикации.',
      'CTA ведёт в brand-sc-publish или выполняет canonical publish action.',
      'После publish пользователь видит следующий шаг: shop showroom / matrix visibility.',
    ],
  },
  {
    repairId: 'p0-collection-order-revision-cycle',
    priority: 'P0',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['brand', 'shop'],
    pillarId: 'collection_order',
    actionIds: ['request_revision'],
    kind: ['ui', 'bff', 'test'],
    titleRu: 'Revision внутри Collection Order flow',
    problemRu: 'Правки заказа коммерчески обязательны, но сейчас живут вне основного 12-step path.',
    fixRu: 'Добавить revision state cycle request/submit/approve в order detail для brand/shop без side-panel как основного пути.',
    acceptanceRu: [
      'Brand и Shop видят один revision status.',
      'Revision не выводится как отдельный продукт или legacy route.',
      'После approve заказ возвращается в confirm/handoff path.',
    ],
  },
  {
    repairId: 'p0-order-production-qc-gate',
    priority: 'P0',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['brand'],
    pillarId: 'order_production',
    actionIds: ['write_qc_gate'],
    kind: ['ui', 'bff', 'db', 'test'],
    titleRu: 'QC gate как реальный статус исполнения',
    problemRu: 'QC нужен в Order Production, но не должен оставаться peer/demo состоянием без записи в canonical flow.',
    fixRu: 'Добавить canonical QC status write/read через W2 BFF/PG и отразить его в brand OP + shop tracking.',
    acceptanceRu: [
      'QC отображается в Brand OP как рабочий этап.',
      'QC status сохраняется и читается из canonical write-path.',
      'Shop tracking видит QC без отдельного factory/extended перехода.',
    ],
  },
  {
    repairId: 'p0-order-production-packing-list',
    priority: 'P0',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['brand'],
    pillarId: 'order_production',
    actionIds: ['create_packing_list'],
    kind: ['ui', 'bff', 'docs', 'test'],
    titleRu: 'Packing List BFF + UI',
    problemRu: 'Packing/packing list отмечен как хвост fulfillment, но не является first-class UI baseline.',
    fixRu: 'Сделать packing list рабочей карточкой Order Production и подключить documents gateway.',
    acceptanceRu: [
      'Brand OP показывает packing list как этап после QC.',
      'Packing list использует documents gateway, а не локальный upload.',
      'Shop tracking получает buyer-facing summary отгрузки.',
    ],
  },
  {
    repairId: 'p0-order-production-acceptance-closeout',
    priority: 'P0',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['shop', 'brand'],
    pillarId: 'order_production',
    actionIds: ['accept_delivery', 'close_order'],
    kind: ['ui', 'bff', 'test'],
    titleRu: 'Shop acceptance + closeout',
    problemRu: 'После shipment магазин не имеет полноценного рабочего конца процесса: принять, отметить расхождения, закрыть заказ.',
    fixRu: 'Добавить buyer acceptance и closeout как финальные этапы Order Production без ухода в отдельный продукт.',
    acceptanceRu: [
      'Shop видит acceptance/closeout как продолжение tracking.',
      'Brand видит результат acceptance и финальный closeout state.',
      'Closeout возвращает заказ в завершённое состояние lifecycle.',
    ],
  },
  {
    repairId: 'p0-communications-collection-thread',
    priority: 'P0',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['brand', 'shop'],
    pillarId: 'comms',
    actionIds: ['open_collection_chat'],
    kind: ['ui', 'bff', 'test'],
    titleRu: 'Collection-level thread',
    problemRu: 'Коммуникации есть по article/order, но нет единой сезонной истории по collection.',
    fixRu: 'Добавить collection entity thread и ссылки из linesheet/showroom/matrix.',
    acceptanceRu: [
      'Collection thread доступен Brand и Shop.',
      'Linesheet, showroom и matrix ведут в один collection chat.',
      'Collection chat не создаёт отдельный чат-продукт вне Platform Core.',
    ],
  },
  {
    repairId: 'p1-documents-gateway-wiring',
    priority: 'P1',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['brand', 'shop'],
    pillarId: 'development',
    actionIds: ['open_dossier', 'create_packing_list'],
    kind: ['ui', 'bff', 'docs'],
    titleRu: 'Documents Gateway wiring',
    problemRu: 'Documents gateway существует, но UI не везде потребляет его как единственный вход к файлам.',
    fixRu: 'Подключить gateway к dossier, order documents, packing/closeout documents.',
    acceptanceRu: [
      'Нет новых прямых upload mechanisms в visible Platform Core.',
      'Dossier и packing/closeout используют один documents gateway.',
    ],
  },
  {
    repairId: 'p1-platform-core-datatable',
    priority: 'P1',
    status: 'READY_FOR_IMPLEMENTATION',
    roleIds: ['brand', 'shop'],
    pillarId: 'collection_order',
    actionIds: ['build_order_matrix', 'review_order'],
    kind: ['ui', 'design-system', 'test'],
    titleRu: 'Canonical PlatformCoreDataTable',
    problemRu: 'Registry/matrix/list surfaces используют разные table/empty state patterns.',
    fixRu: 'Ввести единый PlatformCoreDataTable для visible registries/lists без смены бизнес-логики.',
    acceptanceRu: [
      'Visible registries используют один table contract.',
      'Search/filter/loading/empty state согласованы.',
    ],
  },
] as const;

export function getPlatformCoreP0RepairQueue(): readonly PlatformCoreUiRepairQueueItem[] {
  return PLATFORM_CORE_UI_REPAIR_QUEUE.filter((item) => item.priority === 'P0');
}

export function getPlatformCoreRepairQueueActionIds(): PlatformCoreUiActionId[] {
  return [...new Set(PLATFORM_CORE_UI_REPAIR_QUEUE.flatMap((item) => [...item.actionIds]))];
}

export function getPlatformCoreRepairQueueByPillar(
  pillarId: CoreHubPillarId
): readonly PlatformCoreUiRepairQueueItem[] {
  return PLATFORM_CORE_UI_REPAIR_QUEUE.filter((item) => item.pillarId === pillarId);
}
