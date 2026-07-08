'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { ROUTES, passportById } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';

/** Примеры паспортов для перехода (при API — список из бэкенда) */
const EXAMPLE_PASSPORT_IDS = ['PASS-9921', 'PASS-9922'];

export default function ClientPassportHubPage() {
  return (
    <div className="container max-w-2xl space-y-6 py-6 pb-24">
      <ClientCabinetSectionHeader description="История и аутентичность вещей. Выберите паспорт или введите ID." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Мои паспорта
          </CardTitle>
          <CardDescription>При подключении API здесь будет список ваших паспортов.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {EXAMPLE_PASSPORT_IDS.map((id) => (
              <li key={id}>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={passportById(id)}>{id}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
