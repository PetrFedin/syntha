'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PartnerDemoExportBar } from '@/components/brand/partner-demo-export-bar';
import { ROUTES } from '@/lib/routes';
import { PARTNER_ASSORTMENT_MATRIX_ROWS } from '@/lib/platform/partner-demo-data';
import { ArrowLeft, Grid3x3, Factory, Plug } from 'lucide-react';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function AssortmentMatrixPage() {
  return (
    <CabinetPageContent maxWidth="5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.growthHub}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Grid3x3 className="h-6 w-6" />
              Совместная матрица ассортимента
            </h1>
            <p className="text-sm text-muted-foreground">
              Канал × <AcronymWithTooltip abbr="SKU" /> × цвет × размеры × статус × sell-through.
              Данные:{' '}
              <code className="rounded bg-muted px-1 text-[10px]">
                lib/platform/partner-demo-data
              </code>{' '}
              → позже GET/PUT <AcronymWithTooltip abbr="API" />.
            </p>
          </div>
        </div>
        <PartnerDemoExportBar />
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Button variant="secondary" size="sm" asChild>
          <Link href={ROUTES.brand.production}>
            <Factory className="mr-2 h-3.5 w-3.5" />
            Production
          </Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href={ROUTES.brand.integrations}>
            <Plug className="mr-2 h-3.5 w-3.5" />
            Интеграции
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Матрица</CardTitle>
          <CardDescription>
            Одно окно правды для байера и бренда; в проде — права, версии и аудит.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Канал</TableHead>
                <TableHead>
                  <AcronymWithTooltip abbr="SKU" />
                </TableHead>
                <TableHead>Цвет</TableHead>
                <TableHead>Размеры</TableHead>
                <TableHead>Сезон</TableHead>
                <TableHead>Синхр.</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Sell-through</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PARTNER_ASSORTMENT_MATRIX_ROWS.map((r, i) => (
                <TableRow key={`${r.sku}-${r.channel}-${i}`}>
                  <TableCell className="font-medium">{r.channel}</TableCell>
                  <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                  <TableCell>{r.color}</TableCell>
                  <TableCell>{r.sizes}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.season ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {r.lastSync ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.sellThrough}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
