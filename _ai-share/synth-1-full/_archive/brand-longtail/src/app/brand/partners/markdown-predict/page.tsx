'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PartnerDemoExportBar } from '@/components/brand/partner-demo-export-bar';
import { ROUTES } from '@/lib/routes';
import { PARTNER_MARKDOWN_HINTS } from '@/lib/platform/partner-demo-data';
import { ArrowLeft, TrendingDown, BarChart3 } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

const confLabel: Record<string, string> = {
  rule: 'Правило',
  ml_stub: 'ML-заготовка',
  manual: 'Вручную',
};

export default function MarkdownPredictPage() {
  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.growthHub}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <TrendingDown className="h-6 w-6" />
              Предикт распродажи / markdown
            </h1>
            <p className="text-sm text-muted-foreground">
              Правила и заготовка под ML. Контракт строк:{' '}
              <code className="rounded bg-muted px-1 text-[10px]">PartnerMarkdownHint</code>.
            </p>
          </div>
        </div>
        <PartnerDemoExportBar />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href={ROUTES.brand.analytics360}>
            <BarChart3 className="mr-2 h-3.5 w-3.5" />
            Аналитика 360
          </Link>
        </Button>
      </div>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-base">Таблица рекомендаций</CardTitle>
          <CardDescription>Регион и канал готовы для фильтров API.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Канал</TableHead>
                <TableHead>Сигнал</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>Тип</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PARTNER_MARKDOWN_HINTS.map((h) => (
                <TableRow key={`${h.sku}-${h.region}-${h.channel}`}>
                  <TableCell className="font-mono text-xs">{h.sku}</TableCell>
                  <TableCell className="text-xs">{h.region ?? '—'}</TableCell>
                  <TableCell className="text-xs">{h.channel ?? '—'}</TableCell>
                  <TableCell className="max-w-[200px] text-sm">{h.reason}</TableCell>
                  <TableCell className="text-sm font-medium">{h.action}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[9px]">
                      {confLabel[h.confidence] ?? h.confidence}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {PARTNER_MARKDOWN_HINTS.map((h) => (
          <Card key={`m-${h.sku}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between gap-2">
                <CardTitle className="font-mono text-sm">{h.sku}</CardTitle>
                <Badge variant="secondary" className="text-[9px]">
                  {confLabel[h.confidence]}
                </Badge>
              </div>
              <CardDescription className="text-xs">{h.reason}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm font-medium">{h.action}</CardContent>
          </Card>
        ))}
      </div>
    </CabinetPageContent>
  );
}
