'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import {
  getSyndicationSchedule,
  getSyndicationRunLog,
  runSyndicationWithValidation,
  type SyndicationRunLog,
} from '@/lib/b2b/content-syndication';
import { B2B_FIELD_LABELS } from '@/lib/b2b/b2b-catalog-contract';
import products from '@/lib/products';
import {
  Cloud,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  FileWarning,
  Download,
} from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

/** Экспорт skuErrors в CSV (UTF-8 BOM, точка с запятой). */
function exportSkuErrorsCsv(
  skuErrors: {
    sku: string;
    productId: string;
    name: string;
    errors: { field: string; message: string }[];
  }[]
) {
  const header = 'SKU;Product ID;Name;Field;Message';
  const rows = skuErrors.flatMap((row) =>
    row.errors.map((e) => {
      const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
      return [row.sku, row.productId, row.name, e.field, e.message].map(escape).join(';');
    })
  );
  const csv = '\uFEFF' + header + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fashion-cloud-sku-errors-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Скачать log.skuErrors как JSON. */
function exportSkuErrorsJson(
  skuErrors: {
    sku: string;
    productId: string;
    name: string;
    errors: { field: string; message: string }[];
  }[]
) {
  const blob = new Blob([JSON.stringify(skuErrors, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fashion-cloud-sku-errors-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BrandContentSyndicationPage() {
  const [log, setLog] = useState<SyndicationRunLog | null>(null);
  const [running, setRunning] = useState(false);
  const [brandId, setBrandId] = useState<string | undefined>('Syntha');

  const loadLog = useCallback(() => {
    setLog(getSyndicationRunLog(brandId));
  }, [brandId]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  const schedule = getSyndicationSchedule(brandId);

  const handleRunSync = async () => {
    setRunning(true);
    try {
      const brandProducts = brandId
        ? products.filter((p: any) => (p.brand ?? '').toLowerCase().includes(brandId.toLowerCase()))
        : products;
      const nextLog = await runSyndicationWithValidation(brandProducts, brandId);
      setLog(nextLog);
    } finally {
      setRunning(false);
    }
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Синдикация контента PIM → каталог байера"
        leadPlain="Fashion Cloud: расписание выгрузки, валидация контракта B2B (размерная сетка, состав, уход, EAN, медиа), лог последней выгрузки и SKU с ошибками."
        actions={<Cloud className="h-6 w-6 shrink-0 text-muted-foreground" aria-hidden />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" /> Расписание синдикации
          </CardTitle>
          <CardDescription>Выгрузка в каталог байера по расписанию (мок).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="bg-bg-surface2 inline-block rounded px-2 py-1 font-mono text-sm">
            {schedule.cron}
          </p>
          <p className="text-text-secondary text-sm">{schedule.description}</p>
          {schedule.nextRun && <p className="text-text-secondary text-xs">{schedule.nextRun}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Лог последней выгрузки
              </CardTitle>
              <CardDescription>
                Результат валидации контракта B2B перед публикацией в каталог.
              </CardDescription>
            </div>
            <Button onClick={handleRunSync} disabled={running} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
              {running ? 'Выгрузка…' : 'Запустить выгрузку'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!log ? (
            <p className="text-text-secondary text-sm">
              Выгрузка ещё не запускалась. Нажмите «Запустить выгрузку» для валидации и записи лога.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                <span className="text-text-secondary text-xs">
                  Дата: {new Date(log.runAt).toLocaleString('ru-RU')}
                </span>
                <Badge
                  variant={
                    log.status === 'success'
                      ? 'default'
                      : log.status === 'partial'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {log.status === 'success'
                    ? 'Успех'
                    : log.status === 'partial'
                      ? 'Частично'
                      : 'Ошибки'}
                </Badge>
                <span className="text-sm">
                  Обработано: <strong>{log.totalProcessed}</strong>
                </span>
                <span className="text-sm text-emerald-600">
                  Успешно: <strong>{log.successCount}</strong>
                </span>
                {log.errorCount > 0 && (
                  <span className="text-sm text-rose-600">
                    С ошибками: <strong>{log.errorCount}</strong>
                  </span>
                )}
              </div>
              {log.nextRunSchedule && (
                <p className="text-text-secondary text-xs">{log.nextRunSchedule}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {log && log.skuErrors.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-amber-800">
                  <FileWarning className="h-4 w-4" /> SKU с ошибками (PIM → каталог)
                </CardTitle>
                <CardDescription>
                  Эти артикулы не прошли валидацию контракта B2B и не попали в каталог байера.
                  Заполните обязательные поля: размерная сетка, состав, уход, EAN, главное фото.
                  Справочники:{' '}
                  <Link
                    href={ROUTES.shop.b2bSizeFinder}
                    className="text-accent-primary font-semibold hover:underline"
                  >
                    Подбор размера / размерная сетка
                  </Link>
                  ,{' '}
                  <Link
                    href={ROUTES.shop.b2bSizeMapping}
                    className="text-accent-primary font-semibold hover:underline"
                  >
                    маппинг размеров
                  </Link>
                  .
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => exportSkuErrorsCsv(log.skuErrors)}
                >
                  <Download className="h-3.5 w-3.5" /> Экспорт ошибок CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => exportSkuErrorsJson(log.skuErrors)}
                >
                  <Download className="h-3.5 w-3.5" /> Скачать JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-border-default overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-bg-surface2">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">SKU</th>
                    <th className="px-3 py-2 text-left font-medium">Товар</th>
                    <th className="px-3 py-2 text-left font-medium">Ошибки</th>
                  </tr>
                </thead>
                <tbody>
                  {log.skuErrors.map((row) => (
                    <tr key={row.productId} className="border-border-subtle border-t">
                      <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                      <td className="max-w-[200px] truncate px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">
                        <ul className="space-y-0.5">
                          {row.errors.map((e) => (
                            <li key={e.field} className="flex items-center gap-1.5 text-rose-700">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {B2B_FIELD_LABELS[e.field as keyof typeof B2B_FIELD_LABELS] ??
                                  e.field}
                                : {e.message}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.catalogQuality}>Качество каталога</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.b2bOrders}>Заказы B2B</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.products}>Товары PIM</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
