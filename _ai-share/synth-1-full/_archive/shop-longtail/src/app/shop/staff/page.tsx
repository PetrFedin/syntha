'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { TeamManagement } from '@/components/team/TeamManagement';

export default function StaffPage() {
  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-6 duration-700 animate-in fade-in">
      <div className="border-border-subtle overflow-hidden rounded-xl border bg-white p-1 shadow-sm">
        <TeamManagement />
      </div>
    </CabinetPageContent>
  );
}
