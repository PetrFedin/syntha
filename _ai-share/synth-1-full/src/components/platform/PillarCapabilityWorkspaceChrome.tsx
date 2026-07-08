'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PillarCapabilityContext } from '@/lib/platform-core-ports/platform/pillar-capability-registry';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { getPillarWorkspaceCrossLinks } from '@/lib/platform-core-ports/platform/pillar-capability-workspace-nav';
import { buildPillarWorkspaceContext } from '@/lib/platform-core-ports/platform/pillar-workspace-context';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreEmbeddedWorkspace } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreHeaderHubTabClass } from '@/lib/platform-core-header-controls';
import { PillarCapabilityCrossLinksStrip } from '@/components/platform/PillarCapabilityCrossLinksStrip';

export type PillarCapabilityWorkspaceChromeProps = {
  workspaceId: string;
  ctx?: PillarCapabilityContext;
  children: ReactNode;
  /** Контент над вкладками (banner, ERP strip). */
  beforeTabs?: ReactNode;
  className?: string;
  crossLinksTitle?: string;
  crossLinksLimit?: number;
  /** Скрыть footer cross-links (на hub — без дубля «Release gate / Handoff»). */
  showCrossLinks?: boolean;
};

/**
 * Единая оболочка workspace: заголовок + вкладки фич + контент + cross-links.
 * Новая фича = запись в pillar-capability-workspaces.ts, без нового route.
 */
export function PillarCapabilityWorkspaceChrome({
  workspaceId,
  ctx = {},
  children,
  beforeTabs,
  className,
  crossLinksTitle = 'Связанные разделы',
  crossLinksLimit = 6,
  showCrossLinks = true,
}: PillarCapabilityWorkspaceChromeProps) {
  const { workspace, activeFeatureId, setActiveFeatureId } =
    usePillarCapabilityWorkspace(workspaceId);

  const effectiveCtx = useMemo(
    () => (workspace ? buildPillarWorkspaceContext(workspaceId, ctx) : ctx),
    [workspaceId, ctx, workspace]
  );
  const embeddedWorkspace = usePlatformCoreEmbeddedWorkspace();

  if (!workspace) return <>{children}</>;

  const coreMode = isPlatformCoreMode();
  /** В embedded hub родитель уже узкий — lg-sidebar grid схлопывает content-колонку в 0px. */
  const coreSideNav = coreMode && !embeddedWorkspace;
  const effectiveShowCrossLinks = showCrossLinks && !coreMode;
  const crossLinks = getPillarWorkspaceCrossLinks(workspaceId, effectiveCtx, crossLinksLimit);
  const missingOrderHintCount = effectiveCtx.orderId?.trim()
    ? 0
    : crossLinks.filter((link) => link.disabled).length;

  return (
    <div
      className={cn('min-w-0 space-y-4', embeddedWorkspace && 'w-full', className)}
      data-testid={`pillar-workspace-${workspaceId}`}
    >
      {!coreMode ? (
        <header className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-text-primary text-sm font-black uppercase tracking-tight">
              {workspace.titleRu}
            </h1>
            <Badge variant="outline" className="text-[10px] uppercase">
              {workspace.pillar.replace('_', ' ')}
            </Badge>
            {effectiveCtx.role ? (
              <Badge
                variant="secondary"
                className="text-[10px] uppercase"
                data-testid={`pillar-workspace-${workspaceId}-role-${effectiveCtx.role}`}
              >
                {effectiveCtx.role}
              </Badge>
            ) : null}
          </div>
          <p className="text-text-secondary max-w-3xl text-sm">{workspace.leadRu}</p>
        </header>
      ) : null}

      {beforeTabs}

      <div
        className={cn(
          coreSideNav && 'lg:grid lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:items-start lg:gap-4',
          embeddedWorkspace && coreMode && 'min-w-0 space-y-4'
        )}
      >
        <nav
          className={cn(
            coreSideNav
              ? cn(
                  hubCabinet.workspacePillarStrip,
                  'max-lg:border-b max-lg:pb-2',
                  'lg:sticky lg:top-14 lg:flex lg:flex-col lg:gap-0.5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none'
                )
              : coreMode
                ? cn(
                    hubCabinet.workspacePillarStrip,
                    'flex flex-nowrap overflow-x-auto overscroll-x-contain border-b pb-2'
                  )
                : 'border-border-subtle flex flex-wrap gap-1 border-b pb-2'
          )}
          aria-label="Функции workspace"
          data-testid={`pillar-workspace-${workspaceId}-tabs`}
        >
          <div
            className={cn(
              coreSideNav && hubCabinet.pillarNavPillRow,
              coreSideNav &&
                'max-lg:flex max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:overscroll-x-contain',
              coreSideNav && 'lg:flex lg:flex-col lg:gap-0.5 lg:overflow-visible',
              coreMode && !coreSideNav && cn(hubCabinet.pillarNavPillRow, 'flex flex-nowrap gap-1'),
              !coreMode && 'flex flex-wrap gap-1'
            )}
          >
            {workspace.features.map((feature) => {
              const active = feature.id === activeFeatureId;
              const disabled = feature.status === 'planned';
              return (
                <button
                  key={feature.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setActiveFeatureId(feature.id)}
                  className={cn(
                    coreSideNav
                      ? cn(
                          platformCoreHeaderHubTabClass(active),
                          'max-lg:shrink-0 max-lg:snap-start',
                          'lg:flex lg:w-full lg:flex-col lg:items-start lg:rounded-lg lg:border lg:px-2 lg:py-2 lg:text-left lg:text-[13px] lg:font-semibold lg:normal-case lg:tracking-normal',
                          active
                            ? 'lg:bg-accent-primary/10 lg:text-text-primary lg:border-accent-primary/20'
                            : 'lg:text-text-secondary lg:hover:bg-bg-surface2 lg:border-transparent',
                          disabled && 'cursor-not-allowed opacity-40'
                        )
                      : coreMode
                        ? cn(platformCoreHeaderHubTabClass(active), 'shrink-0 snap-start')
                        : cn(
                            'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                            active
                              ? 'bg-text-primary text-white'
                              : 'text-text-secondary hover:bg-bg-surface2 hover:text-text-primary',
                            disabled && 'cursor-not-allowed opacity-40'
                          ),
                    disabled && 'cursor-not-allowed opacity-40'
                  )}
                  data-testid={feature.testId}
                  title={feature.summaryRu}
                >
                  {feature.labelRu}
                  {feature.status === 'stub' ? <span className="ml-1 opacity-70">·</span> : null}
                </button>
              );
            })}
          </div>
        </nav>

        <div
          className={cn('min-w-0', embeddedWorkspace && 'w-full')}
          data-testid={`pillar-workspace-${workspaceId}-panel`}
        >
          {children}
        </div>
      </div>

      {effectiveShowCrossLinks ? (
        <PillarCapabilityCrossLinksStrip
          title={crossLinksTitle}
          links={crossLinks}
          missingOrderHintCount={missingOrderHintCount}
          testId={`pillar-workspace-${workspaceId}-cross-links`}
          className="pb-safe lg:pb-0"
        />
      ) : null}
    </div>
  );
}
