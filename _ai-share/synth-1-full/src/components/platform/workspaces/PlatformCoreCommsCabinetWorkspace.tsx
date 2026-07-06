'use client';

import dynamic from 'next/dynamic';

const CommsPillarCard = dynamic(
  () =>
    import('@/components/platform/CommsPillarCard').then((m) => ({
      default: m.CommsPillarCard,
    })),
  { ssr: false }
);

const SupplierRfqInboxCorePage = dynamic(
  () =>
    import('@/app/factory/supplier/rfq-inbox/supplier-rfq-inbox-core').then((m) => ({
      default: m.SupplierRfqInboxCorePage,
    })),
  { ssr: false }
);

type Props = {
  sectionId: string;
};

/** Столп comms · manufacturer — split inbox + чат по заказу/артикулу. */
export function ManufacturerCommsCabinetWorkspace({ sectionId: _sectionId }: Props) {
  return (
    <div data-testid="manufacturer-comms-cabinet-workspace" className="min-w-0">
      <CommsPillarCard variant="manufacturer" compact minimalChrome />
    </div>
  );
}

/** Столп comms · supplier — чат, RFQ inbox, календарь. */
export function SupplierCommsCabinetWorkspace({ sectionId }: Props) {
  return (
    <div data-testid="supplier-comms-cabinet-workspace" className="min-w-0 space-y-4">
      {sectionId === 'sup-cm-rfq-inbox' ? (
        <SupplierRfqInboxCorePage />
      ) : (
        <CommsPillarCard variant="supplier" compact minimalChrome />
      )}
    </div>
  );
}
