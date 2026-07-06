'use client';

import dynamic from 'next/dynamic';
import {
  BrandCoRegistryDetailPeerStrip,
  type BrandCoEmbeddedSectionId,
} from '@/components/platform/BrandCoRegistryDetailPeerStrip';
import { PlatformCoreEmbeddedWorkspaceProvider } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

const BrandB2bOrdersCorePage = dynamic(
  () =>
    import('@/app/brand/b2b-orders/b2b-orders-core').then((m) => ({
      default: m.BrandB2bOrdersCorePage,
    })),
  { ssr: false }
);

const BrandB2bOrderDetailCorePage = dynamic(
  () =>
    import('@/app/brand/b2b-orders/[orderId]/brand-order-detail-core').then((m) => ({
      default: m.BrandB2bOrderDetailCorePage,
    })),
  { ssr: false }
);

const BrandRetailersCorePage = dynamic(
  () =>
    import('@/app/brand/retailers/retailers-core').then((m) => ({
      default: m.BrandRetailersCorePage,
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

/** Столп collection_order · brand: реестр, карточка заказа, ритейлеры, overview. */
export function BrandCollectionOrderCabinetWorkspace({
  collectionId,
  sectionId,
  orderId,
}: Props) {
  const resolvedOrder = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const peerActiveSection: BrandCoEmbeddedSectionId | undefined =
    sectionId === 'brand-co-registry'
      ? 'brand-co-registry'
      : sectionId === 'brand-co-detail' || sectionId === 'brand-co-chain'
        ? 'brand-co-detail'
        : undefined;

  return (
    <PlatformCoreEmbeddedWorkspaceProvider>
      <div
        data-testid="brand-collection-order-cabinet-workspace"
        className="min-w-0 space-y-4"
        data-collection-id={collectionId}
      >
        {peerActiveSection ? (
          <BrandCoRegistryDetailPeerStrip
            collectionId={collectionId}
            orderId={resolvedOrder}
            activeSection={peerActiveSection}
            embedded
          />
        ) : null}
        {sectionId === 'brand-co-registry' ? <BrandB2bOrdersCorePage /> : null}
        {sectionId === 'brand-co-detail' || sectionId === 'brand-co-chain' ? (
          <BrandB2bOrderDetailCorePage orderId={resolvedOrder} />
        ) : null}
        {sectionId === 'brand-co-retailers' ? <BrandRetailersCorePage /> : null}
        {sectionId === 'brand-co-cabinet' ? (
          <CollectionOrderPillarCard variant="brand" compact minimalChrome />
        ) : null}
        {![
          'brand-co-registry',
          'brand-co-detail',
          'brand-co-chain',
          'brand-co-retailers',
          'brand-co-cabinet',
        ].includes(sectionId) ? (
          <CollectionOrderPillarCard variant="brand" compact={false} minimalChrome />
        ) : null}
      </div>
    </PlatformCoreEmbeddedWorkspaceProvider>
  );
}
