/**
 * Platform Core Lifecycle Map
 *
 * Canonical Brand ↔ Shop action sequence for the two-role baseline.
 * This is not a route file and not a UI component: it is a product-flow contract
 * used to prevent orphan tabs, disconnected CTAs and duplicated primary actions.
 */
import type { PlatformCoreUiActionId } from '@/lib/platform-core-ui-action-contracts';

export type PlatformCoreLifecycleStageId =
  | 'development'
  | 'sample_collection'
  | 'collection_order'
  | 'order_production'
  | 'communications';

export type PlatformCoreLifecycleMapStep = {
  step: number;
  stageId: PlatformCoreLifecycleStageId;
  actionId: PlatformCoreUiActionId;
  requiredForCommercialRollout: boolean;
  isPending: boolean;
  labelRu: string;
};

export const PLATFORM_CORE_LIFECYCLE_ACTION_MAP: readonly PlatformCoreLifecycleMapStep[] = [
  {
    step: 1,
    stageId: 'development',
    actionId: 'create_article',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Бренд создаёт артикул',
  },
  {
    step: 2,
    stageId: 'development',
    actionId: 'open_dossier',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Бренд доводит досье / ТЗ до готовности',
  },
  {
    step: 3,
    stageId: 'sample_collection',
    actionId: 'build_linesheet',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Бренд собирает лайншит',
  },
  {
    step: 4,
    stageId: 'sample_collection',
    actionId: 'publish_collection',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Бренд публикует коллекцию',
  },
  {
    step: 5,
    stageId: 'sample_collection',
    actionId: 'open_shop_showroom',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Магазин открывает витрину коллекции',
  },
  {
    step: 6,
    stageId: 'collection_order',
    actionId: 'build_order_matrix',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Магазин собирает матрицу заказа',
  },
  {
    step: 7,
    stageId: 'collection_order',
    actionId: 'submit_order',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Магазин отправляет заказ',
  },
  {
    step: 8,
    stageId: 'collection_order',
    actionId: 'review_order',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Бренд рассматривает и подтверждает заказ',
  },
  {
    step: 9,
    stageId: 'collection_order',
    actionId: 'request_revision',
    requiredForCommercialRollout: true,
    isPending: true,
    labelRu: 'Бренд и магазин согласуют правку заказа',
  },
  {
    step: 10,
    stageId: 'order_production',
    actionId: 'handoff_order',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Бренд передаёт заказ в исполнение',
  },
  {
    step: 11,
    stageId: 'order_production',
    actionId: 'write_qc_gate',
    requiredForCommercialRollout: true,
    isPending: true,
    labelRu: 'Бренд фиксирует QC',
  },
  {
    step: 12,
    stageId: 'order_production',
    actionId: 'create_packing_list',
    requiredForCommercialRollout: true,
    isPending: true,
    labelRu: 'Бренд создаёт packing list',
  },
  {
    step: 13,
    stageId: 'order_production',
    actionId: 'accept_delivery',
    requiredForCommercialRollout: true,
    isPending: true,
    labelRu: 'Магазин принимает поставку',
  },
  {
    step: 14,
    stageId: 'order_production',
    actionId: 'close_order',
    requiredForCommercialRollout: true,
    isPending: true,
    labelRu: 'Магазин закрывает заказ',
  },
  {
    step: 15,
    stageId: 'communications',
    actionId: 'open_collection_chat',
    requiredForCommercialRollout: true,
    isPending: true,
    labelRu: 'Стороны ведут единую историю коллекции',
  },
  {
    step: 16,
    stageId: 'communications',
    actionId: 'open_order_chat',
    requiredForCommercialRollout: true,
    isPending: false,
    labelRu: 'Стороны ведут историю заказа',
  },
] as const;

export function getPlatformCoreLifecyclePendingActionIds(): PlatformCoreUiActionId[] {
  return PLATFORM_CORE_LIFECYCLE_ACTION_MAP.filter((step) => step.isPending).map((step) => step.actionId);
}

export function getPlatformCoreLifecycleActiveActionIds(): PlatformCoreUiActionId[] {
  return PLATFORM_CORE_LIFECYCLE_ACTION_MAP.filter((step) => !step.isPending).map((step) => step.actionId);
}

export function getPlatformCoreLifecycleCommercialGapCount(): number {
  return PLATFORM_CORE_LIFECYCLE_ACTION_MAP.filter(
    (step) => step.requiredForCommercialRollout && step.isPending
  ).length;
}
