'use client';

import dynamic from 'next/dynamic';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { resolveCabinetWorkspaceSection } from '@/lib/platform-core-cabinet-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

const BrandDevelopmentCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/BrandDevelopmentCabinetWorkspace').then((m) => ({
      default: m.BrandDevelopmentCabinetWorkspace,
    })),
  { ssr: false }
);

const ManufacturerOrderProductionCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/ManufacturerOrderProductionCabinetWorkspace').then(
      (m) => ({ default: m.ManufacturerOrderProductionCabinetWorkspace })
    ),
  { ssr: false }
);

const ManufacturerCommsCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/PlatformCoreCommsCabinetWorkspace').then((m) => ({
      default: m.ManufacturerCommsCabinetWorkspace,
    })),
  { ssr: false }
);

const SupplierDevelopmentCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/SupplierDevelopmentCabinetWorkspace').then((m) => ({
      default: m.SupplierDevelopmentCabinetWorkspace,
    })),
  { ssr: false }
);

const SupplierOrderProductionCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/SupplierOrderProductionCabinetWorkspace').then(
      (m) => ({ default: m.SupplierOrderProductionCabinetWorkspace })
    ),
  { ssr: false }
);

const SupplierCommsCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/PlatformCoreCommsCabinetWorkspace').then((m) => ({
      default: m.SupplierCommsCabinetWorkspace,
    })),
  { ssr: false }
);

const BrandCollectionOrderCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/BrandCollectionOrderCabinetWorkspace').then((m) => ({
      default: m.BrandCollectionOrderCabinetWorkspace,
    })),
  { ssr: false }
);

const ShopCollectionOrderCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/ShopCollectionOrderCabinetWorkspace').then((m) => ({
      default: m.ShopCollectionOrderCabinetWorkspace,
    })),
  { ssr: false }
);

type Props = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  collectionId: string;
  sectionFromUrl?: string | null;
  articleId?: string | null;
  orderId?: string | null;
  factoryId?: string;
};

/** Единый mount embedded workspace по role × pillar × section. */
export function PlatformCoreRolePillarWorkspace({
  roleId,
  pillarId,
  collectionId,
  sectionFromUrl,
  articleId,
  orderId,
  factoryId = PLATFORM_CORE_DEMO.factoryId,
}: Props) {
  const sectionId = resolveCabinetWorkspaceSection(roleId, pillarId, sectionFromUrl) ?? 'unknown';

  if (roleId === 'brand' && pillarId === 'development') {
    return (
      <BrandDevelopmentCabinetWorkspace
        collectionId={collectionId}
        articleId={articleId}
        sectionId={sectionId}
      />
    );
  }

  if (roleId === 'brand' && pillarId === 'collection_order') {
    return (
      <BrandCollectionOrderCabinetWorkspace
        collectionId={collectionId}
        sectionId={sectionId}
        orderId={orderId}
      />
    );
  }

  if (roleId === 'shop' && pillarId === 'collection_order') {
    return (
      <ShopCollectionOrderCabinetWorkspace
        collectionId={collectionId}
        sectionId={sectionId}
        orderId={orderId}
      />
    );
  }

  if (roleId === 'manufacturer' && pillarId === 'order_production') {
    return (
      <ManufacturerOrderProductionCabinetWorkspace
        collectionId={collectionId}
        sectionId={sectionId}
        factoryId={factoryId}
        orderId={orderId}
        articleId={articleId}
      />
    );
  }

  if (roleId === 'manufacturer' && pillarId === 'comms') {
    return <ManufacturerCommsCabinetWorkspace sectionId={sectionId} />;
  }

  if (roleId === 'supplier' && pillarId === 'development') {
    return (
      <SupplierDevelopmentCabinetWorkspace collectionId={collectionId} sectionId={sectionId} />
    );
  }

  if (roleId === 'supplier' && pillarId === 'order_production') {
    return (
      <SupplierOrderProductionCabinetWorkspace
        collectionId={collectionId}
        sectionId={sectionId}
        articleId={articleId}
        orderId={orderId}
      />
    );
  }

  if (roleId === 'supplier' && pillarId === 'comms') {
    return <SupplierCommsCabinetWorkspace sectionId={sectionId} />;
  }

  return null;
}
