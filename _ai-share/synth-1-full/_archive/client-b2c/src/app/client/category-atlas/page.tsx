'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { products } from '@/lib/products';
import { buildCategoryIndex } from '@/lib/fashion/category-index';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function CategoryAtlasPage() {
  const [q, setQ] = useState('');
  const buckets = useMemo(() => buildCategoryIndex(products), []);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return buckets;
    return buckets.filter((b) => b.path.toLowerCase().includes(s));
  }, [buckets, q]);

  return (
    <CabinetPageContent maxWidth="3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader />
        </div>
        <PlatformDataBanner />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Поиск</CardTitle>
          <CardDescription>
            {buckets.length} уникальных веток · {products.length} SKU в индексе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Фильтр по названию ветки…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </CardContent>
      </Card>

      <ul className="space-y-2">
        {filtered.map((b) => (
          <li
            key={b.path}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
          >
            <span className="font-medium leading-snug">{b.path}</span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">{b.count} шт.</span>
              <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                <Link href={`/products/${b.exampleSlug}`}>Пример</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </CabinetPageContent>
  );
}
