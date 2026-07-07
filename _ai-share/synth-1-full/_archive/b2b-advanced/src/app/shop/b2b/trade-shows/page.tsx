'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUpcomingEvents } from '@/lib/b2b/trade-show-calendar';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';
import { ArrowRight } from 'lucide-react';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';

export default function ShopTradeShowsPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bTradeShows} />;
  }

  const events = getUpcomingEvents();

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader lead="Ближайшие события и запись на встречи с брендами." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ближайшие события</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((e) => (
            <div
              key={e.id}
              className="border-border-default flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-text-secondary text-sm">
                  {e.startDate} – {e.endDate} · {e.city}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`${ROUTES.shop.b2bTradeShowAppointments}?event=${e.id}`}>
                  Записаться <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
