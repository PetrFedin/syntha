'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, Banknote } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

export default function EscrowLivePage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="LIVE: Этапы оплаты (Эскроу)"
        leadPlain="Текущие сделки в эскроу и статусы этапов оплаты в реальном времени."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Shield className="h-4 w-4 text-emerald-600" />
              Active escrow deals
            </CardTitle>
            <CardDescription className="text-xs">Сделки в работе</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Clock className="h-4 w-4 text-amber-600" />
              Pending milestones
            </CardTitle>
            <CardDescription className="text-xs">Ожидают подтверждения</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Banknote className="text-accent-primary h-4 w-4" />
              Released this month
            </CardTitle>
            <CardDescription className="text-xs">Выплачено за месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
