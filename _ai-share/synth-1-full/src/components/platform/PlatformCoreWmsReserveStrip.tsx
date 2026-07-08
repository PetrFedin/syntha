'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU,
  PLATFORM_CORE_WMS_RESERVE_SUPPLIER_PROCUREMENT_RU,
} from '@/lib/platform-core-wms-reserve-copy';
import type { TrackingReserveTone } from '@/lib/platform-core-tracking-reserve-label';

type CheckoutVariant = {
  variant: 'checkout';
  testId?: string;
};

type WorkspaceVariant = {
  variant: 'workspace';
  checkoutHref: string;
  trackingHref: string;
  testId?: string;
};

type SupplierVariant = {
  variant: 'supplier';
  brandHandoffHref: string;
  shopTrackingHref: string;
  testId?: string;
};

type TrackingVariant = {
  variant: 'tracking';
  label: string;
  tone: TrackingReserveTone;
  testId?: string;
  sseLive?: boolean;
};

type Props = CheckoutVariant | WorkspaceVariant | SupplierVariant | TrackingVariant;

const TRACKING_TONE_CLASS: Record<TrackingReserveTone, string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  pending: 'border-amber-200 bg-amber-50 text-amber-900',
  muted: 'border-border-subtle bg-bg-surface2/60 text-text-secondary',
  warn: 'border-rose-200 bg-rose-50 text-rose-900',
};

const STRIP_BASE =
  'flex flex-wrap items-center gap-2 rounded-md border border-border-subtle bg-bg-surface2/60 px-3 py-2 text-xs';

/** Единый честный copy про WMS reserve — checkout, working-order, tracking, supplier. */
export function PlatformCoreWmsReserveStrip(props: Props) {
  if (props.variant === 'checkout') {
    const testId = props.testId ?? 'shop-co-checkout-inventory-hold';
    return (
      <p
        role="note"
        className="mt-3 max-w-prose text-xs leading-relaxed text-muted-foreground"
        data-testid={testId}
        data-audit-legacy="shop-b2b-checkout-inventory-hold"
      >
        {PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU}
      </p>
    );
  }

  if (props.variant === 'tracking') {
    const testId = props.testId ?? 'platform-core-wms-reserve-tracking';
    return (
      <p
        className={cn(
          'mt-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium',
          TRACKING_TONE_CLASS[props.tone]
        )}
        data-testid={testId}
        data-reserve-sse-live={props.sseLive ? '1' : '0'}
      >
        {props.label}
      </p>
    );
  }

  if (props.variant === 'supplier') {
    const testId = props.testId ?? 'sup-op-procurement-wms-reserve-strip';
    return (
      <div className={STRIP_BASE} data-testid={testId}>
        <Badge variant="outline" className="text-[9px]">
          WMS reserve
        </Badge>
        <span className="text-text-secondary">
          {PLATFORM_CORE_WMS_RESERVE_SUPPLIER_PROCUREMENT_RU}
        </span>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
          <Link href={props.brandHandoffHref} data-testid={`${testId}-brand-handoff-link`}>
            Передача бренда
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link href={props.shopTrackingHref} data-testid={`${testId}-shop-tracking-link`}>
            Трекинг магазина
          </Link>
        </Button>
      </div>
    );
  }

  const testId = props.testId ?? 'shop-working-order-reserve-copy';
  return (
    <div className={STRIP_BASE} data-testid={testId}>
      <Badge variant="outline" className="text-[9px]">
        WMS reserve
      </Badge>
      <span className="text-text-secondary">{PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU}</span>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={props.checkoutHref} data-testid={`${testId}-checkout-link`}>
          Оформление
        </Link>
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link href={props.trackingHref} data-testid={`${testId}-tracking-link`}>
          Трекинг · резерв
        </Link>
      </Button>
    </div>
  );
}
