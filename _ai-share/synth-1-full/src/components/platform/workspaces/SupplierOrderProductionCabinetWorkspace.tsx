'use client';

import dynamic from 'next/dynamic';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

const SupplierProcurementBomPanel = dynamic(
  () =>
    import('@/components/factory/supplier/SupplierProcurementWorkspacePanels').then((m) => ({
      default: m.SupplierProcurementBomPanel,
    })),
  { ssr: false }
);

const SupplierProcurementRfqPanel = dynamic(
  () =>
    import('@/components/factory/supplier/SupplierProcurementWorkspacePanels').then((m) => ({
      default: m.SupplierProcurementRfqPanel,
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

type Props = {
  collectionId: string;
  sectionId: string;
  articleId?: string | null;
  orderId?: string | null;
};

/**
 * Столп order_production · supplier: закупка под PO, BOM×PO, цепочка materials_supplied.
 */
export function SupplierOrderProductionCabinetWorkspace({
  collectionId,
  sectionId,
  articleId,
  orderId,
}: Props) {
  const resolvedArticle = articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const resolvedOrder = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;

  return (
    <div data-testid="supplier-order-production-cabinet-workspace" className="min-w-0 space-y-4">
      {sectionId === 'sup-op-procurement' || sectionId === 'sup-op-bom-po' ? (
        <SupplierProcurementBomPanel collectionId={collectionId} articleId={resolvedArticle} />
      ) : null}
      {sectionId === 'sup-op-chain' || sectionId === 'sup-op-handoff-read' ? (
        <SupplierProcurementPillarCard compact={false} minimalChrome />
      ) : null}
      {sectionId === 'sup-op-cabinet' ? (
        <>
          <SupplierProcurementPillarCard compact={false} minimalChrome />
          <SupplierProcurementRfqPanel collectionId={collectionId} articleId={resolvedArticle} />
        </>
      ) : null}
      {sectionId === 'sup-op-handoff-read' ? (
        <SupplierProcurementPillarCard compact={false} minimalChrome />
      ) : null}
    </div>
  );
}
