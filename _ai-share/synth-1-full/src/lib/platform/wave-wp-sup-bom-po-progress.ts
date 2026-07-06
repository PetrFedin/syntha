/**
 * Wave WP — supplier BOM×PO progress + bulk-confirm dedup + brand push on PATCH + inventory ledger peer (RU + testids).
 */
import { buildBrandOpInventoryLedgerSession } from '@/lib/b2b/brand-op-inventory-ledger-session';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';

export const WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID = 'sup-op-bom-po-progress';
export const WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_TESTID =
  'sup-op-bom-po-bulk-confirm-dedup-hint';
export const WAVE_WP_SUP_PROCUREMENT_CHAIN_STEPS_TESTID = 'sup-op-procurement-chain-steps';
export const WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID =
  'sup-op-procurement-brand-inventory-ledger-peer-strip';
export const WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_LINK_TESTID =
  'sup-op-procurement-brand-inventory-ledger-link';

export const WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_RU =
  'Подтверждение поставки — через блок «Частичная отгрузка» (без дубля bulk-confirm в BOM×PO).';

export const WAVE_WP_SUP_PROCUREMENT_CHAIN_TITLE_RU = 'Этапы цепочки · закупка';

export const WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_LABEL_RU = 'Резерв бренда · ledger';

export const WAVE_WP_SUP_MATERIALS_PATCH_API = '/api/workshop2/supplier/material-request';
export const WAVE_WP_SUP_BRAND_NOTIFICATION_EVENTS_API = '/api/platform-core/notification-events';
export const WAVE_WP_SUP_BRAND_PUSH_NOTIFICATION_KIND = 'materials_supplied' as const;

export function buildSupOpMaterialsPatchApiHref(requisitionId: string): string {
  const id = requisitionId.trim();
  return `${WAVE_WP_SUP_MATERIALS_PATCH_API}/${encodeURIComponent(id)}`;
}

export function buildSupOpBrandNotificationEventsQuery(orderId: string, limit = 5): string {
  const params = new URLSearchParams({
    role: 'brand',
    orderId: orderId.trim(),
    limit: String(limit),
  });
  return `${WAVE_WP_SUP_BRAND_NOTIFICATION_EVENTS_API}?${params.toString()}`;
}

export function shouldShowSupOpBomPoBulkConfirmDedupHint(input: {
  platformCoreMode: boolean;
  role: string;
  showPartialShipStrip: boolean;
  materialsConfirmed: boolean;
  poQty: number;
  handoffReady: boolean;
}): boolean {
  return (
    input.platformCoreMode &&
    input.role === 'supplier' &&
    input.showPartialShipStrip &&
    !input.materialsConfirmed &&
    input.poQty > 0 &&
    input.handoffReady
  );
}

export function shouldShowSupOpProcurementChainStepsStrip(input: {
  platformCoreMode: boolean;
  role: string;
  view: string;
  chainStepsCount: number;
}): boolean {
  return (
    input.platformCoreMode &&
    input.role === 'supplier' &&
    input.view === 'procurement' &&
    input.chainStepsCount > 0
  );
}

export function shouldShowSupOpBrandInventoryLedgerPeer(input: {
  platformCoreMode: boolean;
  role: string;
  view: string;
  materialsConfirmed: boolean;
}): boolean {
  return (
    input.platformCoreMode &&
    input.role === 'supplier' &&
    input.view === 'procurement' &&
    input.materialsConfirmed
  );
}

export function resolveSupOpBomPoProgressSummaryRu(input: {
  poQty: number;
  bomFilledCount: number;
  bomTotalCount: number;
}): string {
  if (input.poQty <= 0) {
    return 'Ожидание передачи в производство от бренда';
  }
  if (input.bomTotalCount > 0 && input.bomFilledCount === input.bomTotalCount) {
    return 'BOM готов к расчёту потребности под серию';
  }
  return 'Дозаполните спецификацию в досье';
}

export function buildSupOpBrandInventoryLedgerPeerHref(input?: {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  productionOrderId?: string;
}): string {
  const session = buildBrandOpInventoryLedgerSession(input);
  const params = new URLSearchParams({
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'overview',
    collection: session.collectionId,
    order: session.orderId,
  });
  if (session.articleId) params.set('article', session.articleId);
  if (session.productionOrderId) params.set('po', session.productionOrderId);
  return `${ROUTES.brand.inventory}?${params.toString()}`;
}
