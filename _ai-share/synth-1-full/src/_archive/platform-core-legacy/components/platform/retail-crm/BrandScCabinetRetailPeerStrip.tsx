'use client';

import Link from 'next/link';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_B2B_BASE } from '@/lib/platform-core-mode-surfaces';
import {
  ROUTES,
  shopB2bCheckoutCollectionHref,
  shopB2bMatrixReorderHref,
} from '@/lib/platform-core-routes';
import { SHOP_CORE_BUYER_PRESETS } from '@/lib/platform-core-ports/legacy/order/shop-core-buyer-context';
import {
  WAVE_WZ_BRAND_SC_RETAIL_PEER_STRIP_TESTID,
  WAVE_WZ_BRAND_SC_RETAIL_PLATFORM_RU,
  WAVE_WZ_BRAND_SC_RETAIL_SYNDICATION_RU,
} from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type Props = {
  collectionId: string;
  /** Wave WZ: matrix/checkout уже в golden path — только syndication + platform. */
  omitBuyPath?: boolean;
};

/** Brand SC cabinet · syndication + platform + shop buy path (multi-buyer). */
export function BrandScCabinetRetailPeerStrip({ collectionId, omitBuyPath = false }: Props) {
  const syndicationHref = platformCoreUiHref(
    `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=syndication&collection=${encodeURIComponent(collectionId)}`
  );
  const platformHubHref = `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`;

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_WZ_BRAND_SC_RETAIL_PEER_STRIP_TESTID}>
      <Link
        href={syndicationHref}
        data-testid="brand-sc-cabinet-syndication-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_WZ_BRAND_SC_RETAIL_SYNDICATION_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={platformHubHref}
        data-testid="brand-sc-cabinet-platform-hub-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_WZ_BRAND_SC_RETAIL_PLATFORM_RU}
      </Link>
      {omitBuyPath ? null : (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <div
            className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5"
            data-testid="brand-sc-cabinet-shop-buyer-matrix"
          >
            {SHOP_CORE_BUYER_PRESETS.map((preset, index) => (
              <span key={preset.id} className="inline-flex items-center gap-1">
                {index > 0 ? (
                  <span className={hubGadget.goldenSep} aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={shopB2bMatrixReorderHref(collectionId, undefined, { buyerId: preset.id })}
                  data-testid={`brand-sc-cabinet-shop-matrix-${preset.id}`}
                  className={hubGadget.goldenLink}
                >
                  Матрица · {preset.labelRu.split('·').pop()?.trim() ?? preset.id}
                </Link>
              </span>
            ))}
          </div>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <div
            className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5"
            data-testid="brand-sc-cabinet-shop-buyer-checkout"
          >
            {SHOP_CORE_BUYER_PRESETS.map((preset, index) => (
              <span key={preset.id} className="inline-flex items-center gap-1">
                {index > 0 ? (
                  <span className={hubGadget.goldenSep} aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={shopB2bCheckoutCollectionHref(collectionId, { buyerId: preset.id })}
                  data-testid={`brand-sc-cabinet-shop-checkout-${preset.id}`}
                  className={hubGadget.goldenLink}
                >
                  Оформление · {preset.labelRu.split('·').pop()?.trim() ?? preset.id}
                </Link>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
