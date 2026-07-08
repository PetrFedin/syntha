'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';

const DevelopmentPillarCard = dynamic(
  () =>
    import('@/components/platform/DevelopmentPillarCard').then((m) => ({
      default: m.DevelopmentPillarCard,
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

const CommsPillarCard = dynamic(
  () =>
    import('@/components/platform/CommsPillarCard').then((m) => ({
      default: m.CommsPillarCard,
    })),
  { ssr: false }
);

const SupplierProcurementPillarCard = dynamic(
  () =>
    import('@/components/platform/SupplierProcurementPillarCard').then((m) => ({
      default: m.SupplierProcurementPillarCard,
    })),
  { ssr: false }
);

const BrandSampleCollectionMini = dynamic(
  () =>
    import('@/components/platform/BrandSampleCollectionMini').then((m) => ({
      default: m.BrandSampleCollectionMini,
    })),
  { ssr: false }
);

const ShopShowroomMini = dynamic(
  () =>
    import('@/components/platform/ShopShowroomMini').then((m) => ({
      default: m.ShopShowroomMini,
    })),
  { ssr: false }
);

const OrderProductionPillarCard = dynamic(
  () =>
    import('@/components/platform/OrderProductionPillarCard').then((m) => ({
      default: m.OrderProductionPillarCard,
    })),
  { ssr: false }
);

const ShopOrderProductionPillarCard = dynamic(
  () =>
    import('@/components/platform/ShopOrderProductionPillarCard').then((m) => ({
      default: m.ShopOrderProductionPillarCard,
    })),
  { ssr: false }
);

const SupplierCollectionOrderForecast = dynamic(
  () => import('@/components/platform/empty-cells/supplier-collection-order-forecast-panel'),
  { ssr: false }
);

/** Overview-mode pillar cards (не embedded workspace). */
export function RoleCorePillarInsightCards({
  roleId,
  pillarId,
  compact = false,
  minimalChrome = false,
  sectionId,
}: {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  compact?: boolean;
  minimalChrome?: boolean;
  sectionId?: string | null;
}) {
  const demo = usePlatformCoreDemoContext();
  if (!isPlatformCoreMode()) return null;

  let card: ReactNode = null;

  if (roleId === 'brand' && pillarId === 'development') {
    card = (
      <DevelopmentPillarCard variant="brand" compact={compact} minimalChrome={minimalChrome} />
    );
  } else if (roleId === 'brand' && pillarId === 'sample_collection') {
    card = (
      <BrandSampleCollectionMini
        demo={demo}
        compact={compact}
        minimalChrome={minimalChrome}
        sectionId={sectionId}
      />
    );
  } else if (roleId === 'brand' && pillarId === 'collection_order') {
    card = (
      <CollectionOrderPillarCard variant="brand" compact={compact} minimalChrome={minimalChrome} />
    );
  } else if (roleId === 'brand' && pillarId === 'order_production') {
    card = (
      <OrderProductionPillarCard variant="brand" compact={compact} minimalChrome={minimalChrome} />
    );
  } else if (roleId === 'brand' && pillarId === 'comms') {
    card = <CommsPillarCard variant="brand" compact={compact} minimalChrome={minimalChrome} />;
  } else if (roleId === 'shop' && pillarId === 'collection_order') {
    card = (
      <CollectionOrderPillarCard variant="shop" compact={compact} minimalChrome={minimalChrome} />
    );
  } else if (roleId === 'shop' && pillarId === 'sample_collection') {
    card = (
      <ShopShowroomMini
        demo={demo}
        compact={compact}
        minimalChrome={minimalChrome}
        sectionId={sectionId}
      />
    );
  } else if (roleId === 'shop' && pillarId === 'comms') {
    card = <CommsPillarCard variant="shop" compact={compact} minimalChrome={minimalChrome} />;
  } else if (roleId === 'shop' && pillarId === 'order_production') {
    card = <ShopOrderProductionPillarCard compact={compact} minimalChrome={minimalChrome} />;
  } else if (roleId === 'manufacturer' && pillarId === 'development') {
    card = (
      <DevelopmentPillarCard
        variant="manufacturer"
        compact={compact}
        minimalChrome={minimalChrome}
      />
    );
  } else if (roleId === 'manufacturer' && pillarId === 'order_production') {
    card = (
      <OrderProductionPillarCard
        variant="manufacturer"
        compact={compact}
        minimalChrome={minimalChrome}
      />
    );
  } else if (roleId === 'manufacturer' && pillarId === 'comms') {
    card = (
      <CommsPillarCard variant="manufacturer" compact={compact} minimalChrome={minimalChrome} />
    );
  } else if (roleId === 'supplier' && pillarId === 'order_production') {
    card = <SupplierProcurementPillarCard compact={compact} minimalChrome={minimalChrome} />;
  } else if (roleId === 'supplier' && pillarId === 'comms') {
    card = <CommsPillarCard variant="supplier" compact={compact} minimalChrome={minimalChrome} />;
  } else if (roleId === 'supplier' && pillarId === 'collection_order') {
    card = <SupplierCollectionOrderForecast demo={demo} hideLead embedCrossRole={false} />;
  } else if (roleId === 'supplier' && pillarId === 'development') {
    card = (
      <SupplierDevelopmentInsightFallback
        demo={demo}
        compact={compact}
        minimalChrome={minimalChrome}
      />
    );
  }

  if (!card) return null;

  return (
    <div data-testid={`role-pillar-insight-${roleId}-${pillarId}`} className={pillarInsight.root}>
      {card}
    </div>
  );
}

/** Lazy: supplier dev strips только в overview (embedded workspace — отдельный файл). */
const SupplierDevelopmentInsightFallback = dynamic(
  () =>
    import('@/components/platform/workspaces/SupplierDevelopmentInsightFallback').then((m) => ({
      default: m.SupplierDevelopmentInsightFallback,
    })),
  { ssr: false }
);
