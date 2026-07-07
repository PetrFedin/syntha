'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Workshop2B2bCampaign } from '@/lib/production/workshop2-b2b-campaign-hub';
import { formatWorkshop2B2bCampaignId } from '@/lib/production/workshop2-b2b-wave22-parity';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { ROUTES } from '@/lib/routes';

/** Wave 21: карточка linesheet — hero из vault, ₽ опт, MOQ. */
export function B2bLinesheetCampaignCard({ campaign }: { campaign: Workshop2B2bCampaign }) {
  const campaignId = formatWorkshop2B2bCampaignId(campaign.collectionId, campaign.articleId);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const pdfHref = `/api/shop/b2b/campaigns/${encodeURIComponent(campaignId)}/linesheet.pdf`;

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/shop/b2b/wishlist', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as { items?: { campaignId: string }[] };
      })
      .then((json) => {
        if (cancelled || !json?.items) return;
        setWishlisted(json.items.some((i) => i.campaignId === campaignId));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const toggleWishlist = useCallback(async () => {
    setWishBusy(true);
    try {
      if (wishlisted) {
        await fetch(`/api/shop/b2b/wishlist?campaignId=${encodeURIComponent(campaignId)}`, {
          method: 'DELETE',
        });
        setWishlisted(false);
      } else {
        await fetch('/api/shop/b2b/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId }),
        });
        setWishlisted(true);
      }
    } finally {
      setWishBusy(false);
    }
  }, [campaignId, wishlisted]);

  const wholesale = campaign.linesheet.wholesalePrice;
  const moq = campaign.linesheet.moq;
  const w2Href = workshop2ArticleHref(campaign.collectionId, campaign.articleId, {
    w2pane: 'overview',
  });
  const matrixHref = `/shop/b2b/matrix?collectionId=${encodeURIComponent(campaign.collectionId)}&articleId=${encodeURIComponent(campaign.articleId)}`;

  return (
    <Card className="overflow-hidden" data-testid="b2b-linesheet-card">
      <div className="bg-bg-surface2 relative aspect-[4/3] w-full">
        {campaign.heroImageUrl ? (
          <Image
            src={campaign.heroImageUrl}
            alt={campaign.campaignName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="text-text-muted flex h-full items-center justify-center text-xs">
            Vault preview · {campaign.articleId}
          </div>
        )}
        <Badge className="absolute left-2 top-2 uppercase" variant="secondary">
          {campaign.tier}
        </Badge>
        <button
          type="button"
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow"
          aria-label={wishlisted ? 'Убрать из избранного' : 'В избранное'}
          disabled={wishBusy}
          onClick={() => void toggleWishlist()}
          data-testid="b2b-linesheet-wishlist-heart"
        >
          <Heart className={wishlisted ? 'h-4 w-4 fill-rose-500 text-rose-500' : 'h-4 w-4'} />
        </button>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {campaign.versionLabel ?? campaign.campaignName}
        </CardTitle>
        {campaign.versionLabel && campaign.versionLabel !== campaign.campaignName ? (
          <p className="text-text-muted text-[10px]">{campaign.campaignName}</p>
        ) : null}
        <p className="text-text-secondary text-xs">
          {campaign.linesheet.preorderWindowRu?.labelRu ?? 'Окно предзаказа уточняется у бренда'}
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pb-2">
        {wholesale != null ? (
          <Badge variant="outline">{wholesale.toLocaleString('ru-RU')} ₽ опт</Badge>
        ) : null}
        {moq != null ? <Badge>MOQ {moq}</Badge> : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="default">
          <Link href={matrixHref}>Матрица заказа</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={w2Href}>W2 · разработка</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={ROUTES.shop.b2bOrders ?? '/shop/b2b/orders'}>Заказы</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={pdfHref}>PDF linesheet</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
