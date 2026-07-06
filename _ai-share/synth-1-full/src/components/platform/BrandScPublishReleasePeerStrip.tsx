'use client';

import Link from 'next/link';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_B2B_BASE } from '@/lib/platform-core-mode-surfaces';
import { ROUTES } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
};

/** W2 publish strip · syndication + release gate chain. */
export function BrandScPublishReleasePeerStrip({ collectionId }: Props) {
  const syndicationHref = platformCoreUiHref(`${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=syndication&collection=${encodeURIComponent(collectionId)}`);
  const releaseGateHref = platformCoreUiHref(`${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=checklist&collection=${encodeURIComponent(collectionId)}`);
  const showroomPublishHref = platformCoreUiHref(`${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom-publish&collection=${encodeURIComponent(collectionId)}`);
  const linesheetsHref = `/brand/linesheets?collection=${encodeURIComponent(collectionId)}`;
  const platformHubHref = `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`;
  const matrixHref = platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`);
  const checkoutHref = platformCoreUiHref(`${ROUTES.shop.b2bCheckout}?collection=${encodeURIComponent(collectionId)}`);

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-sc-publish-release-peer-strip"
    >
      <Link href={releaseGateHref} data-testid="brand-sc-publish-release-gate-link" className={hubGadget.goldenLink}>
        Чеклист
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={showroomPublishHref} data-testid="brand-sc-publish-showroom-tab-link" className={hubGadget.goldenLink}>
        Публикация шоурума
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={syndicationHref} data-testid="brand-sc-publish-syndication-link" className={hubGadget.goldenLink}>
        Синдикация
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={linesheetsHref} data-testid="brand-sc-publish-linesheets-link" className={hubGadget.goldenLink}>
        Лайншиты
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={platformHubHref} data-testid="brand-sc-publish-platform-hub-link" className={hubGadget.goldenLink}>
        Платформа B2B
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={matrixHref} data-testid="brand-sc-publish-shop-matrix-link" className={hubGadget.goldenLink}>
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="brand-sc-publish-shop-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
    </div>
  );
}
