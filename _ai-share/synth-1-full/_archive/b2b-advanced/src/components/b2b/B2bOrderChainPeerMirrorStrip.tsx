'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  buildShopBuyerMirrorHeadline,
  formatBrandPeerStatusSummaryRu,
  type ChainPeerMirrorPayload,
} from '@/lib/platform-core-chain-peer-mirror';
import type { ShopProductionVisibility } from '@/lib/platform-core-shop-production-visibility';
import { brandB2bOrderHref, ROUTES, shopCalendarB2bOrderContextHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

type Props = {
  orderId: string;
  variant: 'brand' | 'shop';
  chain: ChainPeerMirrorPayload | null;
};

/** Зеркало статуса второй роли на том же экране заказа (PG chain-status + visibility policy). */
export function B2bOrderChainPeerMirrorStrip({ orderId, variant, chain }: Props) {
  const [visibility, setVisibility] = useState<ShopProductionVisibility | undefined>(undefined);

  useEffect(() => {
    if (variant !== 'brand' || !chain) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/shop-production-visibility`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as { ok?: boolean; visibility?: ShopProductionVisibility };
        if (!cancelled && json.ok && json.visibility) setVisibility(json.visibility);
      } catch {
        /* policy optional — default milestones */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, variant, chain]);

  const buyerHeadline = useMemo(
    () => (variant === 'brand' && chain ? buildShopBuyerMirrorHeadline(chain, visibility) : null),
    [variant, chain, visibility]
  );

  if (!chain) return null;

  if (variant === 'shop') {
    return (
      <div
        className={hubGadget.goldenPath}
        data-testid="shop-co-chain-peer-mirror"
        data-audit-legacy="shop-order-chain-peer-mirror"
      >
        <span className={hubGadget.muted}>Бренд:</span>
        <span
          className="text-xs text-text-primary"
          data-testid="shop-co-chain-peer-status-summary"
        >
          {formatBrandPeerStatusSummaryRu(chain)}
        </span>
        {chain.poStatus === 'pending_erp' ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <span className="text-xs text-amber-900" data-testid="shop-co-chain-peer-po-pending">
              В очереди цеха
            </span>
          </>
        ) : null}
        {chain.poStatus === 'synced' ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <span className="text-xs text-emerald-800" data-testid="shop-co-chain-peer-po-synced">
              Цех принял
            </span>
          </>
        ) : null}
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={brandB2bOrderHref(orderId)}
          className={hubGadget.goldenLink}
          data-testid="shop-co-chain-peer-brand-link"
        >
          Карточка бренда
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopCalendarB2bOrderContextHref(orderId)}
          className={hubGadget.goldenLink}
          data-testid="shop-co-chain-peer-calendar-link"
        >
          Календарь
        </Link>
      </div>
    );
  }

  if (!buyerHeadline) return null;

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="brand-co-chain-peer-mirror"
      data-audit-legacy="brand-order-chain-peer-mirror"
    >
      <span className={hubGadget.muted}>Магазин видит:</span>
      <span className="text-xs text-text-primary">
        {buyerHeadline.doneCount}/{buyerHeadline.totalCount} этапов ·{' '}
        {buyerHeadline.visibilityLabelRu}
      </span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={ROUTES.brand.retailers}
        className={hubGadget.goldenLink}
        data-testid="brand-co-chain-peer-disclosure-link"
      >
        Прозрачность для байера
      </Link>
    </div>
  );
}
