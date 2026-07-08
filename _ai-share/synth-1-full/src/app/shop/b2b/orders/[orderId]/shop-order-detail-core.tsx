'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlatformCoreOrderDetailChrome } from '@/components/platform/PlatformCoreOrderDetailChrome';
import { ShopCoDetailSpinePeerStrip } from '@/components/shop/b2b/ShopCoDetailSpinePeerStrip';
import { useWorkshop2B2bOrderDetail } from '@/hooks/use-workshop2-b2b-order-detail';
import {
  resolvePageCollectionId,
  getPlatformCoreDemoByOrderId,
} from '@/lib/platform-core-hub-matrix';

const PlatformCoreB2bOrderDetailFacts = dynamic(
  () =>
    import('@/components/platform/PlatformCoreB2bOrderDetailFacts').then((m) => ({
      default: m.PlatformCoreB2bOrderDetailFacts,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="text-text-muted text-sm" data-testid="platform-core-order-detail-facts-loading">
        Загрузка карточки заказа…
      </p>
    ),
  }
);

import { useShopOrderDetailLegacyPillarRedirect } from '@/hooks/use-shop-order-detail-legacy-pillar-redirect';

type Props = {
  orderId: string;
};

function ShopB2bOrderDetailBody({ orderId }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    fallback: getPlatformCoreDemoByOrderId(orderId).collectionId,
  });

  return (
    <div className="pb-safe space-y-4" data-testid="shop-b2b-order-detail-core">
      <ShopCoDetailSpinePeerStrip orderId={orderId} collectionId={collectionId} />
      <PlatformCoreOrderDetailChrome orderId={orderId} variant="shop">
        <PlatformCoreB2bOrderDetailFacts orderId={orderId} variant="shop" />
      </PlatformCoreOrderDetailChrome>
    </div>
  );
}

export function ShopB2bOrderDetailCorePage({ orderId }: Props) {
  useShopOrderDetailLegacyPillarRedirect(orderId);
  useWorkshop2B2bOrderDetail(orderId, true);

  return (
    <Suspense fallback={null}>
      <ShopB2bOrderDetailBody orderId={orderId} />
    </Suspense>
  );
}
