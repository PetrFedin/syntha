'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
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
import { PARTNER_FACTORY_SAMPLES } from '@/lib/platform/partner-demo-data';
import { ArrowLeft, Factory, ClipboardList } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

export default function FactoryPortalPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Портал фабрики"
        leadPlain="Образцы, QC, расхождения с tech pack. Тип строк: PartnerFactorySample."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.production} aria-label="Назад в Production">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Factory className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <PartnerDemoExportBar />
          </div>
        }
      />

      <Button variant="secondary" size="sm" asChild>
        <Link href={`${ROUTES.brand.production}?floorTab=ops`}>
          <ClipboardList className="mr-2 h-3.5 w-3.5" />
          Production · операции
        </Link>
      </Button>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-base">Образцы и QC</CardTitle>
          <CardDescription>PO и дедлайны — заготовка под webhook от фабрики.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Стиль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>PO</TableHead>
                <TableHead>Срок</TableHead>
                <TableHead>Замечание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PARTNER_FACTORY_SAMPLES.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="text-sm">{s.style}</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.issue === '—' ? 'secondary' : 'destructive'}
                      className="text-[10px]"
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.poRef ?? '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{s.dueAt ?? '—'}</TableCell>
                  <TableCell className="max-w-[240px] text-xs">{s.issue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {PARTNER_FACTORY_SAMPLES.map((s) => (
          <Card key={s.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">
                {s.id} · {s.style}
              </CardTitle>
              <Badge
                variant={s.issue === '—' ? 'secondary' : 'destructive'}
                className="text-[10px]"
              >
                {s.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              {s.poRef && <p>PO: {s.poRef}</p>}
              {s.dueAt && <p>Срок: {s.dueAt}</p>}
              <p className="text-foreground">{s.issue}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </CabinetPageContent>
  );
}
