'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { PaymentsPageContent } from './payments-page-content';

export default function PaymentsPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-4 py-6 pb-24 sm:px-6">
      <ClientCabinetSectionHeader />
      <PaymentsPageContent />
    </CabinetPageContent>
  );
}
