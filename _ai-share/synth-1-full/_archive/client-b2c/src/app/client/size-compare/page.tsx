'use client';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
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
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { ROUTES } from '@/lib/routes';
import { products } from '@/lib/products';
import { buildSizeCompareRows } from '@/lib/fashion/size-compare';
import { downloadJsonFile } from '@/lib/platform/json-io';
import { Download } from 'lucide-react';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

function SizeCompareInner() {
  const search = useSearchParams();
  const defA = search.get('a') || products[0]?.slug || '';
  const defB =
    search.get('b') || products.find((p) => p.slug !== defA)?.slug || products[0]?.slug || '';

  const [slugA, setSlugA] = useState(defA);
  const [slugB, setSlugB] = useState(defB);

  const a = useMemo(() => products.find((p) => p.slug === slugA) ?? products[0], [slugA]);
  const b = useMemo(() => {
    const x = products.find((p) => p.slug === slugB);
    if (x && x.id !== a?.id) return x;
    return products.find((p) => p.id !== a?.id) ?? a;
  }, [slugB, a]);

  const rows = useMemo(() => (a && b ? buildSizeCompareRows(a, b) : []), [a, b]);

  if (!products.length) {
    return <p className="text-sm text-muted-foreground">Каталог пуст.</p>;
  }

  const exportJson = () => {
    if (!a || !b) return;
    downloadJsonFile('size-compare.json', {
      left: { slug: a.slug, sku: a.sku },
      right: { slug: b.slug, sku: b.sku },
      rows,
      exportedAt: new Date().toISOString(),
    });
  };

  if (!a || !b) {
    return <p className="text-sm text-muted-foreground">Недостаточно товаров в каталоге.</p>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: 'Товар A', value: slugA, set: setSlugA },
          { label: 'Товар B', value: slugB, set: setSlugB },
        ].map((col) => (
          <Card key={col.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{col.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={col.value}
                onChange={(e) => col.set(e.target.value)}
              >
                {products.slice(0, 50).map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name} · {p.sku}
                  </option>
                ))}
              </select>
              <Link
                href={`/products/${col.label === 'Товар A' ? a.slug : b.slug}`}
                className="flex items-center gap-3 rounded-lg border p-2 hover:bg-muted/50"
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded">
                  <Image
                    src={(col.label === 'Товар A' ? a : b).images[0]?.url || '/placeholder.jpg'}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="text-xs">
                  <p className="line-clamp-2 font-medium">
                    {(col.label === 'Товар A' ? a : b).name}
                  </p>
                  <p className="mt-1 font-mono text-muted-foreground">
                    {(col.label === 'Товар A' ? a : b).sku}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={exportJson}>
          <Download className="mr-2 h-4 w-4" />
          Экспорт JSON
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Сравнение</CardTitle>
          <CardDescription>
            Один DTO для виджета на PDP и для API `GET /compare?skus=`.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Поле</TableHead>
                <TableHead>A</TableHead>
                <TableHead>B</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.label}>
                  <TableCell className="text-xs font-medium">{r.label}</TableCell>
                  <TableCell className="max-w-[200px] break-words text-xs">{r.left}</TableCell>
                  <TableCell className="max-w-[200px] break-words text-xs">{r.right}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default function SizeComparePage() {
  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader
            description={
              <>
                Два артикула: размерный ряд, состав, сезон. Параметры URL:{' '}
                <code className="rounded bg-muted px-1 text-[10px]">a</code>,{' '}
                <code className="rounded bg-muted px-1 text-[10px]">b</code> (slug).
              </>
            }
          />
        </div>
        <PlatformDataBanner />
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <SizeCompareInner />
      </Suspense>
    </CabinetPageContent>
  );
}
