'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * Единый вход в три среза аналитики ритейл-центра (без трёх «вселенных» в навигации ума).
 */
export function ShopAnalyticsSegmentNav({ className }: { className?: string }) {
  const pathname = usePathname() ?? '';
  const p = pathname.replace(/\/$/, '') || '/';

  const isRetail = p.startsWith('/shop/analytics') && !p.startsWith('/shop/b2b');
  /** Маржа: калькулятор/отчёты/хаб + landed cost (себестоимость поставки). */
  const isMargin = p.startsWith('/shop/b2b/margin') || p.startsWith('/shop/b2b/landed-cost');
  /** Остальной B2B-кабинет — срез «Опт» (заказы, трекинг, пополнение и т.д.). */
  const isOpt = p.startsWith('/shop/b2b/') && !isMargin;

  const tabClass = (active: boolean) =>
    cn(
      'rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors',
      active
        ? 'bg-white text-text-primary shadow-sm ring-1 ring-border-subtle'
        : 'text-text-muted hover:bg-white/60 hover:text-text-primary'
    );

  return (
    <nav
      data-testid="shop-analytics-segment-nav"
      className={cn(
        'border-border-subtle bg-bg-surface2/90 flex w-full max-w-xl flex-wrap gap-1 rounded-lg border p-1',
        className
      )}
      aria-label="Срез аналитики"
    >
      <Link
        href={ROUTES.shop.analytics}
        className={tabClass(isRetail)}
        aria-current={isRetail ? 'page' : undefined}
      >
        Розница
      </Link>
      <Link
        href={LEGACY_ROUTES.shop.b2bAnalytics}
        className={tabClass(isOpt)}
        aria-current={isOpt ? 'page' : undefined}
      >
        Опт
      </Link>
      <Link
        href={LEGACY_ROUTES.shop.b2bMarginAnalysis}
        className={tabClass(isMargin)}
        aria-current={isMargin ? 'page' : undefined}
      >
        Маржа
      </Link>
    </nav>
  );
}
