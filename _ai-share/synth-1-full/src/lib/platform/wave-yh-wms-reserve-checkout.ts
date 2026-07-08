/**
 * Wave YH — S3 WMS inventory reserve: shop checkout live badge, brand ledger reserve qty cross-link,
 * supplier materials_supplied PATCH chain polish (extends wave SQ/TX/UX/VE/XM).
 */
import {
  buildBrandOpInventoryLedgerSession,
  sumWmsReservedQty,
} from '@/lib/b2b/brand-op-inventory-ledger-session';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import {
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemoByOrderId,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import {
  formatPlatformCoreWmsReserveDoneWithQtyRu,
  PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU,
} from '@/lib/platform-core-wms-reserve-copy';

export const WAVE_YH_SHOP_CO_CHECKOUT_INVENTORY_HOLD_TESTID = 'shop-co-checkout-inventory-hold';
export const WAVE_YH_SHOP_CO_CHECKOUT_INVENTORY_BADGE_TESTID = 'shop-co-checkout-inventory-badge';
export const WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_LIVE_BADGE_TESTID =
  'shop-co-checkout-wms-reserve-live-badge';
export const WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_QTY_LINK_TESTID =
  'shop-co-checkout-wms-reserve-qty-link';
export const WAVE_YH_SHOP_CO_CHECKOUT_INVENTORY_S3_LINK_TESTID =
  'shop-co-checkout-inventory-s3-link';

export const WAVE_YH_BRAND_INVENTORY_LEDGER_RESERVE_QTY_LINK_TESTID =
  'brand-op-inventory-ledger-wms-reserve-qty-link';
export const WAVE_YH_BRAND_CHAIN_MATERIALS_SUPPLIED_STEP = 'materials_supplied' as const;
export const WAVE_YH_BRAND_CHAIN_MATERIALS_PATCH_CHAIN_HINT_TESTID =
  'brand-op-chain-materials-supplied-patch-hint';

export const WAVE_YH_CHECKOUT_WMS_RESERVE_HONEST_ATTR = 'data-reserve-honest';
export const WAVE_YH_CHECKOUT_WMS_RESERVE_PHASE_PRE_HANDOFF = 'pre-handoff' as const;

export const WAVE_YH_SHOP_CHECKOUT_STOCK_ATP_API = '/api/shop/b2b/replenishment/stock-atp';
export const WAVE_YH_B2B_INVENTORY_RESERVE_API = '/api/workshop2/b2b/orders';

export type ShopCheckoutWmsAtpRow = {
  sku?: string;
  reserved?: number;
  atp?: number;
};

/** Sum WMS/PG reserved qty from checkout stock-atp rows (live, no stub claim). */
export function sumShopCheckoutWmsReservedFromAtpRows(
  rows: ReadonlyArray<ShopCheckoutWmsAtpRow>
): number {
  return rows.reduce((acc, row) => {
    const reserved = row.reserved != null ? Number(row.reserved) : 0;
    return acc + (Number.isFinite(reserved) && reserved > 0 ? reserved : 0);
  }, 0);
}

/** Live WMS reserve badge on checkout — ATP + reserved qty from stock-atp (wave YH). */
export function formatShopCheckoutWmsReserveLiveBadgeRu(input: {
  loading: boolean;
  liveWms: boolean;
  reservedQty: number;
  atpTotal: number;
}): string {
  if (input.loading) return 'Склад · проверка…';
  if (input.liveWms && input.reservedQty > 0) {
    return `WMS резерв ${input.reservedQty.toLocaleString('ru-RU')} ед.`;
  }
  if (input.liveWms && input.atpTotal > 0) {
    return `Доступно ${input.atpTotal.toLocaleString('ru-RU')} ед.`;
  }
  return 'Склад · ожидание резерва';
}

export function formatShopCheckoutWmsReserveLiveDetailRu(input: {
  liveWms: boolean;
  reservedQty: number;
  atpTotal: number;
}): string | null {
  if (!input.liveWms) return null;
  const parts: string[] = [];
  if (input.reservedQty > 0) {
    parts.push(`резерв WMS: ${input.reservedQty.toLocaleString('ru-RU')} ед.`);
  }
  if (input.atpTotal > 0) {
    parts.push(`ATP: ${input.atpTotal.toLocaleString('ru-RU')} ед.`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function buildShopCheckoutWmsBalancesHref(collectionId: string, articleId?: string): string {
  const article = articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  return `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(article)}/wms/balances`;
}

export function buildShopCheckoutInventoryReserveProbeHref(orderId: string): string {
  return `${WAVE_YH_B2B_INVENTORY_RESERVE_API}/${encodeURIComponent(orderId.trim())}/inventory-reserve`;
}

/** Brand ledger strip — cross-link label with live reserve qty (wave YH). */
export function formatBrandInventoryLedgerReserveQtyCrossLinkRu(
  reservedQty: number | null
): string {
  if (reservedQty != null && reservedQty > 0) {
    return `Резерв ${reservedQty.toLocaleString('ru-RU')} ед. → WMS API`;
  }
  return 'Резерв WMS · balances API →';
}

export function formatBrandInventoryLedgerReserveQtyBadgeRu(reservedQty: number | null): string {
  if (reservedQty != null && reservedQty > 0) {
    return formatPlatformCoreWmsReserveDoneWithQtyRu(reservedQty);
  }
  return 'Резерв WMS · ожидание';
}

/** Supplier PATCH chain link polish — materials_supplied step (wave YH). */
export function brandOpChainMaterialsSuppliedPatchHintRu(materialsDone: boolean): string {
  return materialsDone
    ? 'materials_supplied ✓ · резерв B2B синхронизирован с ledger'
    : 'materials_supplied · PATCH поставщика подтверждает отгрузку и bump chain-status';
}

export function brandOpChainMaterialsSuppliedPatchLinkLabelRu(materialsDone: boolean): string {
  return materialsDone
    ? 'Закупка поставщика · materials_supplied'
    : 'PATCH поставщика · materials_supplied →';
}

export function brandOpChainMaterialsInventoryLedgerReserveLinkLabelRu(
  reservedQty?: number | null
): string {
  if (reservedQty != null && reservedQty > 0) {
    return `Резерв WMS ${reservedQty.toLocaleString('ru-RU')} ед. · ledger →`;
  }
  return 'Резерв WMS · ledger →';
}

export function supplierPatchHrefCarriesMaterialsSuppliedContext(href: string): boolean {
  return href.includes('view=procurement') && href.includes('role=supplier');
}

export function resolveWaveYhBrandLedgerReservedQtyFromBalances(
  balances: ReadonlyArray<{ qtyReserved?: number; qty_reserved?: number }> | undefined
): number {
  if (!balances?.length) return 0;
  return sumWmsReservedQty(balances);
}

export function buildWaveYhBrandInventoryLedgerSession(input?: {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  productionOrderId?: string;
}) {
  return buildBrandOpInventoryLedgerSession(input);
}

export function buildWaveYhShopCheckoutInventoryOpsSession(collectionId: string, orderId?: string) {
  return buildShopInventoryOpsSession({ collectionId, orderId });
}

export function buildWaveYhSupplierProcurementPatchHref(input?: {
  orderId?: string;
  productionOrderId?: string;
  collectionId?: string;
  articleId?: string;
}): string {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const demo = getPlatformCoreDemoByOrderId(orderId);
  return factoryMaterialsProcurementHrefForDemo(
    {
      ...demo,
      demoOrderId: orderId,
      productionOrderId: input?.productionOrderId?.trim() || demo.productionOrderId,
      collectionId: input?.collectionId?.trim() || demo.collectionId,
      demoArticleId: input?.articleId?.trim() || demo.demoArticleId,
    },
    { role: 'supplier' }
  );
}

export const WAVE_YH_CHECKOUT_RESERVE_COPY_RU = PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU;
