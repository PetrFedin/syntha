'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { ROUTES } from '@/lib/routes';
import { products } from '@/lib/products';
import { deriveSustainabilityBreakdown } from '@/lib/fashion/sustainability-score';
import type { SustainabilityBreakdown } from '@/lib/fashion/types';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

type Tier = 'all' | SustainabilityBreakdown['tier'];

export default function SustainabilityExplorerPage() {
  const [tier, setTier] = useState<Tier>('all');

  const ranked = useMemo(() => {
    return products
      .filter((p) => p.images?.length)
      .map((p) => ({ product: p, b: deriveSustainabilityBreakdown(p) }))
      .sort((a, b) => b.b.score - a.b.score);
  }, []);

  const filtered = useMemo(() => {
    if (tier === 'all') return ranked;
    return ranked.filter((x) => x.b.tier === tier);
  }, [ranked, tier]);

  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader iconClassName="text-emerald-600" />
        </div>
        <PlatformDataBanner />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Фильтр по уровню</CardTitle>
          <CardDescription>
            Тот же{' '}
            <code className="rounded bg-muted px-1 text-[10px]">deriveSustainabilityBreakdown</code>
            , что на PDP.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(['all', 'high', 'mid', 'low', 'unknown'] as Tier[]).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tier === t ? 'default' : 'outline'}
              onClick={() => setTier(t)}
            >
              {t === 'all' ? 'Все' : t}
            </Button>
          ))}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Показано: <strong>{filtered.length}</strong> из {ranked.length}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map(({ product: p, b }) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group overflow-hidden rounded-lg border bg-card"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={p.images[0]?.url || '/placeholder.jpg'}
                alt={p.name}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
            <div className="space-y-1 p-2">
              <p className="line-clamp-2 text-xs font-medium group-hover:text-primary">{p.name}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {b.score}
                </Badge>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {b.tier}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </CabinetPageContent>
  );
}
