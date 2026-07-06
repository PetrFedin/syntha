'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildPlatformB2bPartnersSession } from '@/lib/platform-core-ports/b2b/platform-b2b-partners';
import { PlatformB2bSpineGoldenPathStrip } from '@/components/platform/PlatformB2bSpineGoldenPathStrip';
import {
  fetchPlatformB2bPartnersOnboarding,
  postShopB2bPartnershipAction,
} from '@/lib/platform-core-ports/platform/platform-b2b-partners-onboarding-store';
import type { PlatformB2bPartnerOnboardingRow } from '@/lib/platform-core-ports/platform/platform-b2b-partners-onboarding-types';
import { Compass, ShoppingBag, Store } from 'lucide-react';

type Props = {
  collectionId?: string;
};

function usePlatformPartnersOnboarding(collectionId?: string) {
  const [rows, setRows] = useState<PlatformB2bPartnerOnboardingRow[]>([]);
  const [counts, setCounts] = useState({ connected: 0, requested: 0, profile: 0 });
  const [storageMode, setStorageMode] = useState<'pg' | 'fallback'>('fallback');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await fetchPlatformB2bPartnersOnboarding({ collectionId });
    setRows(result.rows);
    setCounts(result.counts);
    setStorageMode(result.storageMode);
  }, [collectionId]);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const runAction = useCallback(
    async (brandId: string, action: 'request' | 'connect') => {
      const result = await postShopB2bPartnershipAction({ action, brandId, collectionId });
      setActionMessage(result.messageRu ?? (result.ok ? 'OK' : 'Ошибка'));
      if (result.ok) await refresh();
    },
    [collectionId, refresh]
  );

  return { rows, counts, storageMode, loading, actionMessage, runAction };
}

export function PlatformB2bPartnersOnboardingPanel({ collectionId }: Props) {
  const session = buildPlatformB2bPartnersSession({ collectionId });
  const { rows, counts, storageMode, loading, actionMessage, runAction } =
    usePlatformPartnersOnboarding(collectionId);

  return (
    <div className="space-y-4 px-4 pb-8" data-testid="platform-b2b-partners-onboarding-panel">
      <PlatformB2bSpineGoldenPathStrip
        collectionId={collectionId}
        activeStep="partners"
        testIdPrefix="platform-b2b-partners"
      />
      <div
        className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/60 px-3 py-2 text-xs"
        data-testid="platform-b2b-greenfield-buyer-onboarding-strip"
      >
        <Badge variant="outline" className="text-[9px] uppercase">
          Новый магазин
        </Badge>
        <span className="text-text-secondary">
          Новый покупатель без заказов: CRM бренда → синхронизация тира → реестр и оформление.
        </span>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
          <Link
            href={session.brandCrmBuyerAssignHref}
            data-testid="platform-b2b-greenfield-brand-crm-assign-link"
          >
            Назначение в CRM бренда
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link
            href={session.shopRegistryGreenfieldHref}
            data-testid="platform-b2b-greenfield-shop-registry-link"
          >
            Реестр магазина
          </Link>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" data-testid={`platform-partners-onboarding-source-${storageMode}`}>
          {storageMode === 'pg' ? 'Онбординг PG' : 'Резервный режим'}
        </Badge>
        <Badge variant="secondary">{counts.connected} подключено</Badge>
        <Badge variant="outline">{counts.requested} запрошено</Badge>
        <Badge variant="outline">{counts.profile} профиль</Badge>
      </div>
      {actionMessage ? (
        <p className="text-text-secondary text-xs" data-testid="platform-partners-onboarding-message">
          {actionMessage}
        </p>
      ) : null}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Справочник онбординга партнёров</CardTitle>
          <CardDescription>
            профиль → запрос → подключение · shop_b2b_partnerships PG · демо-покупатель shop1.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-secondary text-sm">Загрузка onboarding…</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.brandId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  data-testid={`platform-partners-onboarding-row-${row.brandId}`}
                >
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-text-secondary text-xs">
                      {row.status}
                      {row.collectionIds.length ? ` · ${row.collectionIds.join(', ')}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{row.status}</Badge>
                    {row.status === 'profile' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void runAction(row.brandId, 'request')}
                      >
                        Запросить
                      </Button>
                    ) : null}
                    {row.status === 'requested' || row.status === 'profile' ? (
                      <Button
                        size="sm"
                        onClick={() => void runAction(row.brandId, 'connect')}
                        data-testid={`platform-partners-connect-${row.brandId}`}
                      >
                        Подключить
                      </Button>
                    ) : null}
                    {row.status === 'connected' ? (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={row.showroomHref}>Шоурум</Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PlatformB2bPartnersShopRosterPanel({ collectionId }: Props) {
  const session = buildPlatformB2bPartnersSession({ collectionId });

  return (
    <div className="space-y-4 px-4 pb-8" data-testid="platform-b2b-partners-shop-roster-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Store className="h-4 w-4" />
            <CardTitle className="text-base">Партнёрства магазина</CardTitle>
          </div>
          <CardDescription>Ростер покупателя · подбор · портал представителя (столп 2 → 3).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.shopRosterHref} data-testid="platform-partners-shop-roster-link">
              Ростер магазина
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopDiscoverHref}>Радар подбора</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function PlatformB2bPartnersMarketroomPanel({ collectionId }: Props) {
  const session = buildPlatformB2bPartnersSession({ collectionId });

  return (
    <div className="space-y-4 px-4 pb-8" data-testid="platform-b2b-partners-marketroom-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <CardTitle className="text-base">Мост в маркетрум</CardTitle>
          </div>
          <CardDescription>Лента витрины → подбор коллекций → путь заказа.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.marketroomHref} data-testid="platform-partners-marketroom-link">
              Витрина маркетрума
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.platformMarketroomDiscoverHref}>
              <Compass className="mr-1 h-3 w-3" />
              Вкладка подбора
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.buyPathHref}>Вкладка пути заказа</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
