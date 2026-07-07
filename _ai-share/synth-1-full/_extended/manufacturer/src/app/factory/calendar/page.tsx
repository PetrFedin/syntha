'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { FactoryCalendarCorePage } from '@/app/factory/calendar/calendar-core';

const FactoryCalendarLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/factory/calendar/calendar-legacy').then(
      (m) => m.FactoryCalendarLegacyPage
    ),
  { ssr: false }
);

function FactoryCalendarPageInner() {
  if (isPlatformCoreMode()) return <FactoryCalendarCorePage />;
  return <FactoryCalendarLegacyPage />;
}

export default function FactoryCalendarPage() {
  return (
    <Suspense fallback={null}>
      <FactoryCalendarPageInner />
    </Suspense>
  );
}
