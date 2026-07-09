import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import type { PlatformCoreUiActionId } from '@/lib/platform-core-ui-action-contracts';
import type { PlatformCoreRepairKind } from '@/lib/platform-core-ui-repair-queue';

export type PlatformCoreP0ImplementationTrack =
  | 'sample_collection_publish'
  | 'collection_order_revision'
  | 'order_production_tail'
  | 'communications_collection_thread';

export type PlatformCoreP0ImplementationCutItem = {
  order: number;
  track: PlatformCoreP0ImplementationTrack;
  pillarId: CoreHubPillarId;
  actionIds: readonly PlatformCoreUiActionId[];
  sectionIds: readonly string[];
  kind: readonly PlatformCoreRepairKind[];
  titleRu: string;
  whyFirstRu: string;
  doneWhenRu: readonly string[];
};

/**
 * Phase 23 P0 implementation cut.
 *
 * This is the execution order for the first real product repair wave. It is
 * deliberately smaller than the full repair queue: no new roles, no advanced
 * B2B, no cosmetic-only work before the commercial lifecycle gaps.
 */
export const PLATFORM_CORE_P0_IMPLEMENTATION_CUT: readonly PlatformCoreP0ImplementationCutItem[] = [
  {
    order: 1,
    track: 'sample_collection_publish',
    pillarId: 'sample_collection',
    actionIds: ['publish_collection'],
    sectionIds: ['brand-sc-linesheets', 'brand-sc-showroom', 'brand-sc-publish', 'shop-sc-showroom'],
    kind: ['ui', 'test'],
    titleRu: 'Publish becomes the primary Sample Collection action',
    whyFirstRu:
      'Без ясной публикации магазин не получает нормальный вход в showroom и matrix. Это самый короткий путь к рабочему Brand → Shop handoff.',
    doneWhenRu: [
      'Brand sample_collection имеет один primary CTA publish_collection.',
      'После publish пользователь видит следующий шаг в shop showroom/matrix.',
      'Локальные publish/preview/export дубли не конкурируют с primary CTA.',
    ],
  },
  {
    order: 2,
    track: 'collection_order_revision',
    pillarId: 'collection_order',
    actionIds: ['request_revision'],
    sectionIds: ['shop-co-detail', 'brand-co-detail', 'brand-co-registry', 'shop-co-registry'],
    kind: ['ui', 'bff', 'test'],
    titleRu: 'Revision is part of the Collection Order flow',
    whyFirstRu:
      'Коммерческий заказ без согласования правок будет ломаться в реальной сети. Revision должен вернуться в 12-step flow, а не жить отдельным хвостом.',
    doneWhenRu: [
      'Brand и Shop видят один revision state.',
      'Revision approve возвращает заказ в confirm/handoff path.',
      'Revision не открывает отдельный продукт и не требует extended roles.',
    ],
  },
  {
    order: 3,
    track: 'order_production_tail',
    pillarId: 'order_production',
    actionIds: ['write_qc_gate', 'create_packing_list', 'accept_delivery', 'close_order'],
    sectionIds: [
      'brand-op-handoff',
      'brand-op-registry',
      'brand-op-dossier',
      'shop-co-buyer-tracking',
      'brand-op-qc',
      'brand-op-packing',
      'shop-op-acceptance',
      'shop-op-closeout',
    ],
    kind: ['ui', 'bff', 'db', 'docs', 'test'],
    titleRu: 'Order Production tail becomes a real closeable workflow',
    whyFirstRu:
      'Order Production был самым слабым столпом: без QC, packing, acceptance и closeout платформа выглядит как витрина без склада.',
    doneWhenRu: [
      'QC status пишется и читается через canonical W2 path.',
      'Packing list подключён к documents gateway.',
      'Shop tracking заканчивается acceptance/closeout, а не тупиком.',
    ],
  },
  {
    order: 4,
    track: 'communications_collection_thread',
    pillarId: 'comms',
    actionIds: ['open_collection_chat'],
    sectionIds: ['brand-cm-collection-chat', 'shop-cm-collection-chat', 'brand-sc-linesheets', 'shop-sc-showroom'],
    kind: ['ui', 'bff', 'test'],
    titleRu: 'Collection-level thread connects seasonal communication',
    whyFirstRu:
      'Без collection thread история сезона распадается между article/order чатами. Для коммерческой закупки нужен единый контекст коллекции.',
    doneWhenRu: [
      'Collection thread доступен Brand и Shop.',
      'Linesheet, showroom и matrix ведут в один collection chat.',
      'Order/article chats остаются contextual, но не заменяют seasonal history.',
    ],
  },
] as const;

export function getPlatformCoreP0ImplementationCutByTrack(track: PlatformCoreP0ImplementationTrack) {
  return PLATFORM_CORE_P0_IMPLEMENTATION_CUT.find((item) => item.track === track);
}

export function getPlatformCoreP0ImplementationCutActionIds(): PlatformCoreUiActionId[] {
  return [...new Set(PLATFORM_CORE_P0_IMPLEMENTATION_CUT.flatMap((item) => [...item.actionIds]))];
}

export function getPlatformCoreP0ImplementationCutSectionIds(): string[] {
  return [...new Set(PLATFORM_CORE_P0_IMPLEMENTATION_CUT.flatMap((item) => [...item.sectionIds]))];
}
