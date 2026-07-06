'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Package } from 'lucide-react';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix';
import { factoryMessagesB2bOrderContextHref } from '@/lib/platform-core-routes';
import { RolePillarCrossRoleLinks } from '@/components/platform/RolePillarCrossRoleLinks';
import { MfrEmptyCoPeerStrip } from '@/components/platform/empty-cells/MfrEmptyCoPeerStrip';
import { MfrEmptyHandoffCountBadge } from '@/components/platform/empty-cells/MfrEmptyHandoffCountBadge';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { formatWholesaleOrderDisplayId } from '@/lib/integrations/spine/integration-ui-utils';
import { PlatformCoreStepProgressStrip } from '@/components/platform/PlatformCoreStepProgressStrip';
import { PlatformCoreTerm } from '@/components/platform/PlatformCoreTerm';
import {
  B2B_TO_PO_WORKSPACE_LABEL,
  PRODUCTION_HANDOFF_AWAITING_BRAND_RU,
  PRODUCTION_HANDOFF_QUEUE_RU,
} from '@/lib/platform-core-canonical-labels';
import { MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID } from '@/lib/platform-core-ports/platform/wave-yv-mfr-empty-pillars-final';

type DevStep = { id: string; labelRu: string; done: boolean };

const MANUFACTURER_PO_POLL_MS = 15_000;

function PlatformCoreLivePollIndicator({ testId }: { testId: string }) {
  return (
    <span
      data-testid={testId}
      className="text-text-muted inline-flex items-center gap-1.5 text-[10px] font-medium"
      title="Данные обновляются автоматически"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
      Автообновление
    </span>
  );
}

function ManufacturerPoCtaLinks({
  demo,
  handoffHref,
  orderId = '',
  compact = false,
  testIdPrefix,
}: {
  demo: PlatformCoreDemoContext;
  handoffHref: string;
  orderId?: string;
  compact?: boolean;
  testIdPrefix: string;
}) {
  const resolvedOrderId = orderId.trim();
  const messagesHref = resolvedOrderId
    ? factoryMessagesB2bOrderContextHref(resolvedOrderId, { role: 'manufacturer' })
    : handoffHref;
  const supplierProcurementHref = resolvedOrderId
    ? factoryMaterialsProcurementHrefForDemo({ ...demo, demoOrderId: resolvedOrderId })
    : factoryMaterialsProcurementHrefForDemo(demo);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <Link
          href={handoffHref}
          data-testid={`${testIdPrefix}-handoff-primary`}
          className="bg-accent-primary text-accent-primary-foreground inline-flex w-fit items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold shadow-sm transition-opacity hover:opacity-90"
        >
          Открыть очередь →
        </Link>
        <Link
          href={messagesHref}
          data-testid={`${testIdPrefix}-messages`}
          className="text-accent-primary font-medium hover:underline"
        >
          Сообщения по заказу →
        </Link>
        <Link
          href={supplierProcurementHref}
          data-testid={`${testIdPrefix}-supplier-procurement`}
          className="text-accent-primary font-medium hover:underline"
        >
          Закупка у поставщика →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={handoffHref}
        data-testid={`${testIdPrefix}-handoff-primary`}
        className="bg-accent-primary text-accent-primary-foreground inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90"
      >
        Открыть очередь
      </Link>
      <Link
        href={messagesHref}
        data-testid={`${testIdPrefix}-messages`}
        className="text-accent-primary font-medium hover:underline"
      >
        Сообщения по заказу
      </Link>
      <Link
        href={supplierProcurementHref}
        data-testid={`${testIdPrefix}-supplier-procurement`}
        className="text-accent-primary font-medium hover:underline"
      >
        Закупка у поставщика
      </Link>
    </div>
  );
}

export default function ManufacturerPoExpectation({
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
  const { factoryId, collectionId } = demo;
  const [pollNonce, setPollNonce] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setPollNonce((n) => n + 1), MANUFACTURER_PO_POLL_MS);
    return () => clearInterval(timer);
  }, []);
  const { snapshot, loading } = usePillarSnapshot({
    collectionId,
    pillarId: 'collection_order',
    roleId: 'manufacturer',
    factoryId,
    reloadNonce: pollNonce,
  });
  const insight =
    snapshot?.pillarId === 'collection_order' && 'manufacturerCollectionOrder' in snapshot
      ? snapshot.manufacturerCollectionOrder
      : null;
  const contextOrderId = insight?.orderId ?? '';
  const orderStatus = insight?.orderStatusLabel ?? null;
  const poId = insight?.productionOrderId ?? null;
  const chainSteps = insight?.chainSteps ?? [];
  const queueHit: boolean | null = loading && !insight ? null : (insight?.queueHit ?? false);
  const handoffHref = factoryHandoffQueueHrefForDemo({
    ...demo,
    demoOrderId: contextOrderId || demo.demoOrderId,
  });

  if (compact) {
    return (
      <section
        data-testid={MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID}
        className="space-y-1"
      >
        <Card data-testid="manufacturer-po-expectation-mini" className="border-emerald-200/60">
          <CardContent className="space-y-1.5 p-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 font-semibold">
                <Package className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                {B2B_TO_PO_WORKSPACE_LABEL}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <MfrEmptyHandoffCountBadge factoryId={factoryId} />
                <PlatformCoreLivePollIndicator testId="manufacturer-po-expectation-mini-live-poll" />
              </div>
            </div>
            <p>
              {contextOrderId ? (
                <code className="text-[10px]">{formatWholesaleOrderDisplayId(contextOrderId)}</code>
              ) : (
                <span className="text-text-muted">Нет активного заказа в очереди</span>
              )}
              {orderStatus ? (
                <>
                  {' '}
                  <Badge variant="outline" className="text-[10px]">
                    {orderStatus}
                  </Badge>
                </>
              ) : null}
            </p>
            {chainSteps.length > 0 ? (
              <PlatformCoreStepProgressStrip
                steps={chainSteps}
                testId="manufacturer-po-expectation-mini-steps"
                variant="horizontal"
              />
            ) : null}
            {queueHit === true ? (
              <p className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />
                {PRODUCTION_HANDOFF_QUEUE_RU}
                {poId ? <span className="font-mono text-[10px]">({poId})</span> : null}
              </p>
            ) : queueHit === false ? (
              <p className="text-text-muted flex items-center gap-1.5">
                <Circle className="h-3 w-3 shrink-0" aria-hidden />
                PO ещё не в очереди
              </p>
            ) : (
              <p className="text-text-muted">Загрузка…</p>
            )}
            <ManufacturerPoCtaLinks
              demo={demo}
              handoffHref={handoffHref}
              orderId={contextOrderId}
              compact
              testIdPrefix="manufacturer-po-expectation-mini"
            />
            {isPlatformCoreMode() ? (
              <MfrEmptyCoPeerStrip demo={demo} orderId={contextOrderId || demo.demoOrderId} />
            ) : null}
          </CardContent>
        </Card>
        {embedCrossRole ? (
          <RolePillarCrossRoleLinks
            roleId="manufacturer"
            pillarId="collection_order"
            variant="compact"
          />
        ) : null}
      </section>
    );
  }

  return (
    <section
      data-testid={MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID}
      className="space-y-2"
    >
      <Card data-testid="manufacturer-po-expectation" className="border-emerald-200/60">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Package className="h-4 w-4 text-emerald-600" aria-hidden />
              Ожидание производственного заказа
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              <MfrEmptyHandoffCountBadge factoryId={factoryId} />
              <PlatformCoreLivePollIndicator testId="manufacturer-po-expectation-live-poll" />
            </div>
          </div>
          {hideLead ? null : (
            <CardDescription className="text-xs">
              Оптовый заказ (<PlatformCoreTerm term="B2B" />) между магазином и брендом; цех следит
              за <PlatformCoreTerm term="Handoff" /> · {collectionId}.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <p>
            {contextOrderId ? (
              <>
                Заказ:{' '}
                <code className="text-[10px]">{formatWholesaleOrderDisplayId(contextOrderId)}</code>
              </>
            ) : (
              <span className="text-text-muted">Нет активного заказа в очереди передачи</span>
            )}
            {orderStatus ? (
              <>
                {' '}
                <Badge variant="outline">{orderStatus}</Badge>
              </>
            ) : null}
          </p>
          {chainSteps.length > 0 ? (
            <PlatformCoreStepProgressStrip
              steps={chainSteps}
              testId="manufacturer-po-expectation-steps"
              variant="horizontal"
            />
          ) : null}
          {queueHit === true ? (
            <p className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {PRODUCTION_HANDOFF_QUEUE_RU} · {factoryId}
              {poId ? <span className="font-mono text-[10px]">({poId})</span> : null}
            </p>
          ) : queueHit === false ? (
            <p className="text-text-muted flex items-center gap-2">
              <Circle className="h-3.5 w-3.5" aria-hidden />
              {PRODUCTION_HANDOFF_AWAITING_BRAND_RU}
            </p>
          ) : (
            <p className="text-text-muted">Загрузка статуса…</p>
          )}
          <ManufacturerPoCtaLinks
            demo={demo}
            handoffHref={handoffHref}
            orderId={contextOrderId}
            testIdPrefix="manufacturer-po-expectation"
          />
          {isPlatformCoreMode() ? (
            <MfrEmptyCoPeerStrip demo={demo} orderId={contextOrderId || demo.demoOrderId} />
          ) : null}
        </CardContent>
      </Card>
      {embedCrossRole ? (
        <RolePillarCrossRoleLinks
          roleId="manufacturer"
          pillarId="collection_order"
          variant="compact"
        />
      ) : null}
    </section>
  );
}
