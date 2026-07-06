'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Radio, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Workshop2SampleOrderDto } from '@/lib/production/workshop2-sample-api-client';
import { postWorkshop2FloorSampleStatusSyncApi } from '@/lib/production/workshop2-sample-api-client';
import { workshop2ContextToProductionFloorFromSampleOrder } from '@/lib/production/workshop2-floor-bridge';
import { workshop2SampleOrderStatusToFloorTab } from '@/lib/production/workshop2-floor-bridge-sync';
import { labelWorkshop2SampleOrderStatusRu } from '@/lib/production/workshop2-release-production-display';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { useToast } from '@/hooks/use-toast';
import { Workshop2ReleaseIntegrationProbeRow } from '@/components/brand/production/workshop2-release-integration-probe-row';
import { isWorkshop2LiveErpConfigured } from '@/lib/production/workshop2-live-integration-probes-env';
import { attemptWorkshop2FactoryErpStaging } from '@/lib/production/workshop2-factory-erp-staging';
import type { Workshop2PurchaseOrderErpRow } from '@/lib/production/workshop2-purchase-order-erp-dossier-persist';
import { isWorkshop2FloorMesConfigured } from '@/lib/production/workshop2-floor-mes';

type Props = {
  collectionId: string;
  articleUrlSegment: string;
  activeOrder: Workshop2SampleOrderDto | null;
  dossier?: Workshop2DossierPhase1 | null;
  onOrderUpdated?: (order: Workshop2SampleOrderDto) => void;
  onDossierChange?: (next: Workshop2DossierPhase1) => void;
};

/** M4: мост release → пол цеха с синхронизацией статуса и last sync. */
export function Workshop2ReleaseFloorPanel({
  collectionId,
  articleUrlSegment,
  activeOrder,
  dossier,
  onOrderUpdated,
  onDossierChange,
}: Props) {
  const { toast } = useToast();
  const [syncBusy, setSyncBusy] = useState(false);
  const [erpStagingBusy, setErpStagingBusy] = useState(false);
  const [mesPollState, setMesPollState] = useState<
    'idle' | 'loading' | 'ok' | 'fail_closed' | 'error'
  >('idle');
  const [mesPollLabelRu, setMesPollLabelRu] = useState<string | null>(null);

  const pollMes = useCallback(async () => {
    if (!activeOrder || !collectionId) return;
    setMesPollState('loading');
    try {
      const q = new URLSearchParams({ orderId: activeOrder.id });
      const res = await fetch(
        `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleUrlSegment)}/floor/sample-status?${q}`,
        { cache: 'no-store' }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        pollState?: string;
        messageRu?: string;
        resolvedOrderStatus?: string;
        payload?: { floorTab?: string };
      };
      if (json.ok) {
        setMesPollState('ok');
        setMesPollLabelRu(
          json.resolvedOrderStatus ? `MES: ${json.resolvedOrderStatus}` : 'MES poll OK'
        );
        const resolved = json.resolvedOrderStatus as string | undefined;
        if (
          resolved &&
          activeOrder &&
          resolved !== activeOrder.status &&
          isWorkshop2FloorMesConfigured()
        ) {
          const syncRes = await postWorkshop2FloorSampleStatusSyncApi({
            collectionId,
            articleId: articleUrlSegment,
            orderId: activeOrder.id,
            sampleOrderStatus: resolved as Workshop2SampleOrderDto['status'],
            floorTab: json.payload?.floorTab as string | undefined,
            actor: 'release-floor-mes-poll',
          });
          if (syncRes.ok && syncRes.order) {
            onOrderUpdated?.(syncRes.order);
          }
        }
      } else if (json.pollState === 'fail_closed' || res.status === 503) {
        setMesPollState('fail_closed');
        setMesPollLabelRu(json.messageRu ?? 'WORKSHOP2_FLOOR_MES_URL не задан');
      } else {
        setMesPollState('error');
        setMesPollLabelRu(json.messageRu ?? 'MES poll недоступен');
      }
    } catch {
      setMesPollState('error');
      setMesPollLabelRu('Сеть: MES poll не выполнен');
    }
  }, [activeOrder, articleUrlSegment, collectionId]);

  useEffect(() => {
    if (!activeOrder) {
      setMesPollState('idle');
      setMesPollLabelRu(null);
      return;
    }
    void pollMes();
  }, [activeOrder?.id, pollMes]);

  const floorHref = workshop2ContextToProductionFloorFromSampleOrder(
    { collectionId, articleLineId: articleUrlSegment },
    activeOrder?.status
  );
  const factoryHubHref = '/factory/production';
  const expectedFloorTab = activeOrder?.status
    ? workshop2SampleOrderStatusToFloorTab(activeOrder.status)
    : 'stages';

  const lastSyncedAt =
    dossier?.sampleWorkflow?.lastSyncedAt ?? dossier?.floorBridgeMirror?.lastSyncedAt ?? null;
  const floorStatusLabel =
    dossier?.sampleWorkflow?.floorStatusLabel ??
    (activeOrder ? labelWorkshop2SampleOrderStatusRu(activeOrder.status) : null);

  const erpLive = isWorkshop2LiveErpConfigured();
  const purchaseOrders: Workshop2PurchaseOrderErpRow[] = [];

  const handleErpStagingProbe = async () => {
    if (!dossier || !collectionId) return;
    setErpStagingBusy(true);
    try {
      const res = await attemptWorkshop2FactoryErpStaging({
        dossier,
        purchaseOrders,
        erpConfigured: erpLive,
        actor: 'release-floor-panel',
        collectionId,
        articleId: articleUrlSegment,
      });
      if (res.dossier) onDossierChange?.(res.dossier);
      toast({
        title: res.ok ? 'ERP staging ACK' : erpLive ? 'ERP staging без ACK' : 'ERP journal-only',
        description:
          res.dossier.factoryErpStagingMirror?.hintRu ??
          (res.skipped
            ? 'WORKSHOP2_FACTORY_ERP_BASE_URL не задан.'
            : (res.error ?? 'См. journal в досье.')),
        variant: res.ok ? 'default' : 'destructive',
      });
    } finally {
      setErpStagingBusy(false);
    }
  };

  const handleSyncFromBrand = async () => {
    if (!activeOrder) return;
    setSyncBusy(true);
    try {
      const res = await postWorkshop2FloorSampleStatusSyncApi({
        collectionId,
        articleId: articleUrlSegment,
        orderId: activeOrder.id,
        sampleOrderStatus: activeOrder.status,
        floorTab: expectedFloorTab,
        actor: 'release-floor-panel',
      });
      if (res.ok && res.order) {
        onOrderUpdated?.(res.order);
        toast({
          title: 'Синхронизация с полом',
          description: `Статус ${labelWorkshop2SampleOrderStatusRu(res.order.status)} · вкладка ${expectedFloorTab}`,
        });
      } else {
        toast({
          title: 'Синхронизация не выполнена',
          description: res.messageRu ?? 'Проверьте floor MES или PG.',
          variant: 'destructive',
        });
      }
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
      data-testid="workshop2-release-floor-panel"
    >
      <p className="text-text-primary flex items-center gap-1.5 text-sm font-semibold">
        <Warehouse className="h-4 w-4 text-indigo-500" />
        Пол цеха · Floor Bridge 2.0
      </p>

      <Workshop2ReleaseIntegrationProbeRow
        kinds={['mes', 'erp']}
        testId="workshop2-release-floor-probes"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={erpLive ? 'default' : 'outline'}
          className={
            erpLive ? 'text-[10px]' : 'border-amber-200 bg-amber-50 text-[10px] text-amber-900'
          }
          data-testid="workshop2-floor-erp-mode-chip"
        >
          {erpLive ? 'Factory ERP live' : 'ERP journal_only'}
        </Badge>
        <Button
          type="button"
          size="sm"
          variant={erpLive ? 'default' : 'outline'}
          className="h-7 text-[10px]"
          disabled={erpStagingBusy || !dossier}
          data-testid="workshop2-floor-erp-staging-btn"
          onClick={() => void handleErpStagingProbe()}
        >
          {erpStagingBusy ? 'ERP…' : erpLive ? 'POST ERP staging' : 'ERP journal (no URL)'}
        </Button>
      </div>

      {activeOrder ? (
        <div
          className="flex flex-wrap items-center gap-2"
          data-testid="workshop2-floor-mes-poll-chip"
        >
          <Badge
            variant={
              mesPollState === 'ok'
                ? 'default'
                : mesPollState === 'fail_closed'
                  ? 'outline'
                  : 'secondary'
            }
            className={
              mesPollState === 'fail_closed'
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : mesPollState === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : undefined
            }
          >
            <Radio className="mr-1 h-3 w-3" />
            {mesPollState === 'loading' ? 'MES poll…' : (mesPollLabelRu ?? 'MES не опрошен')}
          </Badge>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-[10px]"
            disabled={mesPollState === 'loading'}
            onClick={() => void pollMes()}
          >
            Обновить MES
          </Button>
        </div>
      ) : null}

      {activeOrder ? (
        <dl className="grid gap-2 text-[11px] sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Подрядчик</dt>
            <dd>{activeOrder.contractorId ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Срок (due_date)</dt>
            <dd>{activeOrder.dueDate ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Статус заказа (бренд)</dt>
            <dd>
              <Badge variant="outline">
                {labelWorkshop2SampleOrderStatusRu(activeOrder.status)}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Вкладка пола (ожид.)</dt>
            <dd>{expectedFloorTab}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Метка пола в досье</dt>
            <dd>{floorStatusLabel ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Последняя синхронизация</dt>
            <dd data-testid="workshop2-floor-last-sync">
              {typeof lastSyncedAt === 'string' && lastSyncedAt
                ? new Date(lastSyncedAt).toLocaleString('ru-RU')
                : 'Ещё не синхронизировали'}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Движение WMS</dt>
            <dd>{activeOrder.movementStatus ?? '—'}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-text-secondary text-sm">
          Нет активного заказа — очередь цеха пуста для артикула.
        </p>
      )}

      {activeOrder ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 text-[11px]"
          disabled={syncBusy}
          onClick={() => void handleSyncFromBrand()}
          data-testid="workshop2-floor-sync-button"
        >
          <RefreshCw className={syncBusy ? 'mr-1 h-3.5 w-3.5 animate-spin' : 'mr-1 h-3.5 w-3.5'} />
          {syncBusy ? 'Синхронизация…' : 'Синхронизировать статус с полом'}
        </Button>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="default" className="h-8 text-[11px]" asChild>
          <Link href={floorHref}>Открыть пол ({expectedFloorTab})</Link>
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8 text-[11px]" asChild>
          <Link href={factoryHubHref}>Хаб очереди цеха</Link>
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 text-[11px]" asChild>
          <Link
            href={workshop2ArticleHref(collectionId, articleUrlSegment, {
              w2pane: 'release',
              w2relsub: 'order',
            })}
          >
            Статус заказа →
          </Link>
        </Button>
      </div>
    </div>
  );
}
