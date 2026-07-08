'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Scissors, Package } from 'lucide-react';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { getClientServiceBookingLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Химчистка',
    desc: 'Деликатная химчистка верхней одежды',
    icon: Droplets,
    price: 'от 1 500 ₽',
  },
  { id: '2', name: 'Ремонт', desc: 'Починка молний, подшивка', icon: Scissors, price: 'от 500 ₽' },
  {
    id: '3',
    name: 'Кастомизация',
    desc: 'Нанесение принта, монограммы',
    icon: Package,
    price: 'индивидуально',
  },
];

export default function ServiceBookingPage() {
  return (
    <CabinetPageContent maxWidth="2xl">
      <ClientCabinetSectionHeader iconClassName="text-accent-primary" />

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Услуги</CardTitle>
          <CardDescription>Выберите услугу и привяжите к вещи из гардероба</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_SERVICES.map((s) => (
              <li
                key={s.id}
                className="bg-bg-surface2 border-border-default flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-accent-primary/10 text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-text-secondary text-[11px]">
                      {s.desc} · {s.price}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="rounded-lg">
                  Записаться
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getClientServiceBookingLinks()} />
    </CabinetPageContent>
  );
}
