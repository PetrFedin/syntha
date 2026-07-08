'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Calendar, Grid3X3, Heart, LayoutGrid, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

/** Wave 21: JOOR-like buyer shell — Showroom | Matrix | Orders | Calendar (≤120 lines). */
const NAV = [
  { href: ROUTES.shop.b2bShowroom ?? '/shop/b2b/showroom', label: 'Шоурум', icon: LayoutGrid },
  { href: '/shop/b2b/assortment', label: 'Ассортимент', icon: LayoutGrid },
  { href: '/shop/b2b/compare', label: 'Сравнение', icon: Grid3X3 },
  { href: '/shop/b2b/matrix', label: 'Матрица', icon: Grid3X3 },
  { href: ROUTES.shop.b2bOrders ?? '/shop/b2b/orders', label: 'Заказы', icon: Package },
  { href: '/shop/b2b/calendar', label: 'Календарь', icon: Calendar },
  { href: '/shop/b2b/showroom?wishlist=1', label: 'Избранное', icon: Heart },
] as const;

export function B2bBuyerShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();

  const isNavActive = (href: string) => {
    const [path, query = ''] = href.split('?');
    if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
    if (!query) {
      if (path.endsWith('/showroom') && searchParams?.get('wishlist') === '1') return false;
      return true;
    }
    const expected = new URLSearchParams(query);
    for (const [key, value] of expected.entries()) {
      if (searchParams?.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <div className={cn('space-y-4', className)} data-testid="b2b-buyer-shell">
      <nav
        className="bg-bg-surface2/60 flex flex-wrap gap-1 rounded-xl border p-1"
        aria-label="B2B рабочее пространство"
      >
        {NAV.map((item) => {
          const active = isNavActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
