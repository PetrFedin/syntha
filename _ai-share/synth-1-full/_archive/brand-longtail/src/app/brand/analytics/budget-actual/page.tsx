'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Download } from 'lucide-react';
import { getBudgetActualLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { listBudgetActualSnapshots } from '@/lib/api/analytics';
import type { BudgetActualSnapshot } from '@/lib/analytics/budget-actual';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  DataTableContainer,
  FilterToolbar,
  LoadingState,
  RegistryPageHeader,
} from '@/components/design-system';

const PERIODS = ['SS26', 'FW25', 'SS25'];

export default function BudgetActualPage() {
  const links = getBudgetActualLinks();
  const [snapshots, setSnapshots] = useState<BudgetActualSnapshot[]>([]);
  const [period, setPeriod] = useState('SS26');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listBudgetActualSnapshots(period).then((data) => {
      setSnapshots(data);
      setLoading(false);
    });
  }, [period]);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title={`Бюджет: план / факт — ${period}`}
        leadPlain="Единый паттерн снимков по категориям. При API — данные из snapshot_* и импорт 1С / МойСклад."
        actions={
          <Button variant="outline" size="sm" disabled title="При подключении API">
            <Download className="mr-2 h-4 w-4" /> Экспорт
          </Button>
        }
      />

      <FilterToolbar className="items-center justify-between">
        <Link href={ROUTES.brand.analyticsBi}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </FilterToolbar>

      <Card className="border-border-default shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Сводка по периоду (рубли)
          </CardTitle>
          <CardDescription>План и факт по категориям.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <DataTableContainer
            bordered={false}
            className="px-0"
            footer={
              <p className="text-text-muted px-4 pb-4 text-xs">
                API: listBudgetActualSnapshots(period).
              </p>
            }
          >
            {loading ? (
              <LoadingState rows={6} className="px-4 py-4" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border-default bg-bg-surface2/80 text-text-secondary border-b text-left text-xs font-semibold uppercase tracking-wide">
                    <th className="px-4 py-2.5 pr-4">Категория</th>
                    <th className="px-4 py-2.5 pr-4 text-right tabular-nums">План, ₽</th>
                    <th className="px-4 py-2.5 pr-4 text-right tabular-nums">Факт, ₽</th>
                    <th className="px-4 py-2.5 text-right tabular-nums">Исполнение</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => {
                    const pct =
                      s.plannedAmountRub > 0
                        ? Math.round((s.actualAmountRub / s.plannedAmountRub) * 100)
                        : 0;
                    const over = pct > 100;
                    return (
                      <tr
                        key={s.id}
                        className="border-border-subtle hover:bg-bg-surface2/80 border-b"
                      >
                        <td className="text-text-primary px-4 py-2.5 pr-4 font-medium">
                          {s.categoryLabel}
                        </td>
                        <td className="text-text-primary px-4 py-2.5 pr-4 text-right tabular-nums">
                          {s.plannedAmountRub.toLocaleString('ru-RU')}
                        </td>
                        <td className="text-text-primary px-4 py-2.5 pr-4 text-right tabular-nums">
                          {s.actualAmountRub.toLocaleString('ru-RU')}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-2.5 text-right font-medium tabular-nums',
                            over && 'text-amber-600',
                            !over && pct >= 90 && 'text-emerald-600'
                          )}
                        >
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </DataTableContainer>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={links} />
    </CabinetPageContent>
  );
}
