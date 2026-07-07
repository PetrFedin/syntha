'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CARE_SYMBOL_LIBRARY } from '@/lib/fashion/care-symbols';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function CareSymbolsPage() {
  return (
    <CabinetPageContent maxWidth="3xl">
      <ClientCabinetSectionHeader />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Символы</CardTitle>
          <CardDescription>Короткий код и расшифровка для колл-центра и FAQ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CARE_SYMBOL_LIBRARY.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">id: {c.id}</p>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono">
                {c.short}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        На PDP символы подтягиваются из{' '}
        <code className="rounded bg-muted px-1">attributes.care</code> (массив id) или подставляется
        безопасный дефолт до заполнения PIM.
      </p>
    </CabinetPageContent>
  );
}
