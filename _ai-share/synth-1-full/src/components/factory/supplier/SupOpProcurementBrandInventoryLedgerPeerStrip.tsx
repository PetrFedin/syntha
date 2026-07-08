'use client';

import Link from 'next/link';
import {
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_LINK_TESTID,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_LABEL_RU,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID,
  buildSupOpBrandInventoryLedgerPeerHref,
} from '@/lib/platform/wave-wp-sup-bom-po-progress';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId: string;
  productionOrderId?: string;
};

/** Supplier procurement · peer to brand OP inventory ledger after materials PATCH. */
export function SupOpProcurementBrandInventoryLedgerPeerStrip({
  collectionId,
  articleId,
  orderId,
  productionOrderId,
}: Props) {
  const ledgerHref = buildSupOpBrandInventoryLedgerPeerHref({
    collectionId,
    articleId,
    orderId,
    productionOrderId,
  });

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID}
    >
      <Link
        href={ledgerHref}
        data-testid={WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_LABEL_RU}
      </Link>
    </div>
  );
}
