'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import type { Product } from '@/lib/types';
import { analyzeOutfitGaps, inferFashionSlot } from '@/lib/fashion/outfit-taxonomy';
import { Sparkles } from 'lucide-react';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

function OutfitBuilderInner() {
  const search = useSearchParams();
  const seedSlug = search.get('seed');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [slots, setSlots] = useState<(Product | null)[]>([null, null, null]);

  useEffect(() => {
    fetch('/data/products.json')
      .then((r) => r.json())
      .then((d) => setCatalog((d as Product[]).slice(0, 48)))
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (!seedSlug || !catalog.length) return;
    const p = catalog.find((x) => x.slug === seedSlug);
    if (p) {
      setSlots([p, null, null]);
    }
  }, [seedSlug, catalog]);

  const gaps = analyzeOutfitGaps(slots);

  const pick = (idx: number, product: Product) => {
    const next = [...slots];
    next[idx] = product;
    setSlots(next);
  };

  const clearSlot = (idx: number) => {
    const next = [...slots];
    next[idx] = null;
    setSlots(next);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Три слота</CardTitle>
          <CardDescription>
            Классификация по названию/категории — задел под PIM-атрибут outfit_role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="min-h-[160px] space-y-2 rounded-lg border p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Слот {i + 1}
                </p>
                {slots[i] ? (
                  <div className="space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-md">
                      <Image
                        src={slots[i]!.images[0]?.url || '/placeholder.jpg'}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                    <p className="line-clamp-2 text-xs">{slots[i]!.name}</p>
                    <Badge variant="outline" className="text-[9px]">
                      {inferFashionSlot(slots[i]!)}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => clearSlot(i)}
                    >
                      Снять
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Пусто</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent-primary/25 bg-accent-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="text-accent-primary h-4 w-4" />
            Анализ образа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{gaps.hint}</p>
          {gaps.missing.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {gaps.missing.map((m) => (
                <Badge key={m} variant="secondary">
                  не хватает: {m}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Каталог</CardTitle>
        </CardHeader>
        <CardContent>
          {catalog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет данных.</p>
          ) : (
            <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
              {catalog.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="rounded-md border p-1 text-left hover:border-primary"
                  onClick={() => {
                    const empty = slots.findIndex((s) => !s);
                    if (empty >= 0) pick(empty, p);
                  }}
                >
                  <div className="relative aspect-square overflow-hidden rounded">
                    <Image
                      src={p.images[0]?.url || '/placeholder.jpg'}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10px]">{p.name}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" size="sm" asChild>
        <Link href={ROUTES.client.capsules}>К сохранённой капсуле</Link>
      </Button>
    </>
  );
}

export default function ClientOutfitBuilderPage() {
  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader description="Слоты + эвристика «дыр» в образе; связка с капсулами и визуальным поиском." />
        </div>
        <PlatformDataBanner />
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <OutfitBuilderInner />
      </Suspense>
    </CabinetPageContent>
  );
}
