'use client';

import dynamic from 'next/dynamic';
import { PlatformCoreEmbeddedWorkspaceProvider } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { ShopCoMatrixEmbeddedPanel } from '@/components/platform/workspaces/ShopCoMatrixEmbeddedPanel';
import { ShopCoCabinetTrackingEmbed } from '@/components/platform/ShopCoCabinetTrackingEmbed';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { ROUTES } from '@/lib/platform-core-routes';

const ShopB2bCheckoutCorePage = dynamic(
  () =>
    import('@/app/shop/b2b/checkout/checkout-core').then((m) => ({
      default: m.ShopB2bCheckoutCorePage,
    })),
  { ssr: false }
);

const ShopB2bOrdersCorePage = dynamic(
  () =>
    import('@/app/shop/b2b/orders/orders-core').then((m) => ({
      default: m.ShopB2bOrdersCorePage,
    })),
  { ssr: false }
);

const ShopB2bOrderDetailCorePage = dynamic(
  () =>
    import('@/app/shop/b2b/orders/[orderId]/shop-order-detail-core').then((m) => ({
      default: m.ShopB2bOrderDetailCorePage,
    })),
  { ssr: false }
);

const ShopB2bWorkingOrderCorePage = dynamic(
  () =>
    import('@/app/shop/b2b/working-order/working-order-core').then((m) => ({
      default: m.ShopB2bWorkingOrderCorePage,
    })),
  { ssr: false }
);

const CollectionOrderPillarCard = dynamic(
  () =>
    import('@/components/platform/CollectionOrderPillarCard').then((m) => ({
      default: m.CollectionOrderPillarCard,
    })),
  { ssr: false }
);

type Props = {
  collectionId: string;
  sectionId: string;
  orderId?: string | null;
};

const SHOP_COLLECTION_ORDER_SECTIONS = new Set([
  'shop-co-matrix',
  'shop-co-checkout',
  'shop-co-registry',
  'shop-co-detail',
  'shop-co-buyer-tracking',
  'shop-co-working-order',
  'shop-co-cabinet',
]);

function shopCollectionOrderRegistryHref(collectionId: string): string {
  const params = new URLSearchParams({
    pillar: 'collection_order',
    collection: collectionId,
    section: 'shop-co-registry',
  });
  return `${ROUTES.shop.coreCabinet}?${params.toString()}`;
}

/** Столп collection_order · shop: matrix, checkout, registry, detail — native в hub. */
export function ShopCollectionOrderCabinetWorkspace({ collectionId, sectionId, orderId }: Props) {
  const resolvedOrder = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const sectionKnown = SHOP_COLLECTION_ORDER_SECTIONS.has(sectionId);

  return (
    <PlatformCoreEmbeddedWorkspaceProvider>
      <div
        data-testid="shop-collection-order-cabinet-workspace"
        className="min-w-0 space-y-2.5"
        data-collection-id={collectionId}
      >
        {sectionId === 'shop-co-matrix' ? (
          <ShopCoMatrixEmbeddedPanel collectionId={collectionId} orderId={resolvedOrder} />
        ) : null}

        {sectionId === 'shop-co-checkout' ? <ShopB2bCheckoutCorePage /> : null}

        {sectionId === 'shop-co-registry' ? <ShopB2bOrdersCorePage /> : null}

        {sectionId === 'shop-co-detail' ? (
          <ShopB2bOrderDetailCorePage orderId={resolvedOrder} />
        ) : null}

        {sectionId === 'shop-co-buyer-tracking' ? (
          <ShopCoCabinetTrackingEmbed orderId={resolvedOrder} />
        ) : null}

        {sectionId === 'shop-co-working-order' ? <ShopB2bWorkingOrderCorePage /> : null}

        {sectionId === 'shop-co-cabinet' ? (
          <CollectionOrderPillarCard variant="shop" compact minimalChrome />
        ) : null}

        {!sectionKnown ? (
          <PlatformCoreEmptyState
            title="Раздел заказа не найден"
            reason="Ссылка устарела или раздел больше не входит в рабочий контур Collection Order."
            nextActionLabel="Открыть мои заказы"
            nextActionHref={shopCollectionOrderRegistryHref(collectionId)}
          />
        ) : null}
      </div>
    </PlatformCoreEmbeddedWorkspaceProvider>
  );
}
