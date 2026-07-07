'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { products } from '@/lib/products';
import {
  parseFashionSeasonLabel,
  seasonBucketKey,
  seasonBucketLabel,
} from '@/lib/fashion/season-parse';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function SeasonAtlasPage() {
  const [only, setOnly] = useState<'all' | 'carryover'>('all');

  const buckets = useMemo(() => {
    const m = new Map<string, typeof products>();
    for (const p of products) {
      if (!p.images?.length) continue;
      const key = seasonBucketKey(p);
      if (only === 'carryover' && key !== 'carryover') continue;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(p);
    }
    const keys = [...m.keys()].sort((x, y) => {
      if (x === 'carryover') return -1;
      if (y === 'carryover') return 1;
      if (x === 'unsorted') return 1;
      if (y === 'unsorted') return -1;
      return y.localeCompare(x);
    });
    return { m, keys };
  }, [only]);

  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader
            description={
              <>
                Корзины SS/FW + год и carryover из тегов. Парсер:{' '}
                <code className="rounded bg-muted px-1 text-[10px]">season-parse</code>.
              </>
            }
          />
        </div>
        <PlatformDataBanner />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={only === 'all' ? 'default' : 'outline'}
          onClick={() => setOnly('all')}
        >
          Все сезоны
        </Button>
        <Button
          size="sm"
          variant={only === 'carryover' ? 'default' : 'outline'}
          onClick={() => setOnly('carryover')}
        >
          Только carryover
        </Button>
      </div>

      <div className="space-y-8">
        {buckets.keys.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Нет товаров в выбранном фильтре.
          </p>
        )}
        {buckets.keys.map((key) => {
          const list = buckets.m.get(key) ?? [];
          if (!list.length) return null;
          return (
            <div key={key}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold">{seasonBucketLabel(key)}</h2>
                <Badge variant="secondary">{list.length}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {list.slice(0, 8).map((p) => {
                  const meta = parseFashionSeasonLabel(p.season, p.tags);
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group overflow-hidden rounded-lg border bg-card"
                    >
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={p.images[0]?.url || '/placeholder.jpg'}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                      </div>
                      <div className="space-y-1 p-2">
                        <p className="line-clamp-2 text-[11px] font-medium group-hover:text-primary">
                          {p.name}
                        </p>
                        <p className="font-mono text-[9px] text-muted-foreground">{p.sku}</p>
                        {meta.isCarryover && (
                          <Badge variant="outline" className="text-[8px]">
                            carryover
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </CabinetPageContent>
  );
}
