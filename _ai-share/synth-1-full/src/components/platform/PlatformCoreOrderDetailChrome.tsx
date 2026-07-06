'use client';

import { type ReactNode } from 'react';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreHashScroll } from '@/hooks/use-platform-core-hash-scroll';
import { usePlatformCoreOrderDetailPillarId } from '@/hooks/use-platform-core-order-detail-pillar';
import { PlatformCoreChromeShell } from '@/components/platform/usePlatformCoreChainOverview';
import { PlatformCoreContextBar } from '@/components/platform/PlatformCoreContextBar';
import { PlatformCoreRolePillarStrip } from '@/components/platform/PlatformCoreRolePillarStrip';
import { RolePillarCrossRoleLinks } from '@/components/platform/RolePillarCrossRoleLinks';
import {
  getDefaultPillarForRole,
  getPlatformCoreCollectionLabel,
  getPlatformCoreDemoByOrderId,
  platformCoreRolePillarHref,
} from '@/lib/platform-core-hub-matrix';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreEmbeddedWorkspace } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  variant: 'shop' | 'brand';
  children?: ReactNode;
};

function PlatformCoreOrderDetailChromeInner({ orderId, variant, children }: Props) {
  const embeddedWorkspace = usePlatformCoreEmbeddedWorkspace();
  if (embeddedWorkspace) {
    return <div className="min-w-0 space-y-4">{children}</div>;
  }
  const highlightRole: CoreChainRoleId = variant;
  const collectionId = getPlatformCoreDemoByOrderId(orderId).collectionId;
  const entityLabel = `Оптовый заказ · ${getPlatformCoreCollectionLabel(collectionId)}`;
  const pillarId = usePlatformCoreOrderDetailPillarId();
  const collectionParam = collectionId !== 'SS27' ? collectionId : undefined;
  const cabinetHref = platformCoreRolePillarHref(
    highlightRole,
    pillarId ?? getDefaultPillarForRole(highlightRole),
    collectionParam
  );

  usePlatformCoreHashScroll(['production-handoff', 'production-dossier', 'order-production']);

  return (
    <div data-testid="platform-core-order-detail-chrome" className={hubCabinet.orderDetailLayout}>
      <div className={hubCabinet.orderDetailMain}>
        <PlatformCoreContextBar
          roleId={highlightRole}
          pillarId={pillarId}
          entityLabel={entityLabel}
          orderId={orderId}
          showDemoIdStrip={false}
          showWorkspaceBack
          workspaceBackHref={cabinetHref}
        />
        {!isPlatformCoreMode() ? (
          <div className={cn('lg:hidden')}>
            <PlatformCoreRolePillarStrip roleId={highlightRole} activePillarId={pillarId} />
          </div>
        ) : null}
        {children}
        <div
          className={hubCabinet.orderDetailCrossRoleMobile}
          data-testid="platform-core-order-detail-cross-role-mobile"
        >
          <p className="text-text-muted mb-2 text-[10px] font-bold uppercase tracking-widest">
            Связи
          </p>
          <RolePillarCrossRoleLinks
            roleId={highlightRole}
            pillarId={pillarId}
            variant="compact"
          />
        </div>
      </div>
      <aside className={hubCabinet.orderDetailRail} data-testid="platform-core-order-detail-rail">
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Связи</p>
        <RolePillarCrossRoleLinks
          roleId={highlightRole}
          pillarId={pillarId}
          variant="compact"
        />
      </aside>
    </div>
  );
}

export function PlatformCoreOrderDetailChrome({ orderId, children, ...props }: Props) {
  const collectionId = getPlatformCoreDemoByOrderId(orderId).collectionId;
  return (
    <PlatformCoreChromeShell collectionId={collectionId}>
      <PlatformCoreOrderDetailChromeInner orderId={orderId} {...props}>
        {children}
      </PlatformCoreOrderDetailChromeInner>
    </PlatformCoreChromeShell>
  );
}
