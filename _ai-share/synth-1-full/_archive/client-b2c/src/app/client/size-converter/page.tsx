'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import {
  APPAREL_SIZE_TABLE,
  FOOTWEAR_EU_US,
  findApparelRowByLabel,
} from '@/lib/fashion/size-conversion';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function SizeConverterPage() {
  const [label, setLabel] = useState('M');
  const row = useMemo(() => findApparelRowByLabel(label), [label]);

  return (
    <CabinetPageContent maxWidth="3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader />
        </div>
        <PlatformDataBanner />
      </div>

      <Tabs defaultValue="apparel">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
          <TabsTrigger
            value="apparel"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Верх / платья
          </TabsTrigger>
          <TabsTrigger
            value="shoes"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Обувь EU→US
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="apparel"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4 space-y-4')}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Подбор по маркировке</CardTitle>
              <CardDescription>
                Выберите размер на этикетке (INT / бренд часто совпадает с колонкой).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Размер</Label>
                <select
                  className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                >
                  {APPAREL_SIZE_TABLE.map((r) => (
                    <option key={r.label} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {row && (
                <div className="grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">EU</p>
                    <p className="font-mono text-lg">{row.eu}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">US</p>
                    <p className="font-mono text-lg">{row.us}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">UK</p>
                    <p className="font-mono text-lg">{row.uk}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Полная таблица</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>INT</TableHead>
                    <TableHead>EU</TableHead>
                    <TableHead>US</TableHead>
                    <TableHead>UK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {APPAREL_SIZE_TABLE.map((r) => (
                    <TableRow key={r.label}>
                      <TableCell className="font-medium">{r.label}</TableCell>
                      <TableCell className="font-mono">{r.eu}</TableCell>
                      <TableCell className="font-mono">{r.us}</TableCell>
                      <TableCell className="font-mono">{r.uk}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shoes" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Обувь</CardTitle>
              <CardDescription>
                Усреднение по мужской линейке; у женских брендов сдвиг −1…1,5.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EU</TableHead>
                    <TableHead>US (ориентир)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FOOTWEAR_EU_US.map((r) => (
                    <TableRow key={r.eu}>
                      <TableCell className="font-mono">{r.eu}</TableCell>
                      <TableCell className="font-mono">{r.us}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
