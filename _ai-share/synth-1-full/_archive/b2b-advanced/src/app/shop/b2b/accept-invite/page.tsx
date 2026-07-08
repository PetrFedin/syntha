'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { B2bBuyerShell } from '@/components/shop/b2b/B2bBuyerShell';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { persistShopCoreBuyerIdClient } from '@/lib/order/shop-core-buyer-context';
import {
  SHOP_B2B_ACCEPT_INVITE_GOLDEN_PATH_UAT_RU,
  SHOP_B2B_ACCEPT_INVITE_PARTNERS_LINK_TESTID,
  SHOP_B2B_ACCEPT_INVITE_SHOWROOM_LINK_TESTID,
  SHOP_B2B_ACCEPT_INVITE_STORAGE_PG_TESTID,
  shopPartnersAcceptInviteDiscoverHref,
  shopPartnersAcceptInviteShowroomEligibleHref,
} from '@/lib/b2b/shop-partners-wave-xk';

/** Wave XK: принятие invite-token → PG partner session + tier cookies (no localStorage in core). */
export default function B2bAcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [messageRu, setMessageRu] = useState('');
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const collectionId = 'SS27';

  useEffect(() => {
    if (!token.trim()) {
      setStatus('error');
      setMessageRu('Токен приглашения не указан.');
      return;
    }
    void (async () => {
      try {
        const res = await fetch('/api/shop/b2b/accept-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          messageRu?: string;
          buyerEmail?: string;
          buyerId?: string;
          tier?: string;
          sessionId?: string;
          storageMode?: string;
        };
        if (json.ok) {
          setStatus('ok');
          setMessageRu(`Подключено: ${json.buyerEmail}`);
          setStorageMode(json.storageMode ?? null);
          if (json.buyerId) {
            setBuyerId(json.buyerId);
            persistShopCoreBuyerIdClient(json.buyerId);
          }
          window.setTimeout(
            () =>
              router.push(
                shopPartnersAcceptInviteDiscoverHref({
                  collectionId,
                  buyerId: json.buyerId,
                })
              ),
            1200
          );
        } else {
          setStatus('error');
          setMessageRu(json.messageRu ?? 'Ошибка принятия приглашения.');
        }
      } catch {
        setStatus('error');
        setMessageRu('Сеть недоступна — повторите позже.');
      }
    })();
  }, [router, token]);

  const partnersHref = shopPartnersAcceptInviteDiscoverHref({ collectionId, buyerId: buyerId ?? undefined });
  const showroomHref = shopPartnersAcceptInviteShowroomEligibleHref({
    collectionId,
    buyerId: buyerId ?? undefined,
  });

  return (
    <CabinetPageContent maxWidth="md">
      <B2bBuyerShell>
        <ShopB2bContentHeader lead="Принятие приглашения бренда." />
        <Card data-testid="b2b-accept-invite">
          <CardHeader>
            <CardTitle className="text-base">Приглашение байера</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p
              className={
                status === 'error' ? 'text-sm text-destructive' : 'text-text-secondary text-sm'
              }
            >
              {messageRu || 'Проверка токена…'}
            </p>
            {storageMode === 'postgres' ? (
              <Badge
                variant="outline"
                className="text-[10px]"
                data-testid={SHOP_B2B_ACCEPT_INVITE_STORAGE_PG_TESTID}
              >
                PG partner session
              </Badge>
            ) : null}
            <p className="text-text-muted text-[10px] leading-snug">{SHOP_B2B_ACCEPT_INVITE_GOLDEN_PATH_UAT_RU}</p>
            {status === 'ok' ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild data-testid={SHOP_B2B_ACCEPT_INVITE_PARTNERS_LINK_TESTID}>
                  <Link href={partnersHref}>Каталог партнёров</Link>
                </Button>
                <Button asChild variant="outline" data-testid={SHOP_B2B_ACCEPT_INVITE_SHOWROOM_LINK_TESTID}>
                  <Link href={showroomHref}>Витрина · eligible-for-matrix</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </B2bBuyerShell>
    </CabinetPageContent>
  );
}
