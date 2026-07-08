'use client';

import dynamic from 'next/dynamic';
import type {
  CoreChainRoleId,
  CoreHubPillarId,
  PlatformCoreDemoContext,
} from '@/lib/platform-core-hub-matrix';
import { hasEmptyCellInsightPanel } from '@/lib/platform-core-empty-cell-registry';

export { hasEmptyCellInsightPanel };
export { BrandSampleCollectionMini } from '@/components/platform/BrandSampleCollectionMini';
export { ShopShowroomMini } from '@/components/platform/ShopShowroomMini';
export { SupplierBomPreview } from '@/components/platform/SupplierBomPreview';

export { default as ManufacturerPoExpectation } from '@/components/platform/empty-cells/manufacturer-po-expectation-panel';
export { default as ManufacturerSampleCollectionStatus } from '@/components/platform/empty-cells/manufacturer-sample-collection-status-panel';

type Props = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  demo: PlatformCoreDemoContext;
  /** Кабинет уже показывает RoleEmptyPillarBridge — не дублировать cross-role блок. */
  embedCrossRole?: boolean;
};

function EmptyInsightPanelLoading() {
  return (
    <p className="text-text-muted text-sm" data-testid="role-pillar-empty-insight-panel-loading">
      Загрузка контекста…
    </p>
  );
}

const ShopDevelopmentBridgePanel = dynamic(
  () => import('@/components/platform/empty-cells/shop-development-bridge-panel'),
  { ssr: false, loading: EmptyInsightPanelLoading }
);

const ManufacturerPoExpectationPanel = dynamic(
  () => import('@/components/platform/empty-cells/manufacturer-po-expectation-panel'),
  { ssr: false, loading: EmptyInsightPanelLoading }
);

const ManufacturerSampleCollectionStatusPanel = dynamic(
  () => import('@/components/platform/empty-cells/manufacturer-sample-collection-status-panel'),
  { ssr: false, loading: EmptyInsightPanelLoading }
);

const SupplierBomPreviewPanel = dynamic(
  () =>
    import('@/components/platform/SupplierBomPreview').then((m) => ({
      default: m.SupplierBomPreview,
    })),
  { ssr: false, loading: EmptyInsightPanelLoading }
);

const SupplierCollectionOrderForecastPanel = dynamic(
  () => import('@/components/platform/empty-cells/supplier-collection-order-forecast-panel'),
  { ssr: false, loading: EmptyInsightPanelLoading }
);

/** Read-only панели для empty-ячеек матрицы — lazy по role×pillar. */
export function PlatformCoreEmptyCellPanels({
  roleId,
  pillarId,
  demo,
  embedCrossRole = false,
}: Props) {
  if (roleId === 'shop' && pillarId === 'development') {
    return <ShopDevelopmentBridgePanel demo={demo} hideLead embedCrossRole={embedCrossRole} />;
  }
  if (roleId === 'manufacturer' && pillarId === 'collection_order') {
    return (
      <ManufacturerPoExpectationPanel
        demo={demo}
        embedCrossRole={embedCrossRole}
        hideLead
        compact
      />
    );
  }
  if (roleId === 'manufacturer' && pillarId === 'sample_collection') {
    return (
      <ManufacturerSampleCollectionStatusPanel
        demo={demo}
        embedCrossRole={embedCrossRole}
        hideLead
        compact
      />
    );
  }
  if (roleId === 'supplier' && pillarId === 'sample_collection') {
    return <SupplierBomPreviewPanel demo={demo} hideLead embedCrossRole={embedCrossRole} compact />;
  }
  if (roleId === 'supplier' && pillarId === 'collection_order') {
    return (
      <SupplierCollectionOrderForecastPanel demo={demo} hideLead embedCrossRole={embedCrossRole} />
    );
  }
  return null;
}
