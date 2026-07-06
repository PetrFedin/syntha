'use client';

import Link from 'next/link';
import {
  factoryMaterialsProcurementHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_DONE_RU,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_DONE_TESTID,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_RU,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_TESTID,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_PO_BADGE_TESTID,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_DONE_RU,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_PENDING_RU,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_TESTID,
} from '@/lib/platform/wave-wu-mfr-auto-material-request';

type Props = {
  orderId: string;
  collectionId: string;
  articleId: string;
  productionOrderId?: string;
  materialsDone: boolean;
};

/** Mfr OP materials · deep-link to supplier procurement PATCH (deduped RU strip). */
export function MfrOpMaterialsSupplierPatchStrip({
  orderId,
  collectionId,
  articleId,
  productionOrderId,
  materialsDone,
}: Props) {
  const href = factoryMaterialsProcurementHrefForDemo(
    {
      ...PLATFORM_CORE_DEMO,
      collectionId,
      demoArticleId: articleId,
      demoOrderId: orderId,
      productionOrderId: productionOrderId?.trim() || PLATFORM_CORE_DEMO.productionOrderId,
    },
    { role: 'supplier' }
  );

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_TESTID}
      data-audit-legacy="mfr-op-materials-supplier-hint"
    >
      <span className={hubGadget.muted} data-testid="mfr-op-materials-supplier-hint">
        {materialsDone
          ? WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_DONE_RU
          : WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_PENDING_RU}
      </span>
      {productionOrderId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <span
            className="font-mono text-[10px] text-text-muted"
            data-testid={WAVE_WU_MFR_MATERIALS_SUPPLIER_PO_BADGE_TESTID}
          >
            PO {productionOrderId}
          </span>
        </>
      ) : null}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={href}
        data-testid={
          materialsDone
            ? WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_DONE_TESTID
            : WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_TESTID
        }
        data-audit-legacy="mfr-op-materials-supplier-link"
        className={hubGadget.goldenLink}
      >
        {materialsDone
          ? WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_DONE_RU
          : WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_RU}
      </Link>
    </div>
  );
}
