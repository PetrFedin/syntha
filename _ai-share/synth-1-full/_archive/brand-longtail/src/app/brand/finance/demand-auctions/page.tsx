'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Inbox, Percent } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

export default function DemandAuctionsPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Аукционы потребностей"
        leadPlain="Обратные аукционы по закупкам: заявки, ставки и экономия."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Gavel className="text-accent-primary h-4 w-4" />
              Active auctions
            </CardTitle>
            <CardDescription className="text-xs">Идут сейчас</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Inbox className="h-4 w-4 text-emerald-600" />
              Bids received
            </CardTitle>
            <CardDescription className="text-xs">Получено предложений</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Percent className="h-4 w-4 text-amber-600" />
              Avg savings %
            </CardTitle>
            <CardDescription className="text-xs">Средняя экономия</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
