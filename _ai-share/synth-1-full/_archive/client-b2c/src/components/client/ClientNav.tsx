'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, Package, CreditCard, ShoppingBag, RotateCcw, LayoutDashboard } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

const clientNavItems = [
  { label: 'Главная', href: ROUTES.client.home, icon: LayoutDashboard },
  { label: 'Мой шкаф', href: ROUTES.client.wardrobe, icon: Shirt },
  { label: 'Try Before You Buy', href: ROUTES.client.tryBeforeYouBuy, icon: Package },
  { label: 'Заказы', href: ROUTES.client.orders, icon: ShoppingBag },
  { label: 'Возвраты', href: ROUTES.client.returns, icon: RotateCcw },
] as const;

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Клиентское меню"
      className="border-border-default bg-bg-surface2/80 flex flex-wrap items-center gap-1 border-b px-4 py-2"
    >
      {clientNavItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== ROUTES.client.home && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent-primary/15 text-accent-primary'
                : 'text-text-secondary hover:bg-bg-surface2 hover:text-text-primary'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
