'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function NewGiftRegistryPage() {
  return (
    <CabinetPageContent maxWidth="lg">
      <ClientCabinetSectionHeader
        title="Новый список подарков"
        description="Создайте список на свадьбу, день рождения или другой праздник. Укажите дату и добавьте позиции."
        icon={Gift}
        iconClassName="text-rose-500"
      />
      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Событие</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-text-secondary text-[10px] font-bold uppercase">
              Название события
            </Label>
            <Input placeholder="Например: Свадьба · Анна и Михаил" className="mt-1 rounded-lg" />
          </div>
          <div>
            <Label className="text-text-secondary text-[10px] font-bold uppercase">
              Дата события
            </Label>
            <Input type="date" className="mt-1 rounded-lg" />
          </div>
          <Button className="w-full rounded-xl text-[10px] font-bold uppercase" asChild>
            <Link href={ROUTES.client.giftRegistry}>Создать и добавить подарки</Link>
          </Button>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
