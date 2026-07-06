'use client';

import dynamic from 'next/dynamic';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

const HandoffPanel = dynamic(
  () =>
    import('@/components/factory/FactoryWorkshop2ProductionHandoffPanel').then((m) => ({
      default: m.FactoryWorkshop2ProductionHandoffPanel,
    })),
  { ssr: false }
);

const ProductionOrdersCore = dynamic(
  () =>
    import('@/app/factory/production/orders/factory-production-orders-core').then((m) => ({
      default: m.FactoryProductionOrdersCorePage,
    })),
  { ssr: false }
);

const FactoryDossierCoreChrome = dynamic(
  () =>
    import('@/components/platform/FactoryDossierCoreChrome').then((m) => ({
      default: m.FactoryDossierCoreChrome,
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

type Props = {
  collectionId: string;
  sectionId: string;
  factoryId?: string;
  orderId?: string | null;
  articleId?: string | null;
};

/**
 * Столп order_production · manufacturer: очередь передачи, реестр PO, досье.
 */
export function ManufacturerOrderProductionCabinetWorkspace({
  collectionId,
  sectionId,
  factoryId = PLATFORM_CORE_DEMO.factoryId,
  orderId,
  articleId,
}: Props) {
  const resolvedOrder = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const resolvedArticle = articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;

  return (
    <div data-testid="manufacturer-order-production-cabinet-workspace" className="min-w-0 space-y-4">
      {sectionId === 'mfr-op-handoff-queue' ? (
        <HandoffPanel
          factoryId={factoryId}
          collectionId={collectionId}
          orderId={resolvedOrder}
        />
      ) : null}
      {sectionId === 'mfr-op-production-orders' ? <ProductionOrdersCore /> : null}
      {sectionId === 'mfr-op-dossier' ? (
        <FactoryDossierCoreChrome
          articleId={resolvedArticle}
          dossierCollectionId={collectionId}
        >
          <span className="sr-only">Досье · техзадание</span>
        </FactoryDossierCoreChrome>
      ) : null}
      {sectionId === 'mfr-op-materials' ? (
        <OrderProductionPillarCard variant="manufacturer" compact={false} minimalChrome />
      ) : null}
      {sectionId === 'mfr-op-cabinet' || sectionId === 'mfr-op-inventory-ops' ? (
        <OrderProductionPillarCard variant="manufacturer" compact={false} minimalChrome />
      ) : null}
    </div>
  );
}
