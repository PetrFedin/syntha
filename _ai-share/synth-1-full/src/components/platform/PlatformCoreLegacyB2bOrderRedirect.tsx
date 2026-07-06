'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreLegacyPathRedirect } from '@/components/platform/PlatformCoreLegacyPathRedirect';
import { ROUTES } from '@/lib/platform-core-routes';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';

type Props = {
  roleId: Extract<CoreChainRoleId, 'brand' | 'shop'>;
  orderId: string;
};

/** Core: JOOR snapshot id (B2B-00xx) и прочие не-PG заказы → реестр оптовых заказов. */
export function PlatformCoreLegacyB2bOrderRedirect({ roleId, orderId }: Props) {
  const coreCabinet = roleId === 'brand' ? ROUTES.brand.coreCabinet : ROUTES.shop.coreCabinet;
  const targetHref = isPlatformCoreMode()
    ? `${coreCabinet}?pillar=collection_order`
    : roleId === 'brand'
      ? ROUTES.brand.b2bOrders
      : ROUTES.shop.b2bOrders;
  const testId =
    roleId === 'brand'
      ? 'platform-core-brand-b2b-legacy-order-redirect'
      : 'platform-core-shop-b2b-legacy-order-redirect';

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-4 px-4 py-6">
      <PlatformCoreListChrome
        highlightRole={roleId}
        pillarId={roleId === 'brand' ? 'order_production' : 'collection_order'}
      >
        <PlatformCoreLegacyPathRedirect
          targetHref={targetHref}
          testId={testId}
          message={
            <>
              Заказ <span className="font-mono">{orderId}</span> относится к устаревшему формату — открыт
              актуальный реестр оптовых заказов.
            </>
          }
        />
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
