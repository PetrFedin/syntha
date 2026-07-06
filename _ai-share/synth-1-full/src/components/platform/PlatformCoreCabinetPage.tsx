import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { RoleCoreCabinetHub } from '@/components/platform/RoleCoreCabinetHub';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';

type Props = {
  roleId: CoreChainRoleId;
  /** Куда уйти, если Platform Core mode выключен */
  fallbackHref: string;
};

/** Общая обёртка для core-кабинетов ролей (brand, shop, production, supplier). */
export function PlatformCoreCabinetPage({ roleId, fallbackHref }: Props) {
  if (!isPlatformCoreMode()) {
    redirect(fallbackHref);
  }

  return (
    <Suspense
      fallback={
        <PlatformCorePillarInsightSkeleton testId="platform-core-cabinet-hub-suspense" />
      }
    >
      <RoleCoreCabinetHub roleId={roleId} />
    </Suspense>
  );
}
