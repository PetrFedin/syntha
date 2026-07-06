'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import {
  brandLinesheetsHrefForDemo,
  getPlatformCoreCollectionLabel,
} from '@/lib/platform-core-hub-matrix';
import { ROUTES, brandDevelopmentCabinetHref } from '@/lib/platform-core-routes';
import { RolePillarCrossRoleLinks } from '@/components/platform/RolePillarCrossRoleLinks';
import { MfrEmptyScPeerStrip } from '@/components/platform/empty-cells/MfrEmptyScPeerStrip';
import { MfrEmptyPublishStatusBadge } from '@/components/platform/empty-cells/MfrEmptyPublishStatusBadge';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { platformCoreW2PrefetchHandlers } from '@/lib/platform-core-w2-prefetch';
import { PlatformCoreStepProgressStrip } from '@/components/platform/PlatformCoreStepProgressStrip';
import { BRAND_COLLECTION_BRIDGE_LABEL } from '@/lib/platform-core-canonical-labels';
import { PLATFORM_CORE_PG_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import { MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID } from '@/lib/platform-core-ports/platform/wave-yv-mfr-empty-pillars-final';

type DevStep = { id: string; labelRu: string; done: boolean };

type SampleCollectionStatusPayload = {
  readyForBuyers: boolean;
  publishedCount: number;
  articleCount?: number;
  steps: DevStep[];
  workshop2Href: string;
  linesheetHref: string;
  linesheetPdfHref?: string | null;
  shopShowroomHref: string;
};

function ManufacturerSampleCollectionPgTable({
  status,
  testId = 'manufacturer-sample-collection-pg-table',
}: {
  status: SampleCollectionStatusPayload;
  testId?: string;
}) {
  const linesheetStep = status.steps.find((step) => step.id === 'linesheet_pack');
  const linesheetReady =
    linesheetStep?.done === true || Boolean(status.linesheetPdfHref) || status.publishedCount > 0;

  return (
    <Table data-testid={testId}>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[10px]">Показатель</TableHead>
          <TableHead className="text-[10px]">PG</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-[10px]">Опубликовано в showroom</TableCell>
          <TableCell className="text-[10px] font-semibold">{status.publishedCount} арт.</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-[10px]">Linesheet</TableCell>
          <TableCell className="text-[10px]">
            {linesheetReady ? (
              <Badge variant="secondary" className="text-[10px]">
                Готов
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Сборка
              </Badge>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function ManufacturerSampleCtaLinks({
  demo,
  status,
  compact = false,
  testIdPrefix,
}: {
  demo: PlatformCoreDemoContext;
  status: SampleCollectionStatusPayload | null;
  compact?: boolean;
  testIdPrefix: string;
}) {
  const brandW2Href =
    status?.workshop2Href ?? brandDevelopmentCabinetHref(demo.collectionId);
  const brandLinesheetHref =
    status?.linesheetHref ?? brandLinesheetsHrefForDemo(demo);
  const brandCoreSampleHref = `${ROUTES.brand.coreCabinet}?pillar=sample_collection&collection=${encodeURIComponent(demo.collectionId)}`;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <Link
          href={brandLinesheetHref}
          data-testid={`${testIdPrefix}-brand-linesheet`}
          className="text-accent-primary font-medium hover:underline"
        >
          Лайншит у бренда →
        </Link>
        <Link
          href={brandW2Href}
          data-testid={`${testIdPrefix}-brand-w2`}
          className="text-accent-primary font-medium hover:underline"
          {...platformCoreW2PrefetchHandlers}
        >
          Техпак read-only →
        </Link>
        <Link
          href={brandCoreSampleHref}
          data-testid={`${testIdPrefix}-brand-cabinet`}
          className="text-accent-primary font-medium hover:underline"
        >
          Кабинет бренда →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={brandLinesheetHref}
        data-testid={`${testIdPrefix}-brand-linesheet`}
        className="bg-accent-primary text-accent-primary-foreground inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90"
      >
        Лайншит у бренда
      </Link>
      <Link
        href={brandW2Href}
        data-testid={`${testIdPrefix}-brand-w2`}
        className="text-accent-primary font-medium hover:underline"
        {...platformCoreW2PrefetchHandlers}
      >
        Техпак у бренда · read-only
      </Link>
      <Link
        href={brandCoreSampleHref}
        data-testid={`${testIdPrefix}-brand-cabinet`}
        className="text-accent-primary font-medium hover:underline"
      >
        Кабинет бренда · коллекция
      </Link>
    </div>
  );
}

export default function ManufacturerSampleCollectionStatus({
  demo,
  compact = false,
  embedCrossRole = false,
  hideLead = false,
}: {
  demo: PlatformCoreDemoContext;
  compact?: boolean;
  embedCrossRole?: boolean;
  hideLead?: boolean;
}) {
  const { collectionId } = demo;
  const { snapshot, loading, error } = usePillarSnapshot({
    collectionId,
    pillarId: 'sample_collection',
    roleId: 'manufacturer',
  });
  const status: SampleCollectionStatusPayload | null =
    snapshot?.pillarId === 'sample_collection' && 'sampleCollection' in snapshot
      ? snapshot.sampleCollection.status
      : null;
  const loadState = loading ? 'loading' : error || !status ? 'error' : 'ready';

  if (compact) {
    return (
      <section
        data-testid={MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID}
        className="space-y-1"
      >
        <Card data-testid="manufacturer-sample-collection-mini" className="border-violet-200/60">
          <CardContent className="space-y-1.5 p-3 text-xs">
            <p className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" aria-hidden />
              {BRAND_COLLECTION_BRIDGE_LABEL}
            </p>
            {loadState === 'loading' ? (
              <p className="text-text-muted">Загрузка статуса…</p>
            ) : loadState === 'error' ? (
              <p className="text-text-muted">{PLATFORM_CORE_PG_UNAVAILABLE_RU}</p>
            ) : status ? (
              <>
                <p className="text-text-secondary flex flex-wrap items-center gap-1.5">
                  {getPlatformCoreCollectionLabel(collectionId)}
                  <MfrEmptyPublishStatusBadge
                    publishedCount={status.publishedCount}
                    readyForBuyers={status.readyForBuyers}
                  />
                </p>
                <ManufacturerSampleCollectionPgTable
                  status={status}
                  testId="manufacturer-sample-collection-mini-pg-table"
                />
                <PlatformCoreStepProgressStrip
                  steps={status.steps}
                  testId="manufacturer-sample-collection-mini-steps"
                  variant="horizontal"
                />
              </>
            ) : null}
            <ManufacturerSampleCtaLinks
              demo={demo}
              status={status}
              compact
              testIdPrefix="manufacturer-sample-collection-mini"
            />
            {isPlatformCoreMode() ? <MfrEmptyScPeerStrip demo={demo} /> : null}
          </CardContent>
        </Card>
        {embedCrossRole ? (
          <RolePillarCrossRoleLinks
            roleId="manufacturer"
            pillarId="sample_collection"
            variant="compact"
          />
        ) : null}
      </section>
    );
  }

  return (
    <section
      data-testid={MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID}
      className="space-y-2"
    >
      <Card data-testid="manufacturer-sample-collection" className="border-violet-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
            Статус коллекции у бренда
          </CardTitle>
          {hideLead ? null : (
            <CardDescription className="text-xs">
              Лайншиты и витрину ведёт бренд; цех видит сводку из базы без редактора.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {loadState === 'loading' ? (
            <p className="text-text-muted">Загрузка статуса коллекции…</p>
          ) : null}
          {loadState === 'error' ? (
            <p className="text-text-muted">{PLATFORM_CORE_PG_UNAVAILABLE_RU}</p>
          ) : null}
          {loadState === 'ready' && status ? (
            <>
              <p className="text-text-secondary flex flex-wrap items-center gap-1.5">
                <strong>{getPlatformCoreCollectionLabel(collectionId)}</strong>
                <MfrEmptyPublishStatusBadge
                  publishedCount={status.publishedCount}
                  readyForBuyers={status.readyForBuyers}
                />
                {!status.readyForBuyers && status.publishedCount <= 0 ? (
                  <span className="text-text-muted">· ещё собирается</span>
                ) : null}
              </p>
              <ManufacturerSampleCollectionPgTable status={status} />
              <PlatformCoreStepProgressStrip
                steps={status.steps}
                testId="manufacturer-sample-collection-steps"
                variant="horizontal"
              />
              <ManufacturerSampleCtaLinks
                demo={demo}
                status={status}
                testIdPrefix="manufacturer-sample-collection"
              />
              {isPlatformCoreMode() ? <MfrEmptyScPeerStrip demo={demo} /> : null}
            </>
          ) : null}
        </CardContent>
      </Card>
      {embedCrossRole ? (
        <RolePillarCrossRoleLinks
          roleId="manufacturer"
          pillarId="sample_collection"
          variant="compact"
        />
      ) : null}
    </section>
  );
}
