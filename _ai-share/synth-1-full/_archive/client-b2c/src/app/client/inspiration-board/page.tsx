'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { products as libProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import {
  addPin,
  loadInspirationBoard,
  parseInspirationBoardImport,
  removePin,
  saveInspirationBoard,
  type InspirationBoardStateV1,
} from '@/lib/fashion/inspiration-board';
import { downloadJsonFile, readJsonFromFile } from '@/lib/platform/json-io';
import { Download, Upload, Trash2 } from 'lucide-react';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { useToast } from '@/hooks/use-toast';
import type { ChangeEvent } from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

function resolveProduct(slugOrId: string): Product | undefined {
  return libProducts.find((p) => p.slug === slugOrId || String(p.id) === slugOrId);
}

function InspirationBoardInner() {
  const { toast } = useToast();
  const search = useSearchParams();
  const [board, setBoard] = useState<InspirationBoardStateV1>(() => loadInspirationBoard());
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/data/products.json')
      .then((r) => r.json())
      .then((d) => {
        const arr = d as Product[];
        setCatalog(arr.length ? arr : libProducts);
      })
      .catch(() => setCatalog(libProducts));
  }, []);

  useEffect(() => {
    const add = search.get('add');
    if (!add) return;
    const p = resolveProduct(add);
    if (!p) return;
    setBoard((prev) => {
      const next = addPin(prev, p);
      if (next.pins.length > prev.pins.length) {
        saveInspirationBoard(next);
        toast({ title: 'Добавлено на доску', description: p.name });
        return next;
      }
      return prev;
    });
  }, [search, toast]);

  const byId = new Map(libProducts.map((p) => [String(p.id), p]));
  for (const p of catalog) byId.set(String(p.id), p);

  const pinProducts = board.pins
    .map((pin) => byId.get(pin.productId))
    .filter((x): x is Product => !!x);

  const persist = (updater: (prev: InspirationBoardStateV1) => InspirationBoardStateV1) => {
    setBoard((prev) => {
      const next = updater(prev);
      saveInspirationBoard(next);
      return next;
    });
  };

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const raw = await readJsonFromFile(f);
      const parsed = parseInspirationBoardImport(raw);
      if (!parsed) {
        toast({ title: 'Неверный формат', variant: 'destructive' });
        return;
      }
      persist(() => parsed);
      toast({ title: 'Доска импортирована' });
    } catch {
      toast({ title: 'Ошибка чтения', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Название доски</CardTitle>
          <CardDescription>
            Хранение в localStorage; экспорт для шаринга или API мудбордов.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={board.title}
              onChange={(e) => persist((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadJsonFile('synth-inspiration-board.json', board)}
            >
              <Download className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
            <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
              <Upload className="mr-2 h-4 w-4" />
              Импорт
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={importJson}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Пины ({board.pins.length})</h2>
        {pinProducts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
            Добавьте товары из сетки или с PDP (кнопка «На доску»).
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {board.pins.map((pin) => {
              const p = byId.get(pin.productId);
              if (!p) return null;
              return (
                <div
                  key={pin.productId}
                  className="group relative overflow-hidden rounded-lg border"
                >
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="relative aspect-square">
                      <Image
                        src={p.images[0]?.url || '/placeholder.jpg'}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    </div>
                    <p className="line-clamp-2 p-2 text-[11px]">{p.name}</p>
                  </Link>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => persist((prev) => removePin(prev, pin.productId))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Каталог</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
            {catalog.slice(0, 48).map((p) => (
              <button
                key={p.id}
                type="button"
                className="rounded-md border p-1 text-left hover:border-primary"
                onClick={() => persist((prev) => addPin(prev, p))}
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
        </CardContent>
      </Card>
    </>
  );
}

export default function InspirationBoardPage() {
  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader />
        </div>
        <PlatformDataBanner />
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <InspirationBoardInner />
      </Suspense>
    </CabinetPageContent>
  );
}
