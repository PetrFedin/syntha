'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { PlatformCoreLegacyTailPage } from '@/components/platform/PlatformCoreLegacyTailPage';
import {
  pillarIdForShopB2bLegacyTarget,
  resolveShopB2bLegacyRedirect,
} from '@/lib/platform-core-shop-b2b-legacy-redirects';
import { ROUTES } from '@/lib/routes';

type Props = {
  /** Канонический path из `PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS`. */
  legacyPath: string;
};

/** Core: tail-страница для B2B side-path — ListChrome + редирект по правилу. */
export function ShopB2bLegacyTailCorePage({ legacyPath }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirect = resolveShopB2bLegacyRedirect(
    pathname ?? legacyPath,
    searchParams.get('collection')
  );
  const fallbackHref = ROUTES.shop.b2bOrders;

  return (
    <PlatformCoreLegacyTailPage
      highlightRole="shop"
      pillarId={pillarIdForShopB2bLegacyTarget(redirect?.target ?? 'orders')}
      targetHref={redirect?.href ?? fallbackHref}
      testId={redirect?.testId ?? 'platform-core-b2b-side-path-redirect'}
      message={
        redirect?.messageRu ?? 'Раздел вне рабочей цепочки Platform Core → реестр оптовых заказов'
      }
    />
  );
}
