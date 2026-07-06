'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { SupplierRfqInboxCorePage } from '@/app/factory/supplier/rfq-inbox/supplier-rfq-inbox-core';

const FactoryProductionMessagesLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/factory/production/messages/messages-legacy').then(
      (m) => m.FactoryProductionMessagesLegacyPage
    ),
  { ssr: false }
);

function SupplierRfqInboxInner() {
  if (isPlatformCoreMode()) return <SupplierRfqInboxCorePage />;
  return <FactoryProductionMessagesLegacyPage />;
}

/** `/factory/supplier/rfq-inbox` — RFQ inbox поставщика (не alias messages). */
export default function FactorySupplierRfqInboxPage() {
  return (
    <Suspense fallback={null}>
      <SupplierRfqInboxInner />
    </Suspense>
  );
}
