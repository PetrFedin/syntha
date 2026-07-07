'use client';

import { useEffect, useState, Suspense, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { products } from '@/lib/products';
import {
  addOrRefreshPriceWatch,
  loadPriceWatchList,
  priceDeltaPct,
  removePriceWatch,
  type PriceWatchEntryV1,
} from '@/lib/fashion/price-watch-store';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

function currentPrice(sku: string): number | null {
  const p = products.find((x) => x.sku === sku);
  return p ? p.price : null;
}

function PriceWatchInner() {
  const { toast } = useToast();
  const search = useSearchParams();
  const [list, setList] = useState<PriceWatchEntryV1[]>([]);
  const addProcessed = useRef(new Set<string>());

  useEffect(() => {
    setList(loadPriceWatchList());
  }, []);

  useEffect(() => {
    const sku = search.get('addSku')?.trim();
    if (!sku || addProcessed.current.has(sku)) return;
    const p = products.find((x) => x.sku === sku);
    if (!p) {
      toast({ title: 'SKU не найден', variant: 'destructive' });
      addProcessed.current.add(sku);
      return;
    }
    addProcessed.current.add(sku);
    const next = addOrRefreshPriceWatch(p);
    setList(next);
    toast({ title: 'Добавлено в список', description: p.name });
  }, [search, toast]);

  const rows = useMemo(() => {
    return list.map((e) => {
      const cur = currentPrice(e.sku);
      const delta = cur != null ? priceDeltaPct(cur, e.priceSnapshot) : null;
      return { e, cur, delta };
    });
  }, [list]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Список</CardTitle>
          <CardDescription>
            Снимок цены при добавлении vs текущая из демо-каталога. В проде — подписка и push.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Пусто. На карточке товара нажмите «Следить за ценой».
            </p>
          ) : (
            rows.map(({ e, cur, delta }) => (
              <div
                key={e.sku}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <Link
                    href={`/products/${e.slug}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {e.nameSnapshot}
                  </Link>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{e.sku}</p>
                  <p className="mt-1 text-xs">
                    Было: <strong>{e.priceSnapshot}</strong>
                    {cur != null && (
                      <>
                        {' '}
                        → сейчас: <strong>{cur}</strong>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {delta != null && (
                    <Badge
                      variant={delta < 0 ? 'default' : 'secondary'}
                      className="font-mono text-xs"
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}%
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setList(removePriceWatch(e.sku))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function PriceWatchPage() {
  return (
    <CabinetPageContent maxWidth="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader
            description={
              <>
                Локально в браузере; контракт под price-alert <AcronymWithTooltip abbr="API" />.
              </>
            }
          />
        </div>
        <PlatformDataBanner />
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <PriceWatchInner />
      </Suspense>
    </CabinetPageContent>
  );
}
