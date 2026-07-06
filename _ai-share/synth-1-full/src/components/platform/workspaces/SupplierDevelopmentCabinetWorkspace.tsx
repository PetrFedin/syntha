'use client';

import dynamic from 'next/dynamic';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { SupplierDevCabinetSpinePeerStrip } from '@/components/factory/supplier/SupplierDevCabinetSpinePeerStrip';
import { SupplierPriceDeltaAlertStrip } from '@/components/factory/supplier/SupplierPriceDeltaAlertStrip';
import { SupDevCompareSuppliersP2Strip } from '@/components/factory/supplier/SupDevCompareSuppliersP2Strip';

const SupplierBomPreview = dynamic(
  () =>
    import('@/components/platform/SupplierBomPreview').then((m) => ({
      default: m.SupplierBomPreview,
    })),
  { ssr: false }
);

const SupplierMaterialCatalogCore = dynamic(
  () =>
    import('@/components/factory/supplier/SupplierMaterialCatalogCore').then((m) => ({
      default: m.SupplierMaterialCatalogCore,
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

type Props = {
  collectionId: string;
  sectionId: string;
  demo?: PlatformCoreDemoContext;
};

/**
 * Столп development · supplier: BOM, каталог материалов, чат по цене.
 */
export function SupplierDevelopmentCabinetWorkspace({
  collectionId,
  sectionId,
  demo: demoProp,
}: Props) {
  const ctx = usePlatformCoreDemoContext();
  const demo = demoProp ?? ctx;
  const { demoArticleId, demoOrderId } = demo;

  return (
    <div data-testid="supplier-development-cabinet-workspace" className="min-w-0 space-y-4">
      {sectionId === 'sup-dev-bom' ? (
        <>
          <SupplierDevCabinetSpinePeerStrip
            collectionId={collectionId}
            articleId={demoArticleId}
            orderId={demoOrderId}
          />
          <SupplierBomPreview demo={{ ...demo, collectionId }} compact={false} />
        </>
      ) : null}
      {sectionId === 'sup-dev-materials' ? (
        <>
          <SupplierPriceDeltaAlertStrip collectionId={collectionId} articleId={demoArticleId} />
          <SupDevCompareSuppliersP2Strip collectionId={collectionId} articleId={demoArticleId} />
          <SupplierMaterialCatalogCore />
        </>
      ) : null}
      {sectionId === 'sup-dev-comms-peer' ? (
        <CommsPillarCard variant="supplier" compact minimalChrome />
      ) : null}
      {sectionId === 'sup-dev-cabinet' ? (
        <SupplierBomPreview demo={{ ...demo, collectionId }} compact={false} />
      ) : null}
    </div>
  );
}
