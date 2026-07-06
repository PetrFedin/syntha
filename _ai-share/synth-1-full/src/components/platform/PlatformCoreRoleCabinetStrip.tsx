'use client';

import Link from 'next/link';
import { Factory, ShoppingBag, Store, Warehouse } from 'lucide-react';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreHubRowsForUi } from '@/lib/platform-core-hub-matrix';
import { roleCoreCabinetLandingHref } from '@/lib/platform-core-cabinet-url';

const ROLE_ICONS: Record<CoreChainRoleId, typeof Store> = {
  brand: Store,
  shop: ShoppingBag,
  manufacturer: Factory,
  supplier: Warehouse,
};

type Props = {
  highlightRole?: CoreChainRoleId;
};

export function PlatformCoreRoleCabinetStrip({ highlightRole }: Props) {
  return (
    <nav
      data-testid="platform-core-role-cabinet-strip"
      aria-label="Личные кабинеты ролей"
      className="flex flex-wrap gap-2"
    >
      {getPlatformCoreHubRowsForUi().map((row) => {
        const Icon = ROLE_ICONS[row.id];
        const active = highlightRole === row.id;
        return (
          <Link
            key={row.id}
            href={roleCoreCabinetLandingHref(row.id)}
            data-testid={`role-cabinet-link-${row.id}`}
            className={
              active
                ? 'border-accent-primary bg-accent-primary/5 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold'
                : 'border-border-subtle hover:bg-bg-surface2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors'
            }
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {row.label}
          </Link>
        );
      })}
    </nav>
  );
}
