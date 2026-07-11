'use client';

import dynamic from 'next/dynamic';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  resolveCabinetWorkspaceSection,
  roleCoreCabinetHref,
} from '@/lib/platform-core-cabinet-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

const BrandDevelopmentCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/BrandDevelopmentCabinetWorkspace').then((m) => ({
      default: m.BrandDevelopmentCabinetWorkspace,
    })),
  { ssr: false }
);

const BrandSampleCollectionCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/BrandSampleCollectionCabinetWorkspace').then((m) => ({
      default: m.BrandSampleCollectionCabinetWorkspace,
    })),
  { ssr: false }
);

const ShopSampleCollectionCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/ShopSampleCollectionCabinetWorkspace').then((m) => ({
      default: m.ShopSampleCollectionCabinetWorkspace,
    })),
  { ssr: false }
);

const BrandOrderProductionCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/BrandOrderProductionCabinetWorkspace').then((m) => ({
      default: m.BrandOrderProductionCabinetWorkspace,
    })),
  { ssr: false }
);

const ShopOrderProductionCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/ShopOrderProductionCabinetWorkspace').then((m) => ({
      default: m.ShopOrderProductionCabinetWorkspace,
    })),
  { ssr: false }
);

const BaselineCommunicationsCabinetWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/BaselineCommunicationsCabinetWorkspace').then((m) => ({
      default: m.BaselineCommunicationsCabinetWorkspace,
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
  const demo = {
    ...PLATFORM_CORE_DEMO,
    collectionId,
    demoArticleId: articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId,
    demoOrderId: orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId,
    factoryId,
  };

  if (roleId === 'brand' && pillarId === 'development') {
    return (
      <BrandDevelopmentCabinetWorkspace
        collectionId={collectionId}
        articleId={articleId}
        sectionId={sectionId}
      />
    );
  }

  if (roleId === 'brand' && pillarId === 'sample_collection') {
    return <BrandSampleCollectionCabinetWorkspace demo={demo} sectionId={sectionId} />;
  }

  if (roleId === 'shop' && pillarId === 'sample_collection') {
    return <ShopSampleCollectionCabinetWorkspace demo={demo} sectionId={sectionId} />;
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

  if (roleId === 'brand' && pillarId === 'order_production') {
    return (
      <BrandOrderProductionCabinetWorkspace
        collectionId={collectionId}
        sectionId={sectionId}
        orderId={orderId}
        articleId={articleId}
      />
    );
  }

  if (roleId === 'shop' && pillarId === 'order_production') {
    return (
      <ShopOrderProductionCabinetWorkspace
        collectionId={collectionId}
        sectionId={sectionId}
        orderId={orderId}
        articleId={articleId}
      />
    );
  }

  if (roleId === 'brand' && pillarId === 'comms') {
    return (
      <BaselineCommunicationsCabinetWorkspace
        role="brand"
        collectionId={collectionId}
        sectionId={sectionId}
        orderId={orderId}
        articleId={articleId}
      />
    );
  }

  if (roleId === 'shop' && pillarId === 'comms') {
    return (
      <BaselineCommunicationsCabinetWorkspace
        role="shop"
        collectionId={collectionId}
        sectionId={sectionId}
        orderId={orderId}
        articleId={articleId}
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

  return (
    <PlatformCoreEmptyState
      title="Рабочий раздел недоступен"
      reason="Для этой комбинации роли и столпа ещё нет подключённого рабочего пространства."
      nextActionLabel="Вернуться в кабинет"
      nextActionHref={roleCoreCabinetHref({
        roleId,
        pillarId,
        collectionId,
      })}
      meta={`${roleId} · ${pillarId}`}
    />
  );
}
