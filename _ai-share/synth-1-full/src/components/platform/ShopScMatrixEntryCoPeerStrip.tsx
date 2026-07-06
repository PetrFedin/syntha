'use client';

import Link from 'next/link';
import { buildPlatformB2bHubSession } from '@/lib/platform-core-ports/b2b/platform-b2b-hub';
import {
  WAVE_YP_PLATFORM_B2B_RU,
  WAVE_YP_SHOP_SC_MATRIX_ENTRY_CO_PEER_STRIP_TESTID,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Matrix entry · platform B2B + collaborative order peers. */
export function ShopScMatrixEntryCoPeerStrip({ collectionId, orderId }: Props) {
  const session = buildPlatformB2bHubSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_YP_SHOP_SC_MATRIX_ENTRY_CO_PEER_STRIP_TESTID}>
      <Link href={session.hubHref} data-testid="shop-sc-matrix-entry-platform-hub-link" className={hubGadget.goldenLink}>
        {WAVE_YP_PLATFORM_B2B_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.collaborativeHref} data-testid="shop-sc-matrix-entry-collaborative-link" className={hubGadget.goldenLink}>
        Совместный заказ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.replenishmentAtpHref} data-testid="shop-sc-matrix-entry-replenishment-link" className={hubGadget.goldenLink}>
        ATP
      </Link>
    </div>
  );
}
