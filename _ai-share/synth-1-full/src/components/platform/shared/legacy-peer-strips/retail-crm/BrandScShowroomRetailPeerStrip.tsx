'use client';

import Link from 'next/link';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_B2B_BASE } from '@/lib/platform-core-mode-surfaces';
import { ROUTES } from '@/lib/platform-core-routes';
import {
  WAVE_YP_BRAND_SC_SHOWROOM_RETAIL_PEER_STRIP_TESTID,
  WAVE_YP_LINESHEETS_RU,
  WAVE_YP_PLATFORM_B2B_RU,
  WAVE_YP_RELEASE_GATE_RU,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type Props = {
  collectionId: string;
  /** Wave YR/VC: скрыть plain matrix — open-shop btn-only prefill primary. */
  omitMatrixPrefillCta?: boolean;
};

/** Brand showroom · linesheets + release + platform + shop monetization. */
export function BrandScShowroomRetailPeerStrip({
  collectionId,
  omitMatrixPrefillCta = false,
}: Props) {
  const linesheetsHref = `/brand/linesheets?collection=${encodeURIComponent(collectionId)}`;
  const releaseGateHref = platformCoreUiHref(
    `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=checklist&collection=${encodeURIComponent(collectionId)}`
  );
  const platformHubHref = `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`;
  const matrixHref = platformCoreUiHref(
    `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`
  );
  const checkoutHref = platformCoreUiHref(
    `${ROUTES.shop.b2bCheckout}?collection=${encodeURIComponent(collectionId)}`
  );

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_YP_BRAND_SC_SHOWROOM_RETAIL_PEER_STRIP_TESTID}
    >
      <Link
        href={linesheetsHref}
        data-testid="brand-sc-showroom-linesheets-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_LINESHEETS_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={releaseGateHref}
        data-testid="brand-sc-showroom-release-gate-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_RELEASE_GATE_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={platformHubHref}
        data-testid="brand-sc-showroom-platform-hub-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_PLATFORM_B2B_RU}
      </Link>
      {omitMatrixPrefillCta ? null : (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={matrixHref}
            data-testid="brand-sc-showroom-shop-matrix-link"
            className={hubGadget.goldenLink}
          >
            Матрица магазина
          </Link>
        </>
      )}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={checkoutHref}
        data-testid="brand-sc-showroom-shop-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
    </div>
  );
}
