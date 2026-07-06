'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Factory,
  ShoppingBag,
  Store,
  Warehouse,
} from 'lucide-react';
import {
  getDefaultPillarForRole,
  getPlatformCoreHubRowsForUi,
  platformCoreRolePillarHref,
  resolvePlatformCoreCollectionId,
  type CoreChainRoleId,
} from '@/lib/platform-core-hub-matrix';
import { isDefaultPlatformCoreCollectionId } from '@/lib/platform-core-url-canon';
import {
  PLATFORM_CORE_HUB_CARD_ROLE_HORIZONTAL_WIDTH,
  PLATFORM_CORE_HUB_CARD_ROW_ROLES,
  PLATFORM_CORE_HUB_CARD_ROW_ROLES_HORIZONTAL,
  PLATFORM_CORE_HUB_CARD_ROW_ROLES_VERTICAL,
} from '@/lib/platform-core-hub-carousel';
import { hubSectionLabelClassName, platformCoreHubLayout } from '@/lib/platform-core-hub-layout';
import { PlatformCoreHubQuickCard } from '@/components/platform/PlatformCoreHubQuickCard';
import { cn } from '@/lib/utils';

const ROLE_ICONS: Record<CoreChainRoleId, typeof Store> = {
  brand: Store,
  shop: ShoppingBag,
  manufacturer: Factory,
  supplier: Warehouse,
};

const ROLE_LEADS: Record<CoreChainRoleId, string> = {
  brand: 'Коллекции и цепочка',
  shop: 'Ассортимент и заказы',
  manufacturer: 'Производство и выпуск',
  supplier: 'Снабжение материалами',
};

function SectionLabel({ children, className }: { children: string; className?: string }) {
  return <p className={hubSectionLabelClassName(className)}>{children}</p>;
}

type Props = {
  /** horizontal — ряд картоchек слева; vertical — колонка; grid — 2×2 сетка. */
  layout?: 'grid' | 'vertical' | 'horizontal';
  className?: string;
};

/** Роли → кабинет default pillar (без подсказки «выберите роль»). */
export function PlatformCoreHubQuickEntry({ layout = 'grid', className }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePlatformCoreCollectionId(searchParams.get('collection'));
  const collectionParam = isDefaultPlatformCoreCollectionId(collectionId)
    ? undefined
    : collectionId;

  const roleRows = useMemo(() => getPlatformCoreHubRowsForUi(), []);

  return (
    <section
      data-testid="platform-core-hub-quick-entry"
      aria-label="Роли"
      className={cn(platformCoreHubLayout.sectionStack, className)}
    >
      <SectionLabel>Роли</SectionLabel>

      <div
        role="list"
        aria-label="Роли"
        data-testid="platform-core-hub-quick-roles-panel"
        className={
          layout === 'vertical'
            ? PLATFORM_CORE_HUB_CARD_ROW_ROLES_VERTICAL
            : layout === 'horizontal'
              ? PLATFORM_CORE_HUB_CARD_ROW_ROLES_HORIZONTAL
              : PLATFORM_CORE_HUB_CARD_ROW_ROLES
        }
      >
        {roleRows.map((row) => (
          <PlatformCoreHubQuickCard
            key={row.id}
            href={platformCoreRolePillarHref(
              row.id,
              getDefaultPillarForRole(row.id),
              collectionParam
            )}
            testId={`role-block-${row.id}`}
            icon={ROLE_ICONS[row.id]}
            title={row.label}
            subtitle={ROLE_LEADS[row.id]}
            variant="role"
            className={layout === 'horizontal' ? PLATFORM_CORE_HUB_CARD_ROLE_HORIZONTAL_WIDTH : undefined}
          />
        ))}
      </div>
    </section>
  );
}
