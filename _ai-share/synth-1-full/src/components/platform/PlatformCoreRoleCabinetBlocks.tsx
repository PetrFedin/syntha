'use client';

import { Factory, ShoppingBag, Store, Warehouse } from 'lucide-react';
import {
  getDefaultPillarForRole,
  getPlatformCoreHubRowsForUi,
  platformCoreRolePillarHref,
  resolvePlatformCoreCollectionId,
  type CoreChainRoleId,
} from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_HUB_CARD_ROW_ROLES } from '@/lib/platform-core-hub-carousel';
import { PlatformCoreHubQuickCard } from '@/components/platform/PlatformCoreHubQuickCard';
import { useSearchParams } from 'next/navigation';

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

export function PlatformCoreRoleCabinetBlocks() {
  const searchParams = useSearchParams();
  const collectionId = resolvePlatformCoreCollectionId(searchParams.get('collection'));

  return (
    <section data-testid="platform-core-role-blocks" className="space-y-2">
      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
        Роли · быстрый вход
      </p>
      <div className={PLATFORM_CORE_HUB_CARD_ROW_ROLES}>
        {getPlatformCoreHubRowsForUi().map((row) => (
          <PlatformCoreHubQuickCard
            key={row.id}
            href={platformCoreRolePillarHref(row.id, getDefaultPillarForRole(row.id), collectionId)}
            testId={`role-block-${row.id}`}
            icon={ROLE_ICONS[row.id]}
            title={row.label}
            subtitle={ROLE_LEADS[row.id]}
            variant="role"
          />
        ))}
      </div>
    </section>
  );
}
