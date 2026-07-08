'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { B2bBuyerShell } from '@/components/shop/b2b/B2bBuyerShell';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import type { Workshop2B2bCampaign } from '@/lib/production/workshop2-b2b-campaign-hub';
import { parseWorkshop2B2bCompareArticleIds } from '@/lib/production/workshop2-b2b-wave23-parity';

type CompareRow = {
  articleId: string;
  campaignName: string;
  versionLabel?: string;
  heroImageUrl?: string;
  wholesalePriceRub: number;
  moq: number;
  sizes: string[];
};

/** Wave 23: side-by-side compare до 3 артикулов (JOOR-style). */
export default function B2bComparePage() {
  const searchParams = useSearchParams();
  const articles = useMemo(
    () => parseWorkshop2B2bCompareArticleIds(searchParams.get('articles')),
    [searchParams]
  );
  const collectionId = searchParams.get('collectionId') ?? 'SS27';
  const [rows, setRows] = useState<CompareRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articles.length) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void Promise.all(
      articles.map(async (articleId) => {
        const res = await fetch(
          `/api/shop/b2b/catalog/matrix?collectionId=${encodeURIComponent(collectionId)}&articleId=${encodeURIComponent(articleId)}`
        );
        const json = (await res.json()) as {
          ok?: boolean;
          campaign?: Workshop2B2bCampaign;
          matrix?: {
            cells: Array<{ moq: number; wholesalePriceRub: number; bestPriceRub?: number }>;
            sizes: string[];
          };
        };
        if (!json.ok || !json.matrix) return null;
        const campaign = json.campaign;
        const cell = json.matrix.cells[0];
        return {
          articleId,
          campaignName: campaign?.versionLabel ?? campaign?.campaignName ?? articleId,
          versionLabel: campaign?.versionLabel,
          heroImageUrl: campaign?.heroImageUrl,
          wholesalePriceRub: cell?.bestPriceRub ?? cell?.wholesalePriceRub ?? 0,
          moq: cell?.moq ?? 1,
          sizes: json.matrix.sizes,
        } satisfies CompareRow;
      })
    ).then((list) => {
      setRows(list.filter(Boolean) as CompareRow[]);
      setLoading(false);
    });
  }, [articles, collectionId]);

  return (
    <CabinetPageContent maxWidth="6xl">
      <B2bBuyerShell>
        <ShopB2bContentHeader lead="Сравнение моделей side-by-side: изображение, ₽ опт, MOQ, размерная сетка (до 3 артикулов)." />
        <p className="text-text-secondary text-xs">
          Пример:{' '}
          <Link
            className="text-accent-primary underline"
            href={`/shop/b2b/compare?collectionId=SS27&articles=demo-ss27-01,demo-ss27-02`}
          >
            ?articles=demo-ss27-01,demo-ss27-02
          </Link>
        </p>
        {loading ? (
          <p className="text-text-muted text-sm">Загрузка матриц…</p>
        ) : rows.length === 0 ? (
          <div className="space-y-2" data-testid="b2b-compare-empty">
            <p className="text-text-muted text-sm">
              Укажите до 3 артикулов в query (?articles=a1,a2) или выберите модели в ассортименте.
            </p>
            <Link
              className="text-accent-primary text-sm font-semibold hover:underline"
              href={`/shop/b2b/assortment?collectionId=${encodeURIComponent(collectionId)}`}
            >
              ← К доске ассортимента {collectionId}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3" data-testid="b2b-compare-grid">
            {rows.map((row) => (
              <Card key={row.articleId}>
                <div className="bg-bg-surface2 relative aspect-square w-full">
                  {row.heroImageUrl ? (
                    <Image
                      src={row.heroImageUrl}
                      alt={row.articleId}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="text-text-muted flex h-full items-center justify-center text-xs">
                      {row.articleId}
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{row.campaignName}</CardTitle>
                  <p className="text-text-muted font-mono text-[10px]">{row.articleId}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="outline">
                    {row.wholesalePriceRub.toLocaleString('ru-RU')} ₽ опт
                  </Badge>
                  <Badge>MOQ {row.moq}</Badge>
                  <p className="text-text-secondary text-xs">Размеры: {row.sizes.join(', ')}</p>
                  <Link
                    className="text-accent-primary text-xs font-semibold hover:underline"
                    href={`/shop/b2b/matrix?collectionId=${encodeURIComponent(collectionId)}&articleId=${encodeURIComponent(row.articleId)}`}
                  >
                    Матрица заказа →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </B2bBuyerShell>
    </CabinetPageContent>
  );
}
