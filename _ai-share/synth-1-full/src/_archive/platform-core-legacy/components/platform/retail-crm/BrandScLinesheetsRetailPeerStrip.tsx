'use client';

import Link from 'next/link';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/platform-core-routes';
import {
  WAVE_YP_BRAND_SC_LINESHEETS_RETAIL_PEER_STRIP_TESTID,
  WAVE_YP_RELEASE_GATE_RU,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type Props = {
  collectionId: string;
  /** Wave YR: скрыть plain matrix — open-shop prefill CTA primary. */
  omitMatrixPrefillCta?: boolean;
};

/** Linesheets · release gate + shop monetization spine peers. */
export function BrandScLinesheetsRetailPeerStrip({
  collectionId,
  omitMatrixPrefillCta = false,
}: Props) {
  const releaseGateHref = platformCoreUiHref(`${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=techpack-gate&collection=${encodeURIComponent(collectionId)}`);
  const matrixHref = platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`);
  const checkoutHref = platformCoreUiHref(`${ROUTES.shop.b2bCheckout}?collection=${encodeURIComponent(collectionId)}`);

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_YP_BRAND_SC_LINESHEETS_RETAIL_PEER_STRIP_TESTID}>
      <Link
        href={releaseGateHref}
        data-testid="brand-sc-linesheets-release-gate-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_RELEASE_GATE_RU}
      </Link>
      {omitMatrixPrefillCta ? null : (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={matrixHref}
            data-testid="brand-sc-linesheets-shop-matrix-link"
            className={hubGadget.goldenLink}
          >
            Матрица магазина
          </Link>
        </>
      )}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="brand-sc-linesheets-shop-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
    </div>
  );
}
