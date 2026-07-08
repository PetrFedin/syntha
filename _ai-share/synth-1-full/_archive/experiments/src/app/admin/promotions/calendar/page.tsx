'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import StyleCalendar from '@/components/user/style-calendar';

export default function PromotionsCalendarPage() {
  return (
    <CabinetPageContent maxWidth="full" className="space-y-4">
      <header>
        <h1 className="text-text-primary text-base font-black uppercase tracking-tighter">
          Календарь продвижения
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Визуальное управление всеми активностями в экосистеме Syntha.
        </p>
      </header>
      <StyleCalendar initialRole="admin" />
    </CabinetPageContent>
  );
}
