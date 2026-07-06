'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunicationsEntityContextVariant } from '@/components/brand/communications/CommunicationsEntityContextBanner';
import {
  brandCalendarB2bOrderContextHref,
  brandMessagesB2bOrderContextHref,
  factoryCalendarB2bOrderContextHref,
  factoryMessagesB2bOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
  type FactoryMessagesRole,
} from '@/lib/platform-core-routes';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

type ActiveView = 'chat' | 'calendar';

type Props = {
  variant: CommunicationsEntityContextVariant;
  orderId?: string;
  /** Явный активный экран; иначе по pathname */
  active?: ActiveView;
  className?: string;
};

function resolveActiveFromPath(pathname: string): ActiveView {
  return pathname.includes('/calendar') ? 'calendar' : 'chat';
}

function calendarHrefForVariant(
  variant: CommunicationsEntityContextVariant,
  orderId: string
): string {
  if (variant === 'brand') return brandCalendarB2bOrderContextHref(orderId);
  if (variant === 'shop') return shopCalendarB2bOrderContextHref(orderId);
  if (variant === 'supplier') return factorySupplierCalendarB2bOrderContextHref(orderId);
  return factoryCalendarB2bOrderContextHref(orderId);
}

function messagesHrefForVariant(
  variant: CommunicationsEntityContextVariant,
  orderId: string
): string {
  if (variant === 'brand') return brandMessagesB2bOrderContextHref(orderId);
  if (variant === 'shop') return shopMessagesB2bOrderContextHref(orderId);
  if (variant === 'supplier') return factorySupplierMessagesB2bOrderContextHref(orderId);
  return factoryMessagesB2bOrderContextHref(orderId, {
    role: variant as FactoryMessagesRole,
  });
}

function PlatformCoreCommsCrossNavInner({
  variant,
  orderId: orderIdProp,
  active,
  className,
}: Props) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const demo = usePlatformCoreDemoContext();
  const isBrandOrShop = variant === 'brand' || variant === 'shop';
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: isBrandOrShop ? ['allocation', 'operational'] : ['handoff'],
    actorRole: variant === 'brand' ? 'brand' : variant === 'shop' ? 'shop' : undefined,
    factoryId: !isBrandOrShop ? demo.factoryId : undefined,
  });
  const orderFromUrl =
    searchParams.get('orderId')?.trim() || searchParams.get('order')?.trim() || '';
  const orderId = orderIdProp?.trim() || orderFromUrl || spineOrderId;
  if (!orderId) return null;
  const current = active ?? resolveActiveFromPath(pathname);
  const chatHref = messagesHrefForVariant(variant, orderId);
  const calHref = calendarHrefForVariant(variant, orderId);

  const linkClass = (isActive: boolean) =>
    cn(
      'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors',
      isActive
        ? 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary'
        : 'border-border-subtle text-text-primary hover:bg-bg-surface2 hover:text-accent-primary'
    );

  return (
    <nav
      aria-label="Чат и календарь"
      className={cn(
        'border-border-subtle flex flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 shadow-sm',
        className
      )}
      data-testid="platform-core-comms-cross-nav"
    >
      <Link
        href={chatHref}
        className={linkClass(current === 'chat')}
        data-testid="comms-cross-nav-chat"
        aria-current={current === 'chat' ? 'page' : undefined}
      >
        <MessageSquare className="size-3 opacity-80" aria-hidden />
        Чат
      </Link>
      <Link
        href={calHref}
        className={linkClass(current === 'calendar')}
        data-testid="comms-cross-nav-calendar"
        aria-current={current === 'calendar' ? 'page' : undefined}
      >
        <Calendar className="size-3 opacity-80" aria-hidden />
        Календарь
      </Link>
    </nav>
  );
}

/** Компактное переключение чат ↔ календарь в столпе «Связь». */
export function PlatformCoreCommsCrossNav(props: Props) {
  return (
    <Suspense
      fallback={
        <nav
          aria-label="Чат и календарь"
          className={cn(
            'border-border-subtle flex h-9 items-center rounded-lg border bg-white px-2 shadow-sm',
            props.className
          )}
          data-testid="platform-core-comms-cross-nav"
        />
      }
    >
      <PlatformCoreCommsCrossNavInner {...props} />
    </Suspense>
  );
}
