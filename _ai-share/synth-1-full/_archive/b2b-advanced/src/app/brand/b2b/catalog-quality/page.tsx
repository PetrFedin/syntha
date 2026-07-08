'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { validateProductsForB2B } from '@/lib/b2b/b2b-catalog-contract';
import { B2B_FIELD_LABELS } from '@/lib/b2b/b2b-catalog-contract';
import type { B2BRequiredFieldId } from '@/lib/b2b/b2b-catalog-contract';
import products from '@/lib/products';
import { CheckCircle2, AlertTriangle, FileText, Download, ArrowLeft } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

/** Экспорт SKU с ошибками в CSV (разделитель — точка с запятой, UTF-8 BOM для Excel). */
function exportSkuErrorsToCsv(
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
  a.download = `sku-errors-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CatalogQualityPage() {
  const [brandId, setBrandId] = useState<string>('');

  const productsList = useMemo(() => {
    const list = (products as any[]) ?? [];
    if (!brandId.trim()) return list;
    return list.filter((p: any) => (p.brand ?? '').toLowerCase().includes(brandId.toLowerCase()));
  }, [brandId]);

  const { validSkus, skuErrors } = useMemo(
    () => validateProductsForB2B(productsList),
    [productsList]
  );

  const total = productsList.length;
  const validCount = validSkus.length;
  const errorCount = skuErrors.length;
  const percentValid = total > 0 ? Math.round((validCount / total) * 100) : 100;

  /** Поля с проблемами: поле → количество SKU, у которых есть ошибка по этому полю */
  const fieldProblems = useMemo(() => {
    const map: Record<string, number> = {};
    skuErrors.forEach((row) => {
      row.errors.forEach((e) => {
        map[e.field] = (map[e.field] ?? 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [skuErrors]);

  const handleExportCsv = useCallback(() => {
    exportSkuErrorsToCsv(
      skuErrors.map((e) => ({
        sku: e.sku,
        productId: e.productId,
        name: e.name,
        errors: e.errors.map((err) => ({ field: err.field, message: err.message })),
      }))
    );
  }, [skuErrors]);

  const brands = useMemo(() => {
    const set = new Set((products as any[]).map((p: any) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, []);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Качество каталога"
        leadPlain="Обязательные поля для B2B (размерная сетка, состав, уход, EAN, медиа). Доля SKU без ошибок, список полей с проблемами, экспорт в CSV."
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.contentSyndication} aria-label="Назад">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Фильтр по бренду</CardTitle>
          <CardDescription>
            Оставить все бренды или выбрать один для оценки качества.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!brandId ? 'default' : 'outline'}
              size="sm"
              className="rounded-lg"
              onClick={() => setBrandId('')}
            >
              Все бренды
            </Button>
            {brands.map((b) => (
              <Button
                key={b}
                variant={brandId === b ? 'default' : 'outline'}
                size="sm"
                className="rounded-lg"
                onClick={() => setBrandId(b)}
              >
                {b}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Без ошибок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-emerald-700">{validCount}</p>
            <p className="text-text-secondary text-xs">из {total} SKU</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> С ошибками
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-amber-700">{errorCount}</p>
            <p className="text-text-secondary text-xs">не прошли валидацию</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-tight">
              Доля без ошибок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">{percentValid}%</p>
            <p className="text-text-secondary text-xs">готовы к публикации в каталог байера</p>
          </CardContent>
        </Card>
      </div>

      {fieldProblems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Поля с проблемами</CardTitle>
            <CardDescription>
              По каким полям контракта B2B чаще всего есть ошибки (количество SKU).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {fieldProblems.map(([fieldId, count]) => (
                <li
                  key={fieldId}
                  className="border-border-subtle flex items-center justify-between border-b py-2 last:border-0"
                >
                  <span className="font-medium">
                    {B2B_FIELD_LABELS[fieldId as B2BRequiredFieldId] ?? fieldId}
                  </span>
                  <Badge variant="secondary">{count} SKU</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {skuErrors.length > 0 && (
        <Card className="border-amber-100">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-amber-800">
                  <FileText className="h-4 w-4" /> SKU с ошибками
                </CardTitle>
                <CardDescription>
                  Заполните обязательные поля в PIM: размерная сетка, состав, уход, EAN, главное
                  фото.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                onClick={handleExportCsv}
              >
                <Download className="h-4 w-4" /> Экспорт в CSV
              </Button>
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
                  {skuErrors.map((row) => (
                    <tr key={row.productId} className="border-border-subtle border-t">
                      <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                      <td className="max-w-[200px] truncate px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">
                        <ul className="space-y-0.5">
                          {row.errors.map((e) => (
                            <li
                              key={e.field}
                              className="flex items-center gap-1.5 text-xs text-rose-700"
                            >
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {B2B_FIELD_LABELS[e.field as B2BRequiredFieldId] ?? e.field}:{' '}
                              {e.message}
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

      {skuErrors.length === 0 && total > 0 && (
        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-emerald-600" />
            <p className="font-medium text-emerald-800">
              Все SKU проходят валидацию контракта B2B.
            </p>
            <p className="text-text-secondary mt-1 text-sm">
              Размерная сетка, состав, уход, EAN и медиа заполнены.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.contentSyndication}>Синдикация контента</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.products}>Товары PIM</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bSizeFinder}>Подбор размера / размерная сетка</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
