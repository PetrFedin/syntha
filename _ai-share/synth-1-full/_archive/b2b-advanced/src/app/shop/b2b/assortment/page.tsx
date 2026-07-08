'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { B2bLinesheetCampaignCard } from '@/components/shop/b2b/B2bLinesheetCampaignCard';
import { B2bBuyerShell } from '@/components/shop/b2b/B2bBuyerShell';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import type {
  Workshop2B2bBuyerTier,
  Workshop2B2bCampaign,
} from '@/lib/production/workshop2-b2b-campaign-hub';

const DEMO_ARTICLES = ['demo-ss27-01', 'demo-ss27-02', 'demo-ss27-03'] as const;

/** Wave 23: assortment board — season grid как JOOR season board. */
export default function B2bAssortmentPage() {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collectionId') ?? 'SS27';
  const tierFilter = (searchParams.get('tier') ?? 'all') as Workshop2B2bBuyerTier | 'all';
  const [campaigns, setCampaigns] = useState<Workshop2B2bCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void Promise.all(
      DEMO_ARTICLES.map(async (articleId) => {
        const res = await fetch(
          `/api/shop/b2b/catalog/matrix?collectionId=${encodeURIComponent(collectionId)}&articleId=${encodeURIComponent(articleId)}&buyerTier=vip`
        );
        const json = (await res.json()) as { ok?: boolean; campaign?: Workshop2B2bCampaign };
        return json.ok && json.campaign ? json.campaign : null;
      })
    ).then((list) => {
      setCampaigns(list.filter(Boolean) as Workshop2B2bCampaign[]);
      setLoading(false);
    });
  }, [collectionId]);

  const filtered = useMemo(() => {
    if (tierFilter === 'all') return campaigns;
    return campaigns.filter((c) => c.tier === tierFilter);
  }, [campaigns, tierFilter]);

  return (
    <CabinetPageContent maxWidth="6xl">
      <B2bBuyerShell>
        <ShopB2bContentHeader lead="Доска ассортимента сезона — опубликованные кампании W2, фильтр tier/категория." />
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant={tierFilter === 'all' ? 'default' : 'outline'} asChild>
            <Link href={`/shop/b2b/assortment?collectionId=${encodeURIComponent(collectionId)}`}>
              Все tier
            </Link>
          </Button>
          {(['standard', 'prebook', 'vip'] as const).map((t) => (
            <Button key={t} size="sm" variant={tierFilter === t ? 'default' : 'outline'} asChild>
              <Link
                href={`/shop/b2b/assortment?collectionId=${encodeURIComponent(collectionId)}&tier=${t}`}
              >
                {t}
              </Link>
            </Button>
          ))}
          <Button size="sm" variant="ghost" asChild>
            <Link
              href={`/shop/b2b/compare?collectionId=${encodeURIComponent(collectionId)}&articles=${DEMO_ARTICLES.slice(0, 2).join(',')}`}
            >
              Сравнить 2 модели
            </Link>
          </Button>
        </div>
        {loading ? (
          <p className="text-text-muted text-sm">Загрузка кампаний {collectionId}…</p>
        ) : filtered.length === 0 ? (
          <p className="text-text-muted text-sm">Нет опубликованных кампаний для фильтра.</p>
        ) : (
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            data-testid="b2b-assortment-grid"
          >
            {filtered.map((c) => (
              <B2bLinesheetCampaignCard key={`${c.collectionId}-${c.articleId}`} campaign={c} />
            ))}
          </div>
        )}
      </B2bBuyerShell>
    </CabinetPageContent>
  );
}
