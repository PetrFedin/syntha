'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_PILLARS,
  PLATFORM_CORE_ROLE_LABELS,
  factoryHandoffQueueHrefForDemo,
  getDefaultPillarForRole,
  getDemoTrailPrimaryHrefForDemo,
  isPlatformCoreEmptyChainDemo,
  platformCoreRolePillarHref,
  resolvePageCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreDemoPinOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { PLATFORM_CORE_HOME_CRUMB } from '@/lib/platform-core-canonical-labels';
import { isDefaultPlatformCoreCollectionId, platformHomeHref } from '@/lib/platform-core-url-canon';
import {
  ROUTES,
  brandB2bOrderHref,
  brandDevelopmentArticleHref,
  shopB2bOrderHref,
} from '@/lib/platform-core-routes';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-demo-context';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';

type Props = {
  roleId: CoreChainRoleId;
  pillarId?: CoreHubPillarId;
  /** Demo-контекст (orderId, articleId, …) */
  entityLabel?: string;
  /** Переопределение orderId на странице детализации */
  orderId?: string;
  /** Сквозные кликабельные id: collection · article · order · PO */
  showDemoIdStrip?: boolean;
  /** Core workspace: ← кабинет в одной строке с контекстом */
  showWorkspaceBack?: boolean;
  workspaceBackHref?: string;
  workspaceBackLabel?: string;
  /** Core cabinet: одна строка ← Platform · роль · столп (сезон не в пути при demo pin). */
  compactCabinet?: boolean;
  /** Comms / order context — одна строка chips под bar. */
  contextChips?: Array<{ label: string; href: string; testId: string }>;
};

function DemoIdChip({
  label,
  value,
  href,
  testId,
}: {
  label: string;
  value: string;
  href: string;
  testId: string;
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      title={`${label}: ${value}`}
      className="bg-bg-surface2 text-text-muted hover:text-text-primary hover:bg-bg-surface border-border-subtle inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[9px] transition-colors hover:underline"
    >
      <span className="text-text-muted font-sans text-[8px] font-bold uppercase tracking-wide">
        {label}
      </span>
      {value}
    </Link>
  );
}

export function PlatformCoreContextBar({
  roleId,
  pillarId,
  entityLabel,
  orderId: orderIdProp,
  showDemoIdStrip = true,
  showWorkspaceBack = false,
  workspaceBackHref,
  workspaceBackLabel = 'Кабинет',
  compactCabinet = false,
  contextChips,
}: Props) {
  const demo = usePlatformCoreDemoContext();
  const coreMode = isPlatformCoreMode();
  const emptyChain = isPlatformCoreEmptyChainDemo(demo);
  const collectionId = resolvePageCollectionId({ collection: demo.collectionId });
  const collectionParam =
    collectionId && !isDefaultPlatformCoreCollectionId(collectionId) ? collectionId : undefined;
  const pillarTitle = pillarId ? PLATFORM_CORE_PILLARS.find((p) => p.id === pillarId)?.title : null;
  const entityHref = pillarId ? getDemoTrailPrimaryHrefForDemo(pillarId, demo) : undefined;
  const cabinetHref =
    workspaceBackHref ??
    platformCoreRolePillarHref(
      roleId,
      pillarId ?? getDefaultPillarForRole(roleId),
      collectionParam
    );

  const orderId = (orderIdProp ?? demo.demoOrderId).trim();
  const showOrderChip =
    orderId.length > 0 &&
    (!isPlatformCoreDemoPinOrderId(orderId) || orderId === demo.demoOrderId.trim());
  const orderHref = roleId === 'shop' ? shopB2bOrderHref(orderId) : brandB2bOrderHref(orderId);
  const brandW2ArticleHref = brandDevelopmentArticleHref(demo.collectionId, demo.demoArticleId);
  const articleHref =
    roleId === 'brand' || roleId === 'shop'
      ? brandW2ArticleHref
      : `/factory/production/dossier/${encodeURIComponent(demo.demoArticleId)}?collection=${encodeURIComponent(demo.collectionId)}`;
  const collectionHref = platformHomeHref(collectionId);
  const poHref = factoryHandoffQueueHrefForDemo(demo);
  const collectionLabel = getPlatformCoreCollectionLabel(collectionId);
  const homeHref = platformHomeHref(collectionId);
  const showCollectionInPath = !isDefaultPlatformCoreCollectionId(collectionId);

  if (coreMode && compactCabinet) {
    return (
      <div className="min-w-0" data-testid="platform-core-context-bar-wrap">
        <nav
          data-testid="platform-core-context-bar"
          aria-label="Контекст Platform Core"
          className={hubCabinet.contextBar}
        >
          <Link
            href={homeHref}
            data-testid="platform-core-cabinet-back-home"
            className={hubCabinet.contextBarBack}
          >
            <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden />
            {PLATFORM_CORE_HOME_CRUMB}
          </Link>
          <span className={hubCabinet.contextBarSep} aria-hidden>
            ·
          </span>
          <span className="text-text-primary shrink-0 font-semibold">
            {PLATFORM_CORE_ROLE_LABELS[roleId]}
          </span>
          {showCollectionInPath ? (
            <>
              <span className={hubCabinet.contextBarSep} aria-hidden>
                ·
              </span>
              <span className="text-text-secondary shrink-0">{collectionLabel}</span>
            </>
          ) : null}
          {pillarTitle ? (
            <>
              <span className={hubCabinet.contextBarSep} aria-hidden>
                ·
              </span>
              <span className="text-text-primary shrink-0 font-medium">{pillarTitle}</span>
            </>
          ) : null}
        </nav>
        {contextChips && contextChips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1" data-testid="platform-core-context-chips">
            {contextChips.map((chip) => (
              <Link
                key={chip.testId}
                href={chip.href}
                data-testid={chip.testId}
                className={hubCabinet.contextBarEntity}
              >
                {chip.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (coreMode && showWorkspaceBack) {
    return (
      <div className="min-w-0" data-testid="platform-core-context-bar-wrap">
        <nav
          data-testid="platform-core-context-bar"
          aria-label="Контекст Platform Core"
          className={hubCabinet.contextBar}
        >
          <Link
            href={cabinetHref}
            data-testid="platform-core-workspace-back"
            className={hubCabinet.contextBarBack}
          >
            <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden />
            {workspaceBackLabel}
          </Link>
          <span className={hubCabinet.contextBarSep} aria-hidden>
            ·
          </span>
          <span className="text-text-primary shrink-0 font-semibold">
            {PLATFORM_CORE_ROLE_LABELS[roleId]}
          </span>
          {pillarTitle ? (
            <>
              <span className={hubCabinet.contextBarSep} aria-hidden>
                ·
              </span>
              <span className="text-text-primary shrink-0 font-medium">{pillarTitle}</span>
            </>
          ) : null}
          {entityLabel ? (
            <>
              <span className={hubCabinet.contextBarSep} aria-hidden>
                ·
              </span>
              {entityHref ? (
                <Link
                  href={entityHref}
                  data-testid="platform-core-context-entity"
                  title={`Контекст столпа · ${pillarTitle ?? pillarId}`}
                  className={hubCabinet.contextBarEntity}
                >
                  {entityLabel}
                </Link>
              ) : (
                <code
                  data-testid="platform-core-context-entity"
                  className={hubCabinet.contextBarEntity}
                >
                  {entityLabel}
                </code>
              )}
            </>
          ) : null}
        </nav>
      </div>
    );
  }

  return (
    <div className="space-y-1.5" data-testid="platform-core-context-bar-wrap">
      <nav
        data-testid="platform-core-context-bar"
        aria-label="Контекст Platform Core"
        className={hubCabinet.contextBar}
      >
        <Link
          href="/platform"
          className="text-text-secondary hover:text-text-primary hover:underline"
        >
          {PLATFORM_CORE_HOME_CRUMB}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={platformCoreRolePillarHref(
            roleId,
            pillarId ?? getDefaultPillarForRole(roleId),
            collectionParam
          )}
          className="hover:underline"
        >
          {PLATFORM_CORE_ROLE_LABELS[roleId]}
        </Link>
        {pillarTitle ? (
          <>
            <span aria-hidden>/</span>
            <span className="text-text-primary font-semibold">{pillarTitle}</span>
          </>
        ) : null}
        {entityLabel ? (
          <>
            <span aria-hidden>/</span>
            {entityHref ? (
              <Link
                href={entityHref}
                data-testid="platform-core-context-entity"
                title={`Контекст столпа · ${pillarTitle ?? pillarId}`}
                className={hubCabinet.contextBarEntity}
              >
                {entityLabel}
              </Link>
            ) : (
              <code
                data-testid="platform-core-context-entity"
                className={hubCabinet.contextBarEntity}
              >
                {entityLabel}
              </code>
            )}
          </>
        ) : null}
      </nav>
      {showDemoIdStrip && !emptyChain ? (
        <div
          data-testid="platform-core-demo-id-strip"
          className="flex flex-wrap items-center gap-1.5"
          aria-label="Сквозные идентификаторы цепочки"
        >
          <DemoIdChip
            label="col"
            value={collectionId}
            href={collectionHref}
            testId="platform-core-ctx-collection"
          />
          <DemoIdChip
            label="art"
            value={demo.demoArticleId}
            href={articleHref}
            testId="platform-core-ctx-article"
          />
          {showOrderChip ? (
            <DemoIdChip
              label="ord"
              value={orderId}
              href={orderHref}
              testId="platform-core-ctx-order"
            />
          ) : null}
          <DemoIdChip
            label="PO"
            value={demo.productionOrderId}
            href={poHref}
            testId="platform-core-ctx-po"
          />
        </div>
      ) : null}
    </div>
  );
}
