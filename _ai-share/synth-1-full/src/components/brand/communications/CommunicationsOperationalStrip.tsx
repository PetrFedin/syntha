'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

/**
 * Быстрый операционный контур рядом с чатом/календарём: B2B, ЭДО РФ, задачи —
 * профессиональный слой поверх «просто переписки».
 */
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { operationalLayoutContract as o } from '@/lib/ui/operational-layout-contract';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type Variant = 'brand' | 'shop';

const BRAND_LINKS: { label: string; href: string }[] = [
  { label: 'B2B-заказы', href: ROUTES.brand.b2bOrders },
  { label: 'Задачи', href: `${ROUTES.brand.calendar}?layers=tasks` },
  { label: 'ЭДО РФ', href: ROUTES.brand.localCompliance },
  { label: 'НДС · terms', href: ROUTES.brand.financeRf },
  { label: 'Документы', href: ROUTES.brand.documents },
  { label: 'Контроль-центр', href: ROUTES.brand.controlCenter },
];

const SHOP_LINKS: { label: string; href: string }[] = [
  { label: 'B2B-заказы', href: ROUTES.shop.b2bOrders },
  { label: 'Календарь поставок', href: LEGACY_ROUTES.shop.b2bDeliveryCalendar },
  { label: 'Документы', href: LEGACY_ROUTES.shop.b2bDocuments },
  { label: 'Контракты', href: ROUTES.shop.b2bContracts },
  { label: 'Карта B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
];

export function CommunicationsOperationalStrip({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  if (isPlatformCoreMode()) return null;

  const links = variant === 'brand' ? BRAND_LINKS : SHOP_LINKS;

  return (
    <div
      className={cn(
        o.panel,
        'border-border-default/80 flex flex-col gap-2 px-3 py-2.5 shadow-none',
        className
      )}
      data-testid="communications-operational-strip"
    >
      <p className="text-text-muted text-[9px] leading-snug">
        Надстройка: чат и календарь — для сроков и договорённостей; объёмы заказа, ТЗ и документы
        остаются в B2B и производстве.
      </p>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
        <span className="text-text-muted mr-1 text-[9px] font-black uppercase tracking-[0.18em]">
          {variant === 'brand' ? 'Операции' : 'Закупка'}
        </span>
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
