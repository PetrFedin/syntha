'use client';

import dynamic from 'next/dynamic';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';

/**
 * Extended-only: supplier development material catalog nav.
 * Baseline RoleCoreCabinetHub не импортирует factory/supplier components напрямую.
 */
export const SupplierDevPillarMaterialCatalogNavExtended = dynamic(
  () =>
    import('@/components/factory/supplier/SupplierDevPillarMaterialCatalogNav').then((m) => ({
      default: m.SupplierDevPillarMaterialCatalogNav,
    })),
  { ssr: false }
);

type Props = {
  demo: PlatformCoreDemoContext;
  showPeers?: boolean;
};

export function SupplierDevPillarMaterialCatalogNavGate({ demo, showPeers }: Props) {
  return <SupplierDevPillarMaterialCatalogNavExtended demo={demo} showPeers={showPeers} />;
}
