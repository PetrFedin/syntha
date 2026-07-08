/**
 * Регламент бренда: что магазин видит после отправки заказа (столп collection_order · buyer-tracking).
 * ADR-002 appendix · ShopProductionVisibility
 *
 * Уровни (env NEXT_PUBLIC_SHOP_PRODUCTION_VISIBILITY, default milestones):
 * - none: shop_sent + brand_confirmed
 * - milestones: + production_po (без PO id / factory / materials)
 * - logistics: + inventory_reserved + shipment/WIP strips
 * - full: все шаги chain + PO id + materials
 *
 * BFF: chain-status-batch buyerView=true · pillar-snapshot shop variant.
 */

export type ShopProductionVisibility = 'none' | 'milestones' | 'logistics' | 'full';

export type ShopBuyerChainStepId =
  | 'shop_sent'
  | 'brand_confirmed'
  | 'inventory_reserved'
  | 'production_po'
  | 'materials_supplied';

export type ShopProductionVisibilityPolicy = {
  visibility: ShopProductionVisibility;
  visibleStepIds: ReadonlySet<string>;
  showProductionOrderId: boolean;
  showFactoryDetails: boolean;
  showMaterialsStep: boolean;
  showInventoryReserve: boolean;
  showWipDetail: boolean;
  showShipmentTracking: boolean;
};

const STEP_SETS: Record<ShopProductionVisibility, readonly ShopBuyerChainStepId[]> = {
  none: ['shop_sent', 'brand_confirmed'],
  milestones: ['shop_sent', 'brand_confirmed', 'production_po'],
  logistics: ['shop_sent', 'brand_confirmed', 'production_po', 'inventory_reserved'],
  full: [
    'shop_sent',
    'brand_confirmed',
    'inventory_reserved',
    'production_po',
    'materials_supplied',
  ],
};

export const DEFAULT_SHOP_PRODUCTION_VISIBILITY: ShopProductionVisibility = 'milestones';

export const SHOP_PRODUCTION_VISIBILITY_LABELS_RU: Record<ShopProductionVisibility, string> = {
  none: 'Только статус заказа',
  milestones: 'Этапы без деталей производства',
  logistics: 'Этапы + логистика и резерв',
  full: 'Полная прозрачность',
};

export const SHOP_PRODUCTION_VISIBILITY_HINTS_RU: Record<ShopProductionVisibility, string> = {
  none: 'Магазин видит отправку и подтверждение бренда.',
  milestones: 'Магазин видит этапы PO без номера и материалов (рекомендуется).',
  logistics: 'Добавляются резерв склада, отгрузка и WIP-полоски.',
  full: 'PO id, материалы, factory — полная цепочка.',
};

export function isShopProductionVisibility(value: string): value is ShopProductionVisibility {
  return value === 'none' || value === 'milestones' || value === 'logistics' || value === 'full';
}

export function parseShopProductionVisibilityFromMetadata(
  metadata: unknown
): ShopProductionVisibility | undefined {
  const root = metadata as { b2bDisclosure?: { shopProductionVisibility?: string } } | null;
  const raw = root?.b2bDisclosure?.shopProductionVisibility;
  return raw && isShopProductionVisibility(raw) ? raw : undefined;
}

function resolveVisibility(override?: ShopProductionVisibility): ShopProductionVisibility {
  const raw =
    override ??
    (typeof process !== 'undefined'
      ? (process.env.NEXT_PUBLIC_SHOP_PRODUCTION_VISIBILITY as ShopProductionVisibility | undefined)
      : undefined) ??
    DEFAULT_SHOP_PRODUCTION_VISIBILITY;
  return raw in STEP_SETS ? raw : DEFAULT_SHOP_PRODUCTION_VISIBILITY;
}

export function getShopProductionVisibilityPolicy(
  override?: ShopProductionVisibility
): ShopProductionVisibilityPolicy {
  const visibility = resolveVisibility(override);
  const visibleStepIds = new Set<string>(STEP_SETS[visibility]);
  return {
    visibility,
    visibleStepIds,
    showProductionOrderId: visibility === 'full',
    showFactoryDetails: visibility === 'full',
    showMaterialsStep: visibility === 'full',
    showInventoryReserve: visibility === 'logistics' || visibility === 'full',
    showWipDetail: visibility === 'logistics' || visibility === 'full',
    showShipmentTracking: visibility !== 'none',
  };
}

export function filterChainStepsForShopBuyer<
  T extends { id: string; labelRu?: string; done?: boolean },
>(steps: T[] | undefined, policy = getShopProductionVisibilityPolicy()): T[] {
  if (!steps?.length) return [];
  return steps.filter((s) => policy.visibleStepIds.has(s.id));
}

export type ShopBuyerChainLike = {
  steps?: Array<{ id: string; labelRu: string; done: boolean }>;
  productionOrderId?: string;
  factoryId?: string;
  poStatusLabelRu?: string;
  materialsSupplied?: boolean;
  inventoryReserved?: boolean;
  inventoryReservedQty?: number;
  inventoryReserveReason?: string;
};

/** Buyer view: фильтр шагов и redact PO/factory/materials по policy. */
export function applyShopBuyerChainVisibility<C extends ShopBuyerChainLike>(
  chain: C | null | undefined,
  policy = getShopProductionVisibilityPolicy()
): C | null {
  if (!chain) return null;
  const steps = filterChainStepsForShopBuyer(chain.steps, policy);
  return {
    ...chain,
    steps,
    productionOrderId: policy.showProductionOrderId ? chain.productionOrderId : undefined,
    factoryId: policy.showFactoryDetails ? chain.factoryId : undefined,
    poStatusLabelRu: policy.showProductionOrderId ? chain.poStatusLabelRu : undefined,
    materialsSupplied: policy.showMaterialsStep ? chain.materialsSupplied : undefined,
    inventoryReserved: policy.showInventoryReserve ? chain.inventoryReserved : false,
    inventoryReservedQty: policy.showInventoryReserve ? chain.inventoryReservedQty : undefined,
    inventoryReserveReason: policy.showInventoryReserve ? chain.inventoryReserveReason : undefined,
  };
}
