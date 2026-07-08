'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { FactoryProductionCalendarCorePage } from '@/app/factory/production/calendar/production-calendar-core';

const FactoryProductionCalendarLegacyPage = dynamic(
  () =>
    import(
      '@/_archive/platform-core-legacy/app/factory/production/calendar/production-calendar-legacy'
    ).then(
      (m) => m.FactoryProductionCalendarLegacyPage
    ),
  { ssr: false }
);

function FactoryProductionCalendarPageInner() {
  if (isPlatformCoreMode()) return <FactoryProductionCalendarCorePage />;
  return <FactoryProductionCalendarLegacyPage />;
}

export default function FactoryProductionCalendarPage() {
  return (
    <Suspense fallback={null}>
      <FactoryProductionCalendarPageInner />
    </Suspense>
  );
}
