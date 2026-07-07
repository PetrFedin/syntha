'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTradeShowById, getUpcomingEvents } from '@/lib/b2b/trade-show-calendar';
import { getAppointments, createAppointment } from '@/lib/b2b/trade-show-appointments';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';

export default function TradeShowAppointmentsPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bTradeShowAppointments} />;
  }

  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const event = eventId ? getTradeShowById(eventId) : null;
  const events = getUpcomingEvents();
  const appointments = getAppointments(eventId ?? undefined);

  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');

  const handleBook = () => {
    if (!event || !slot) return;
    createAppointment({
      tradeShowId: event.id,
      tradeShowName: event.name,
      partnerId: 'current',
      partnerName: 'Текущий байер',
      slotStart: slot,
      slotEnd: slot,
      status: 'pending',
      notes: notes || undefined,
    });
    setSlot('');
    setNotes('');
  };

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader
        backHref={ROUTES.shop.b2bTradeShows}
        lead="Запись на встречи с брендами на выставке."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Выберите выставку</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {events.map((e) => (
            <Button key={e.id} variant={eventId === e.id ? 'default' : 'outline'} size="sm" asChild>
              <Link href={`${ROUTES.shop.b2bTradeShowAppointments}?event=${e.id}`}>{e.name}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {event && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <p className="text-text-secondary text-sm">
                {event.startDate} – {event.endDate} · {event.city}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Дата и время</Label>
                <Input
                  type="datetime-local"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Заметка</Label>
                <Input
                  placeholder="Тема встречи, контакт"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleBook} disabled={!slot}>
                Записаться
              </Button>
            </CardContent>
          </Card>

          {appointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Мои записи</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {appointments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded border p-2">
                      <span>{a.slotStart.slice(0, 16)}</span>
                      <span className="text-text-secondary text-sm">{a.status}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Button variant="outline" className="mt-6" asChild>
        <Link href={ROUTES.shop.b2bTradeShows}>← К выставкам</Link>
      </Button>
    </CabinetPageContent>
  );
}
