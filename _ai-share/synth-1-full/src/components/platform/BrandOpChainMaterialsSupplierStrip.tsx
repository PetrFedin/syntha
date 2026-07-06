'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  BRAND_OP_CHAIN_MATERIALS_INVENTORY_LEDGER_LINK_TESTID,
  BRAND_OP_CHAIN_MATERIALS_PO_BADGE_TESTID,
  BRAND_OP_CHAIN_MATERIALS_SUPPLIER_STRIP_TESTID,
  buildBrandOpChainInventoryLedgerWmsHref,
  buildBrandOpChainMaterialsSupplierPatchHref,
  brandOpChainMaterialsInventoryLedgerLinkLabelRu,
  brandOpChainMaterialsSupplierLinkTestId,
} from '@/lib/platform-core-ports/fashion/brand-op-wave-xm';
import {
  brandOpChainMaterialsSuppliedPatchHintRu,
  brandOpChainMaterialsSuppliedPatchLinkLabelRu,
  WAVE_YH_BRAND_CHAIN_MATERIALS_PATCH_CHAIN_HINT_TESTID,
  WAVE_YH_BRAND_CHAIN_MATERIALS_SUPPLIED_STEP,
} from '@/lib/platform-core-ports/platform/wave-yh-wms-reserve-checkout';

type Props = {
  orderId: string;
  materialsDone: boolean;
  productionOrderId?: string;
  collectionId?: string;
};

/** Brand OP chain · deep-link to supplier procurement PATCH (materials_supplied, po=). */
export function BrandOpChainMaterialsSupplierStrip({
  orderId,
  materialsDone,
  productionOrderId,
  collectionId,
}: Props) {
  const poId = productionOrderId?.trim() || undefined;
  const href = buildBrandOpChainMaterialsSupplierPatchHref({
    orderId,
    productionOrderId: poId,
    collectionId,
  });
  const inventoryHref = buildBrandOpChainInventoryLedgerWmsHref({
    orderId,
    productionOrderId: poId,
    collectionId,
  });

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={BRAND_OP_CHAIN_MATERIALS_SUPPLIER_STRIP_TESTID}
      data-chain-step={WAVE_YH_BRAND_CHAIN_MATERIALS_SUPPLIED_STEP}
      data-materials-supplied={materialsDone ? 'done' : 'pending'}
    >
      <span className={hubGadget.muted}>
        {materialsDone ? 'Материалы подтверждены поставщиком' : 'Подтверждение поставки у поставщика'}
      </span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <span
        className="text-text-muted text-[10px]"
        data-testid={WAVE_YH_BRAND_CHAIN_MATERIALS_PATCH_CHAIN_HINT_TESTID}
      >
        {brandOpChainMaterialsSuppliedPatchHintRu(materialsDone)}
      </span>
      {poId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <span
            className="font-mono text-[10px] text-text-muted"
            data-testid={BRAND_OP_CHAIN_MATERIALS_PO_BADGE_TESTID}
          >
            PO {poId}
          </span>
        </>
      ) : null}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={href}
        data-testid={brandOpChainMaterialsSupplierLinkTestId(materialsDone)}
        className={hubGadget.goldenLink}
        data-chain-step={WAVE_YH_BRAND_CHAIN_MATERIALS_SUPPLIED_STEP}
      >
        {brandOpChainMaterialsSuppliedPatchLinkLabelRu(materialsDone)}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={inventoryHref}
        data-testid={BRAND_OP_CHAIN_MATERIALS_INVENTORY_LEDGER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {brandOpChainMaterialsInventoryLedgerLinkLabelRu()}
      </Link>
    </div>
  );
}
