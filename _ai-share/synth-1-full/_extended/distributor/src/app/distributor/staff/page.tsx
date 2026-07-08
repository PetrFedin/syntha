'use client';

import { TeamManagement } from '@/components/team/TeamManagement';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function DistributorStaffPage() {
  return (
    <CabinetPageContent maxWidth="screen">
      <TeamManagement />
    </CabinetPageContent>
  );
}
