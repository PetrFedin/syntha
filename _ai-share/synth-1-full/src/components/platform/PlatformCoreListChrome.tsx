'use client';

import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  getDefaultPillarForRole,
  getPlatformCorePillarEntityLabelForDemo,
  platformCoreRolePillarHref,
  resolvePageCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { PlatformCoreContextBar } from '@/components/platform/PlatformCoreContextBar';
import { PlatformCoreRolePillarStrip } from '@/components/platform/PlatformCoreRolePillarStrip';
import { PlatformCoreEmptyChainBanner } from '@/components/platform/PlatformCoreEmptyChainBanner';
import { RolePillarCrossRoleLinks } from '@/components/platform/RolePillarCrossRoleLinks';
import {
  PlatformCoreChromeShell,
  usePlatformCoreDemoContext,
} from '@/components/platform/usePlatformCoreChainOverview';
import { ShopCoreBuyerSwitcher } from '@/components/shop/ShopCoreBuyerSwitcher';
import { usePlatformCoreEmbeddedWorkspace } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  highlightRole: CoreChainRoleId;
  /** Столп текущего экрана */
  pillarId?: CoreHubPillarId;
  /** Demo-контекст в breadcrumb */
  entityLabel?: string;
  /** Если страница знает коллекцию без query (редко) */
  pageCollectionId?: string;
  /** Возврат на предыдущий раздел golden path */
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
};

/** Минимальный chrome рабочих экранов: крошки + столпы роли + контент. */
function PlatformCoreListChromeInner({
  highlightRole,
  pillarId,
  entityLabel,
  backHref,
  backLabel = 'Назад',
  children,
}: Omit<Props, 'pageCollectionId'>) {
  const demo = usePlatformCoreDemoContext();
  const coreMode = isPlatformCoreMode();
  const embeddedWorkspace = usePlatformCoreEmbeddedWorkspace();
  const resolvedEntity =
    entityLabel ?? (pillarId ? getPlatformCorePillarEntityLabelForDemo(pillarId, demo) : undefined);
  const collectionParam = demo.collectionId !== 'SS27' ? demo.collectionId : undefined;
  const cabinetHref = platformCoreRolePillarHref(
    highlightRole,
    pillarId ?? getDefaultPillarForRole(highlightRole),
    collectionParam
  );
  const resolvedBackHref = backHref ?? (coreMode ? cabinetHref : undefined);
  const resolvedBackLabel = backLabel === 'Назад' && coreMode && !backHref ? 'Кабинет' : backLabel;

  if (embeddedWorkspace) {
    return (
      <div data-testid="platform-core-list-chrome-embedded" className="min-w-0 space-y-4">
        {highlightRole === 'shop' ? (
          <div className="shrink-0 self-start">
            <ShopCoreBuyerSwitcher />
          </div>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <div data-testid="platform-core-list-chrome" className={hubCabinet.listChrome}>
      <PlatformCoreContextBar
        roleId={highlightRole}
        pillarId={pillarId}
        entityLabel={resolvedEntity}
        showDemoIdStrip={false}
        showWorkspaceBack={coreMode}
        workspaceBackHref={resolvedBackHref}
        workspaceBackLabel={resolvedBackLabel}
      />
      {!coreMode && resolvedBackHref ? (
        <Link
          href={resolvedBackHref}
          data-testid="platform-core-workspace-back"
          className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {resolvedBackLabel}
        </Link>
      ) : null}
      <PlatformCoreEmptyChainBanner collectionId={demo.collectionId} />
      {!coreMode ? (
        <div className="flex min-w-0 flex-col gap-2 max-md:gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <PlatformCoreRolePillarStrip
            roleId={highlightRole}
            activePillarId={pillarId}
            className="w-full min-w-0 sm:w-auto sm:flex-1"
          />
          {highlightRole === 'shop' ? (
            <div className="shrink-0 self-start">
              <ShopCoreBuyerSwitcher />
            </div>
          ) : null}
        </div>
      ) : highlightRole === 'shop' ? (
        <div className="shrink-0 self-start">
          <ShopCoreBuyerSwitcher />
        </div>
      ) : null}
      {children}
      {pillarId === 'comms' ? (
        <div className={hubCabinet.commsCrossRoleFooter}>
          <RolePillarCrossRoleLinks roleId={highlightRole} pillarId={pillarId} variant="compact" />
        </div>
      ) : null}
    </div>
  );
}

function PlatformCoreListChromeWithCollection({ pageCollectionId, ...props }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    w2col: searchParams.get('w2col'),
    fallback: pageCollectionId,
  });

  return (
    <PlatformCoreChromeShell collectionId={collectionId}>
      <PlatformCoreListChromeInner {...props} />
    </PlatformCoreChromeShell>
  );
}

export function PlatformCoreListChrome(props: Props) {
  return (
    <Suspense fallback={null}>
      <PlatformCoreListChromeWithCollection {...props} />
    </Suspense>
  );
}
