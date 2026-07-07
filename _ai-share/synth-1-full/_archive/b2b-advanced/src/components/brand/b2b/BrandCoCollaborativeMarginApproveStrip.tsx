'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  shopCollaborativeTabHref,
  shopCollaborativeTabReadOnlyHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { brandOrderCommsTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import { shopCollaborativeApprovalStorageModeLabelRu } from '@/lib/shop/shop-collaborative-approval-feed';
import { useShopCollaborativeSessionLive } from '@/hooks/use-shop-collaborative-session-live';
import { ShopCollaborativeSessionLiveBadges } from '@/components/shop/b2b/ShopCollaborativeSessionLiveBadges';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import type { ShopCollaborativeApprovalState } from '@/lib/shop/shop-collaborative-approval-feed';

type Props = {
  orderId: string;
  collectionId: string;
  buyerId?: string;
  /** Скрыть ссылку на текущую вкладку (дедуп strip на detail). */
  activeTab?: 'detail' | 'chat' | 'handoff';
};

/** Brand co-approve landed margin · та же PG-сессия, что shop collaborative. */
export function BrandCoCollaborativeMarginApproveStrip({
  orderId,
  collectionId,
  buyerId = 'shop1',
  activeTab,
}: Props) {
  const [state, setState] = useState<ShopCollaborativeApprovalState | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [waitingBrand, setWaitingBrand] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messageRu, setMessageRu] = useState<string | null>(null);

  const live = useShopCollaborativeSessionLive({
    orderId,
    collectionId,
    buyerId,
    enabled: Boolean(orderId.trim()),
  });

  const reload = useCallback(async () => {
    const qs = new URLSearchParams({ orderId, buyerId });
    const res = await fetch(`/api/brand/b2b/collaborative/approve?${qs}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    });
    const json = (await res.json()) as {
      ok?: boolean;
      state?: ShopCollaborativeApprovalState;
      waitingBrandMargin?: boolean;
      storageMode?: string;
      messageRu?: string;
    };
    if (!res.ok || !json.ok) return;
    setState(json.state ?? null);
    setWaitingBrand(json.waitingBrandMargin === true);
    setStorageMode(json.storageMode ?? null);
    setMessageRu(json.messageRu ?? null);
  }, [buyerId, orderId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!live.sessionPollTs) return;
    void reload();
  }, [live.sessionPollTs, reload]);

  useEffect(() => {
    if (!waitingBrand) return;
    const timer = setInterval(() => void reload(), 12_000);
    return () => clearInterval(timer);
  }, [reload, waitingBrand]);

  const onApprove = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/brand/b2b/collaborative/approve', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buyerId, orderId, brandActorLabel: 'brand' }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        advanced?: boolean;
        state?: ShopCollaborativeApprovalState;
        storageMode?: string;
        messageRu?: string;
      };
      if (json.state) setState(json.state);
      setStorageMode(json.storageMode ?? null);
      setMessageRu(json.messageRu ?? null);
      setWaitingBrand(!json.state?.marginDone && json.state?.matrixDone === true);
    } finally {
      setBusy(false);
    }
  };

  const shopCollaborativeHref = shopCollaborativeTabHref('session', orderId, collectionId);
  const shopCollaborativeReadOnlyHref = shopCollaborativeTabReadOnlyHref(
    'session',
    orderId,
    collectionId
  );
  const brandOrderDetailHref = brandOrderCommsTabHref('detail', orderId, collectionId);
  const storageLabelRu = shopCollaborativeApprovalStorageModeLabelRu(storageMode);

  return (
    <div
      className="border-border-subtle mb-4 space-y-2 rounded-lg border bg-bg-surface2/40 px-4 py-3"
      data-testid="brand-co-collaborative-margin-approve-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          Совместный заказ · маржа
        </span>
        <ShopCollaborativeSessionLiveBadges
          orderId={orderId}
          collectionId={collectionId}
          buyerId={buyerId}
          pgStorageTestId="brand-co-collaborative-storage-pg"
        />
        {storageMode === 'pg' ? null : storageLabelRu ? (
          <Badge variant="outline" className="text-[9px]">
            {storageLabelRu}
          </Badge>
        ) : null}
        {state?.marginDone ? (
          <Badge variant="secondary" className="text-[9px]" data-testid="brand-co-collaborative-margin-done">
            Согласовано
          </Badge>
        ) : waitingBrand ? (
          <Badge variant="outline" className="text-[9px]" data-testid="brand-co-collaborative-margin-pending">
            Ожидает бренда
          </Badge>
        ) : null}
      </div>
      {messageRu ? <p className="text-text-secondary text-xs">{messageRu}</p> : null}
      <div className={hubGadget.goldenPath}>
        <Link href={shopCollaborativeHref} className={hubGadget.goldenLink} data-testid="brand-co-collaborative-shop-link">
          Сессия магазина
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopCollaborativeReadOnlyHref}
          className={hubGadget.goldenLink}
          data-testid="brand-co-collaborative-readonly-link"
        >
          Сессия · только просмотр
        </Link>
        {activeTab !== 'detail' ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={brandOrderDetailHref}
              className={hubGadget.goldenLink}
              data-testid="brand-co-collaborative-order-detail-link"
            >
              Карточка заказа
            </Link>
          </>
        ) : null}
        {waitingBrand && !state?.marginDone ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              data-testid="brand-co-collaborative-margin-approve-btn"
              onClick={() => void onApprove()}
            >
              {busy ? '…' : 'Согласовать маржу'}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
