/**
 * Wave XM — brand OP chain PO materials → supplier PATCH (po=),
 * SSE dedup polish (Wave VQ), inventory ledger WMS reserve cross-link.
 */
import {
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemoByOrderId,
} from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';

export const BRAND_OP_CHAIN_MATERIALS_SUPPLIER_STRIP_TESTID =
  'brand-op-chain-materials-supplier-strip';
export const BRAND_OP_CHAIN_MATERIALS_PO_BADGE_TESTID = 'brand-op-chain-materials-po-badge';
export const BRAND_OP_CHAIN_MATERIALS_SUPPLIER_LINK_PATCH_TESTID =
  'brand-op-chain-materials-supplier-link-patch';
export const BRAND_OP_CHAIN_MATERIALS_SUPPLIER_LINK_DONE_TESTID =
  'brand-op-chain-materials-supplier-link-done';
export const BRAND_OP_CHAIN_MATERIALS_STEP_LINK_PATCH_TESTID =
  'brand-op-chain-materials-supplier-link-step-patch';
export const BRAND_OP_CHAIN_MATERIALS_STEP_LINK_DONE_TESTID =
  'brand-op-chain-materials-supplier-link-step-done';
export const BRAND_OP_CHAIN_MATERIALS_INVENTORY_LEDGER_LINK_TESTID =
  'brand-op-chain-materials-inventory-ledger-link';
export const BRAND_OP_CHAIN_MATERIALS_SSE_DEDUP_HINT_TESTID =
  'brand-op-chain-materials-sse-dedup-hint';

export function buildBrandOpChainMaterialsSupplierPatchHref(input: {
  orderId: string;
  productionOrderId?: string;
  collectionId?: string;
  articleId?: string;
}): string {
  const orderId = input.orderId.trim();
  const demo = getPlatformCoreDemoByOrderId(orderId);
  return factoryMaterialsProcurementHrefForDemo(
    {
      ...demo,
      demoOrderId: orderId,
      productionOrderId: input.productionOrderId?.trim() || demo.productionOrderId,
      collectionId: input.collectionId?.trim() || demo.collectionId,
      demoArticleId: input.articleId?.trim() || demo.demoArticleId,
    },
    { role: 'supplier' }
  );
}

export function buildBrandOpChainInventoryLedgerWmsHref(input: {
  orderId: string;
  productionOrderId?: string;
  collectionId?: string;
  articleId?: string;
}): string {
  const orderId = input.orderId.trim();
  const demo = getPlatformCoreDemoByOrderId(orderId);
  const collectionId = input.collectionId?.trim() || demo.collectionId;
  const articleId = input.articleId?.trim() || demo.demoArticleId;
  const productionOrderId = input.productionOrderId?.trim() || demo.productionOrderId;
  const params = new URLSearchParams({
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'overview',
    collection: collectionId,
    order: orderId,
  });
  if (articleId) params.set('article', articleId);
  if (productionOrderId) params.set('po', productionOrderId);
  return `${ROUTES.brand.inventory}?${params.toString()}`;
}

export function brandOpChainMaterialsSupplierLinkTestId(materialsDone: boolean): string {
  return materialsDone
    ? BRAND_OP_CHAIN_MATERIALS_SUPPLIER_LINK_DONE_TESTID
    : BRAND_OP_CHAIN_MATERIALS_SUPPLIER_LINK_PATCH_TESTID;
}

export function brandOpChainMaterialsStepLinkTestId(materialsDone: boolean): string {
  return materialsDone
    ? BRAND_OP_CHAIN_MATERIALS_STEP_LINK_DONE_TESTID
    : BRAND_OP_CHAIN_MATERIALS_STEP_LINK_PATCH_TESTID;
}

/** Compact hint on chain card — SSE dedup vs registry/cabinet strips (Wave VQ). */
export function brandOpChainMaterialsSseDedupHintRu(): string {
  return 'SSE live — на карточке цепочки; реестр/кабинет — dedup strip (VQ). PATCH поставщика — ниже.';
}

export function brandOpChainMaterialsInventoryLedgerLinkLabelRu(): string {
  return 'Резерв WMS · ledger →';
}

export function supplierPatchHrefCarriesPoContext(
  href: string,
  productionOrderId: string
): boolean {
  const po = productionOrderId.trim();
  if (!po) return false;
  return href.includes(`po=${encodeURIComponent(po)}`);
}
