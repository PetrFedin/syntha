'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bCalendarCorePage } from '@/app/shop/b2b/calendar/calendar-core';

const ShopB2bCalendarLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/calendar/calendar-legacy').then(
      (m) => m.ShopB2bCalendarLegacyPage
    ),
  { ssr: false }
);

export default function B2BOrdersCalendarPage() {
  if (isPlatformCoreMode()) return <ShopB2bCalendarCorePage />;
  return <ShopB2bCalendarLegacyPage />;
}
