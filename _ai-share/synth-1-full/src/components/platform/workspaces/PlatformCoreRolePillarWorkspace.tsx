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

const BrandOrderProductionWorkspace = dynamic(
  () =>
    import('@/components/platform/pillars/OrderProductionPillarCardBrand').then((m) => ({
      default: m.OrderProductionPillarCardBrand,
    })),
  { ssr: false }
);

const ShopOrderProductionWorkspace = dynamic(
  () =>
    import('@/components/platform/ShopOrderProductionPillarCard').then((m) => ({
      default: m.ShopOrderProductionPillarCard,
    })),
  { ssr: false }
);

const BaselineCommsWorkspace = dynamic(
  () =>
    import('@/components/platform/pillars/CommsPillarCardBaseline').then((m) => ({
      default: m.CommsPillarCardBaseline,
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
    return (
      <BrandSampleCollectionMini
        demo={demo}
        compact={false}
        minimalChrome
        sectionId={sectionId}
      />
    );
  }

  if (roleId === 'shop' && pillarId === 'sample_collection') {
    return (
      <ShopShowroomMini
        demo={demo}
        compact={false}
        minimalChrome
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

  if (roleId === 'brand' && pillarId === 'order_production') {
    return <BrandOrderProductionWorkspace compact={false} minimalChrome />;
  }

  if (roleId === 'shop' && pillarId === 'order_production') {
    return <ShopOrderProductionWorkspace compact={false} minimalChrome />;
  }

  if (roleId === 'brand' && pillarId === 'comms') {
    return <BaselineCommsWorkspace variant="brand" compact={false} minimalChrome />;
  }

  if (roleId === 'shop' && pillarId === 'comms') {
    return <BaselineCommsWorkspace variant="shop" compact={false} minimalChrome />;
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
