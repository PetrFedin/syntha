'use client';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { products } from '@/lib/products';
import { findSubstituteCandidates } from '@/lib/fashion/substitute-sku';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

function SkuAlternativesInner() {
  const search = useSearchParams();
  const initialSku = search.get('sku')?.trim() || products[0]?.sku || '';
  const [sku, setSku] = useState(initialSku);

  const anchor = useMemo(() => products.find((p) => p.sku === sku) ?? products[0], [sku]);
  const candidates = useMemo(
    () => (anchor ? findSubstituteCandidates(anchor, products, 12) : []),
    [anchor]
  );

  if (!anchor) {
    return <p className="text-sm text-muted-foreground">Каталог пуст.</p>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Якорный SKU</CardTitle>
          <CardDescription>
            Правила в{' '}
            <code className="rounded bg-muted px-1 text-[10px]">findSubstituteCandidates</code> —
            заготовка под API инвентаря.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 font-mono text-sm"
            value={anchor.sku}
            onChange={(e) => setSku(e.target.value)}
          >
            {products.slice(0, 60).map((p) => (
              <option key={p.id} value={p.sku}>
                {p.sku} — {p.name}
              </option>
            ))}
          </select>
          <Link href={`/products/${anchor.slug}`} className="text-sm text-primary underline">
            Открыть карточку
          </Link>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Варианты ({candidates.length})</h2>
        {candidates.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Нет кандидатов по категории/бренду.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {candidates.map((c) => (
              <Link
                key={c.productId}
                href={`/products/${c.slug}`}
                className="group overflow-hidden rounded-lg border bg-card"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={
                      products.find((p) => p.slug === c.slug)?.images[0]?.url || '/placeholder.jpg'
                    }
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <div className="space-y-1 p-2">
                  <p className="font-mono text-[10px] text-muted-foreground">{c.sku}</p>
                  <p className="line-clamp-2 text-xs font-medium group-hover:text-primary">
                    {c.name}
                  </p>
                  <p className="line-clamp-2 text-[10px] text-muted-foreground">{c.reason}</p>
                  <p className="text-[10px]">Цвет: {c.color}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function SkuAlternativesPage() {
  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader />
        </div>
        <PlatformDataBanner />
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <SkuAlternativesInner />
      </Suspense>
    </CabinetPageContent>
  );
}
