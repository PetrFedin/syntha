'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** Бронирование приватного демо-шоурума по слотам для персональной презентации коллекции. */
const MOCK_SLOTS = [
  {
    id: '1',
    date: '2025-03-14',
    time: '10:00–12:00',
    room: 'Шоурум Syntha, Москва',
    status: 'free',
  },
  {
    id: '2',
    date: '2025-03-14',
    time: '14:00–16:00',
    room: 'Шоурум Syntha, Москва',
    status: 'free',
  },
  {
    id: '3',
    date: '2025-03-15',
    time: '11:00–13:00',
    room: 'VIP Room · Nordic Wool',
    status: 'free',
  },
];

export default function VipRoomBookingPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bVipRoomBooking} />;
  }

  const [selected, setSelected] = useState<string | null>(null);

  return (
    <CabinetPageContent maxWidth="2xl" className="space-y-6">
      <ShopB2bContentHeader lead="Бронирование приватного шоурума по слотам: подтверждение и напоминание." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Слоты</CardTitle>
          <CardDescription>Выберите слот для персональной презентации коллекции</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_SLOTS.map((slot) => (
            <div
              key={slot.id}
              onClick={() => setSelected(slot.id)}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                selected === slot.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-border-default hover:bg-bg-surface2'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center rounded-lg">
                  <MapPin className="text-text-secondary h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">
                    {slot.date} · {slot.time}
                  </p>
                  <p className="text-text-secondary text-sm">{slot.room}</p>
                </div>
              </div>
              <Badge variant="secondary">Свободно</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {selected && (
        <div className="mb-6 flex gap-2">
          <Button>Забронировать</Button>
          <Button variant="outline" onClick={() => setSelected(null)}>
            Отмена
          </Button>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bVideoConsultation}>Видео-консультация</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bShowroom}>Шоурум</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Видео-консультация, выставки, заказы"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
