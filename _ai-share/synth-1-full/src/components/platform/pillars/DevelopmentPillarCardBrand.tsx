'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { usePlatformCoreDevelopmentStatusPoll } from '@/hooks/use-platform-core-development-status-poll';
import {
  ROUTES,
  brandDevelopmentCabinetHref,
  brandMessagesWorkshop2ArticleContextHref,
} from '@/lib/platform-core-routes';
import { BrandCentricBomConflictPanel } from '@/components/integrations/BrandCentricBomConflictPanel';
import {
  brandDevelopmentSamplePeerHref,
  brandDevelopmentSamplePeerLabelLong,
  brandDevelopmentSamplePeerLabelShort,
} from '@/lib/platform-core-brand-sample-peer';
import { platformCoreW2PrefetchHandlers } from '@/lib/platform-core-w2-prefetch';
import { isPlatformCoreEmptyChainCollection } from '@/lib/platform-core-demo-context';
import { BrandDevEmptyChainOnboarding } from '@/components/platform/BrandDevEmptyChainOnboarding';
import { BrandDevCabinetCoPeerStrip } from '@/components/platform/BrandDevCabinetCoPeerStrip';
import { BrandDevInvestorReadinessStrip } from '@/components/platform/BrandDevInvestorReadinessStrip';
import { BrandDevInvestorReadinessPeerStrip } from '@/components/platform/BrandDevInvestorReadinessPeerStrip';
import { BrandDevTasksKanbanMiniPanel } from '@/components/platform/BrandDevTasksKanbanMiniPanel';
import { BrandDevGreenfieldMonetizationSegmentStrip } from '@/components/platform/BrandDevGreenfieldMonetizationSegmentStrip';
import { brandSampleLifecycleFeatureHref } from '@/lib/platform-core-ports/fashion/brand-sample-lifecycle-workspace';
import { brandAttributeSchemaFeatureHref } from '@/lib/platform-core-ports/fashion/brand-attribute-schema-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  PillarInsightHeader,
  PillarInsightSteps,
} from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import { formatPlatformCoreSampleStatusLabelRu } from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import {
  WAVE_YF_BOM_BADGE_RU,
  WAVE_YF_NEW_SKU_RU,
  WAVE_YF_SCHEMA_ATTR_RU,
} from '@/lib/platform-core-ports/platform/wave-yf-hub-compact-ru';
import { cn } from '@/lib/utils';

type Step = { id: string; labelRu: string; done: boolean };

type StatusPayload = {
  steps: Step[];
  workshop2Href: string;
  factorySampleHref: string;
  factoryDossierHref?: string;
  supplierBomHref?: string;
  linesheetHref?: string;
  demoArticleId?: string;
};

type Props = {
  collectionId?: string;
  compact?: boolean;
  /** Кабинет hub: без golden path и дублирующего header. */
  minimalChrome?: boolean;
};

/** Baseline brand development pillar — без factory/extended imports. */
export function DevelopmentPillarCardBrand({
  collectionId: collectionIdProp,
  compact = false,
  minimalChrome = false,
}: Props) {
  const demo = usePlatformCoreDemoContext();
  const collectionId = collectionIdProp ?? demo.collectionId;

  const { tick: devPollTick, sseConnected } = usePlatformCoreDevelopmentStatusPoll(
    Boolean(collectionId),
    [collectionId],
    demo.factoryId
  );

  const { snapshot, loading: snapshotLoading } = usePillarSnapshot({
    collectionId,
    pillarId: 'development',
    roleId: 'brand',
    factoryId: demo.factoryId,
    reloadNonce: devPollTick,
  });

  const devPayload =
    snapshot?.pillarId === 'development' && 'development' in snapshot ? snapshot.development : null;
  const status: StatusPayload | null = devPayload
    ? {
        steps: devPayload.status.steps,
        workshop2Href: devPayload.status.workshop2Href,
        factorySampleHref: devPayload.status.factorySampleHref,
        factoryDossierHref: devPayload.status.factoryDossierHref,
        supplierBomHref: devPayload.status.supplierBomHref,
        linesheetHref: devPayload.status.linesheetHref,
        demoArticleId: devPayload.status.demoArticleId,
      }
    : null;
  const bomLineCount = devPayload?.bomLineCount ?? null;
  const sampleStatus = devPayload?.sampleStatus ?? null;
  const sampleQueuePosition = devPayload?.sampleQueuePosition ?? null;
  const sampleQueueTotal = devPayload?.sampleQueueTotal ?? null;

  const readyForCollection =
    status?.steps.find((s) => s.id === 'ready_for_collection')?.done === true;
  const devSteps = status?.steps ?? [];
  const devDoneCount = devSteps.filter((s) => s.done).length;
  const devProgressPct =
    devSteps.length > 0 ? Math.round((devDoneCount / devSteps.length) * 100) : null;

  const sampleStatusRu = formatPlatformCoreSampleStatusLabelRu(sampleStatus);

  const w2HubFallback = brandDevelopmentCabinetHref(collectionId);
  const w2HubHref = status?.workshop2Href ?? w2HubFallback;
  const rangePlannerHref = platformCoreUiHref(
    `${ROUTES.brand.rangePlanner}?collection=${encodeURIComponent(collectionId)}`
  );
  const w2CreateHref = brandDevelopmentCabinetHref(collectionId, undefined, { create: true });
  const brandSampleArticleId = status?.demoArticleId ?? demo.demoArticleId;
  const brandSamplePeerOpts = { sampleStatus };
  const brandSamplePeerHref = brandDevelopmentSamplePeerHref(
    collectionId,
    brandSampleArticleId,
    brandSamplePeerOpts
  );
  const sampleHandoffHref = brandSamplePeerHref;
  const brandSamplePeerLabelShort = brandDevelopmentSamplePeerLabelShort(brandSamplePeerOpts);
  const brandSamplePeerLabelLong = brandDevelopmentSamplePeerLabelLong(brandSamplePeerOpts);
  const emptyChain = isPlatformCoreEmptyChainCollection(collectionId);

  const cabinetStrips =
    compact && !minimalChrome ? (
      <div
        className={hubGadget.goldenPath}
        data-testid="brand-dev-cabinet-context-strip"
        data-audit-legacy="brand-dev-cross-context-strip"
      >
        <Link
          href={w2HubHref}
          data-testid="brand-dev-cabinet-w2-link"
          data-audit-legacy="development-w2-hub-link"
          className={hubGadget.goldenLink}
          {...platformCoreW2PrefetchHandlers}
        >
          Разработка
        </Link>
        <span className={hubGadget.goldenSep}>→</span>
        <Link
          href={rangePlannerHref}
          data-testid="brand-dev-cabinet-range-link"
          data-audit-legacy="development-range-planner-link"
          className={hubGadget.goldenLink}
        >
          План
        </Link>
        <span className={hubGadget.goldenSep}>→</span>
        <Link
          href={w2CreateHref}
          data-testid="brand-dev-cabinet-create-sku-link"
          data-audit-legacy="development-w2-create-link"
          className={hubGadget.goldenLink}
          {...platformCoreW2PrefetchHandlers}
        >
          {WAVE_YF_NEW_SKU_RU}
        </Link>
        <span className={hubGadget.goldenSep}>·</span>
        <Link
          href={sampleHandoffHref}
          data-testid="brand-dev-cross-sample-handoff-link"
          data-audit-legacy="development-sample-handoff-cta-compact"
          className={hubGadget.goldenLink}
        >
          {brandSamplePeerLabelShort}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={brandSampleLifecycleFeatureHref('rounds', collectionId)}
          data-testid="brand-dev-cabinet-sample-lifecycle-link"
          className={hubGadget.goldenLink}
        >
          Образцы
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={brandAttributeSchemaFeatureHref('health', collectionId)}
          data-testid="brand-dev-cabinet-attribute-schema-link"
          className={hubGadget.goldenLink}
        >
          {WAVE_YF_SCHEMA_ATTR_RU}
        </Link>
        {status?.supplierBomHref ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={status.supplierBomHref}
              data-testid="brand-dev-cross-supplier-bom-link"
              data-audit-legacy="development-supplier-bom-link"
              className={hubGadget.goldenLink}
            >
              BOM поставщика
            </Link>
          </>
        ) : null}
        {status?.factoryDossierHref ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={status.factoryDossierHref}
              data-testid="brand-dev-cross-factory-dossier-link"
              data-audit-legacy="development-factory-dossier-link"
              className={hubGadget.goldenLink}
            >
              Досье цеха
            </Link>
          </>
        ) : null}
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={brandMessagesWorkshop2ArticleContextHref(collectionId, brandSampleArticleId)}
          data-testid="brand-dev-cabinet-article-chat-link"
          className={hubGadget.goldenLink}
        >
          Чат ТЗ
        </Link>
      </div>
    ) : null;

  const panelTestId = compact ? 'brand-dev-cabinet-panel' : undefined;

  if (compact && snapshotLoading && !devPayload) {
    return (
      <div
        className={hubGadget.root}
        data-testid={panelTestId}
        {...(panelTestId === 'brand-dev-cabinet-panel'
          ? { 'data-development-sse-live': sseConnected ? '1' : '0' }
          : {})}
      >
        {cabinetStrips}
        <PlatformCorePillarInsightSkeleton testId="development-pillar-insight-skeleton" />
      </div>
    );
  }

  return (
    <div
      className={compact ? hubGadget.root : undefined}
      data-testid={panelTestId}
      {...(panelTestId === 'brand-dev-cabinet-panel'
        ? { 'data-development-sse-live': sseConnected ? '1' : '0' }
        : {})}
    >
      {cabinetStrips}
      {compact && !minimalChrome ? (
        <>
          <BrandDevCabinetCoPeerStrip collectionId={collectionId} />
          <div className="space-y-2" data-testid="brand-dev-dashboard-strips">
            <BrandDevInvestorReadinessStrip
              collectionId={collectionId}
              articleId={brandSampleArticleId}
              variant="compact"
            />
            <BrandDevInvestorReadinessPeerStrip
              collectionId={collectionId}
              omitKanbanLink
              omitReleaseGate
            />
            <BrandDevGreenfieldMonetizationSegmentStrip collectionId={collectionId} />
            <BrandDevTasksKanbanMiniPanel collectionId={collectionId} variant="compact" />
          </div>
        </>
      ) : null}
      {compact && emptyChain ? (
        <BrandDevEmptyChainOnboarding collectionId={collectionId} variant="cabinet" />
      ) : null}
      <Card
        data-testid="development-pillar-card"
        className={cn(compact ? hubGadget.pillarCard : 'border-emerald-200/50')}
      >
        {!compact ? (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden />
              ТЗ → образец
            </CardTitle>
            <CardDescription className="text-xs">
              Досье W2, gates и передача образцов на цех до сборки коллекции.
            </CardDescription>
          </CardHeader>
        ) : null}
        <CardContent className={compact ? hubGadget.pillarBody : 'space-y-3'}>
          {compact && !minimalChrome ? (
            <PillarInsightHeader
              icon={Sparkles}
              title="ТЗ → образец"
              subtitle="Досье W2, gates и передача образцов на цех."
            />
          ) : null}
          {compact && !minimalChrome ? (
            <PillarInsightSteps steps={status?.steps ?? []} testId="development-pillar-steps" />
          ) : !compact ? (
            <ul className="space-y-1.5">
              {(status?.steps ?? []).map((step) => (
                <li key={step.id} className="flex items-start gap-2 text-xs">
                  {step.done ? (
                    <CheckCircle2
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                  ) : (
                    <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  )}
                  <span>{step.labelRu}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {compact && !minimalChrome ? (
            <PlatformCorePillarNotificationCenterCompact
              variant="brand"
              compact
              collectionId={collectionId}
              orderId={demo.demoOrderId}
              orderScoped
            />
          ) : null}
          {compact && !minimalChrome ? (
            <div className={hubGadget.statRow}>
              {devProgressPct != null ? (
                <span className={hubGadget.stat} data-testid="development-progress-pct">
                  <strong>{devProgressPct}%</strong>
                </span>
              ) : null}
              {bomLineCount != null && bomLineCount > 0 ? (
                <Badge
                  variant="outline"
                  className={hubGadget.metaBadge}
                  data-testid="development-bom-ready-badge"
                >
                  {WAVE_YF_BOM_BADGE_RU} {bomLineCount}
                </Badge>
              ) : null}
              {sampleStatus ? (
                <Badge
                  variant="outline"
                  className={hubGadget.metaBadge}
                  data-testid="development-sample-queue-badge"
                >
                  {sampleStatusRu}
                  {sampleQueuePosition != null && sampleQueueTotal != null
                    ? ` · ${sampleQueuePosition}/${sampleQueueTotal}`
                    : ''}
                </Badge>
              ) : null}
            </div>
          ) : null}
          {compact && !minimalChrome ? (
            <BrandCentricBomConflictPanel
              collectionId={collectionId}
              articleId={brandSampleArticleId}
              compact
            />
          ) : null}
          {!compact ? (
            <div className="flex flex-wrap items-center gap-1">
              {devProgressPct != null ? (
                <Badge
                  variant="outline"
                  data-testid="development-progress-pct"
                  className="h-4 border-sky-200 bg-sky-50 px-1.5 text-[9px] text-sky-900"
                >
                  Прогресс {devProgressPct}%
                </Badge>
              ) : null}
              {bomLineCount != null && bomLineCount > 0 ? (
                <Badge
                  variant="outline"
                  data-testid="development-bom-ready-badge"
                  className="h-4 border-emerald-200 bg-emerald-50 px-1.5 text-[9px] text-emerald-800"
                >
                  BOM · {bomLineCount}{' '}
                  {bomLineCount === 1 ? 'строка' : bomLineCount < 5 ? 'строки' : 'строк'}
                </Badge>
              ) : null}
              {sampleStatus ? (
                <Badge
                  variant="outline"
                  data-testid="development-sample-queue-badge"
                  className="h-4 border-sky-200 bg-sky-50 px-1.5 text-[9px] text-sky-800"
                >
                  Образец · {sampleStatusRu}
                  {sampleQueuePosition != null && sampleQueueTotal != null
                    ? ` · #${sampleQueuePosition}/${sampleQueueTotal}`
                    : ''}
                </Badge>
              ) : null}
              {sampleQueuePosition != null && sampleQueueTotal != null ? (
                <Badge
                  variant="outline"
                  data-testid="development-sample-queue-position"
                  className="h-4 border-violet-200 bg-violet-50 px-1.5 text-[9px] text-violet-900"
                >
                  Очередь {sampleQueuePosition} из {sampleQueueTotal}
                </Badge>
              ) : null}
            </div>
          ) : null}
          {!compact ? (
            <>
              {readyForCollection && status?.linesheetHref ? (
                <Button size="sm" variant="default" asChild data-testid="development-linesheet-cta">
                  <Link href={status.linesheetHref}>
                    → Linesheet · {status.demoArticleId ?? collectionId}
                  </Link>
                </Button>
              ) : null}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link
                  href={status?.workshop2Href ?? w2HubFallback}
                  className="text-accent-primary text-xs font-medium hover:underline"
                  {...platformCoreW2PrefetchHandlers}
                >
                  Разработка артикулов
                </Link>
                <Link
                  href={brandSamplePeerHref}
                  data-testid="development-sample-handoff-cta"
                  className="text-accent-primary text-xs font-semibold hover:underline"
                >
                  {brandSamplePeerLabelLong}
                </Link>
                {status?.factoryDossierHref ? (
                  <Link
                    href={status.factoryDossierHref}
                    data-testid="development-factory-dossier-cta"
                    className="text-accent-primary text-xs font-medium hover:underline"
                  >
                    Досье цеха
                  </Link>
                ) : null}
                {status?.supplierBomHref ? (
                  <Link
                    href={status.supplierBomHref}
                    data-testid="development-supplier-bom-cta"
                    className="text-accent-primary text-xs font-medium hover:underline"
                  >
                    BOM поставщика
                  </Link>
                ) : null}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
