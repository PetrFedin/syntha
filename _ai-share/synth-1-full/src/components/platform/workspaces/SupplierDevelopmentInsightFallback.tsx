'use client';

import dynamic from 'next/dynamic';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';

const SupplierBomPreview = dynamic(
  () =>
    import('@/components/platform/SupplierBomPreview').then((m) => ({
      default: m.SupplierBomPreview,
    })),
  { ssr: false }
);

const SupplierDevCabinetSpinePeerStrip = dynamic(
  () =>
    import('@/components/factory/supplier/SupplierDevCabinetSpinePeerStrip').then((m) => ({
      default: m.SupplierDevCabinetSpinePeerStrip,
    })),
  { ssr: false }
);

const SupDevCompareSuppliersP2Strip = dynamic(
  () =>
    import('@/components/factory/supplier/SupDevCompareSuppliersP2Strip').then((m) => ({
      default: m.SupDevCompareSuppliersP2Strip,
    })),
  { ssr: false }
);

const SupplierPriceDeltaAlertStrip = dynamic(
  () =>
    import('@/components/factory/supplier/SupplierPriceDeltaAlertStrip').then((m) => ({
      default: m.SupplierPriceDeltaAlertStrip,
    })),
  { ssr: false }
);

type Props = {
  demo: PlatformCoreDemoContext;
  compact?: boolean;
  minimalChrome?: boolean;
};

/** Overview fallback до полного embedded workspace (RoleCoreCabinetHub non-coreMode). */
export function SupplierDevelopmentInsightFallback({ demo, compact, minimalChrome }: Props) {
  return (
    <div className="space-y-2">
      {!minimalChrome ? (
        <>
          <SupplierDevCabinetSpinePeerStrip
            collectionId={demo.collectionId}
            articleId={demo.demoArticleId}
            orderId={demo.demoOrderId}
          />
          <SupplierPriceDeltaAlertStrip
            collectionId={demo.collectionId}
            articleId={demo.demoArticleId}
          />
          <SupDevCompareSuppliersP2Strip
            collectionId={demo.collectionId}
            articleId={demo.demoArticleId}
          />
        </>
      ) : null}
      <SupplierBomPreview demo={demo} compact={compact} />
    </div>
  );
}
