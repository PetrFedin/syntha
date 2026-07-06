'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildPlatformB2bHubSession } from '@/lib/platform-core-ports/b2b/platform-b2b-hub';
import { useWorkshop2PublishedArticleCount } from '@/hooks/use-workshop2-published-article-count';
import { PlatformB2bSpineGoldenPathStrip } from '@/components/platform/PlatformB2bSpineGoldenPathStrip';
import { PlatformB2bMarketroomPublishedArticlesFeedStrip } from '@/components/platform/PlatformB2bMarketroomPublishedArticlesFeedStrip';
import { Compass, Store, Users } from 'lucide-react';

type Props = {
  collectionId?: string;
};

export function PlatformB2bHubOverviewPanel({ collectionId }: Props) {
  const session = buildPlatformB2bHubSession({ collectionId });
  const cid = session.collectionId;
  const { count, loading, error } = useWorkshop2PublishedArticleCount(cid);

  return (
    <div className="space-y-4 px-4 pb-8" data-testid="platform-b2b-hub-overview-panel">
      <PlatformB2bSpineGoldenPathStrip
        collectionId={cid}
        activeStep="hub"
        testIdPrefix="platform-b2b-hub"
      />
      <div
        className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/60 px-3 py-2 text-xs"
        data-testid="platform-b2b-hub-greenfield-buyer-strip"
      >
        <Badge variant="outline" className="text-[11px] uppercase">
          Новый магазин
        </Badge>
        <span className="text-text-secondary">
          CRM бренда → синхронизация тира → реестр и оформление заказа магазина.
        </span>
        <Button size="sm" variant="outline" className="h-8 text-[11px]" asChild>
          <Link href={session.brandCrmBuyerAssignHref} data-testid="platform-b2b-hub-overview-crm-assign-link">
            Назначение в CRM
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-[11px]" asChild>
          <Link href={session.shopRegistryGreenfieldHref} data-testid="platform-b2b-hub-overview-shop-registry-link">
            Реестр магазина
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-[11px]" asChild>
          <Link href={session.buyPathHref} data-testid="platform-b2b-hub-overview-checkout-link">
            Оформление
          </Link>
        </Button>
      </div>
      <PlatformB2bMarketroomPublishedArticlesFeedStrip collectionId={cid} maxRows={4} />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Store className="h-4 w-4" />
            <CardTitle className="text-base">Хаб B2B-платформы</CardTitle>
            {!loading && !error && count != null ? (
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-[10px] text-emerald-800"
                data-testid="platform-b2b-hub-published-pg-badge"
              >
                PG · {count} опубликовано
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            Столп 2 · sample_collection: маркетрум → партнёры → путь заказа магазина.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.marketroomShowcaseHref} data-testid="platform-hub-marketroom-link">
              Открыть маркетрум
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.partnersDirectoryHref}>Справочник партнёров</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopShowroomHref}>Шоурум магазина</Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href={session.shopMatrixHref} data-testid="platform-b2b-hub-shop-matrix-link">
              Матрица магазина
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.brandPublishHref} data-testid="platform-b2b-hub-brand-publish-link">
              Публикация бренда
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function PlatformB2bHubMarketroomBridgePanel({ collectionId }: Props) {
  const session = buildPlatformB2bHubSession({ collectionId });

  return (
    <div className="space-y-4 px-4 pb-8" data-testid="platform-b2b-hub-marketroom-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Compass className="h-4 w-4" />
            <CardTitle className="text-base">Вход в маркетрум</CardTitle>
          </div>
          <CardDescription>Полный workspace на отдельном маршруте — здесь только мост.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.marketroomShowcaseHref}>Workspace витрины</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.buyPathHref}>Вкладка пути заказа</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function PlatformB2bHubPartnersBridgePanel({ collectionId }: Props) {
  const session = buildPlatformB2bHubSession({ collectionId });

  return (
    <div className="space-y-4 px-4 pb-8" data-testid="platform-b2b-hub-partners-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">Вход в партнёров</CardTitle>
          </div>
          <CardDescription>Справочник · ростер магазинов · мост в маркетрум.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.partnersDirectoryHref}>Workspace партнёров</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.marketroomShowcaseHref}>Витрина маркетрума</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
