'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import StyleCalendar from '@/components/user/style-calendar';

/**
 * Календарь планов клиента — тот же `StyleCalendar`, что и в ритейле/бренде,
 * с `initialRole="client"` и навигацией ЛК (не `/shop/calendar`).
 */
export default function ClientCalendarPage() {
  return (
    <div className="w-full space-y-4 py-2">
      <ClientCabinetSectionHeader showBack={false} />
      <CabinetPageContent maxWidth="5xl" className="space-y-4 p-4 pb-24 sm:px-6">
        <StyleCalendar initialRole="client" />
      </CabinetPageContent>
    </div>
  );
}
