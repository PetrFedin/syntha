'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Workshop2DossierPersistButton } from '@/components/brand/production/Workshop2DossierPersistButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useArticleWorkspace } from '@/components/brand/production/article-workspace-context';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { emptyWorkshop2DossierPhase1 } from '@/lib/production/workshop2-phase1-dossier-storage';
import Link from 'next/link';
import {
  createWorkshop2SampleOrderApi,
  describeWorkshop2CreateSampleOrderFailure,
  fetchWorkshop2HandoffReadiness,
  fetchWorkshop2SampleOrders,
  patchWorkshop2SampleOrderApi,
  type Workshop2SampleOrderDto,
} from '@/lib/production/workshop2-sample-api-client';
import { workshop2ContextToProductionFloorFromSampleOrder } from '@/lib/production/workshop2-floor-bridge';
import {
  postWorkshop2FloorSampleSync,
  saveWorkshop2DossierToApi,
} from '@/lib/production/workshop2-api-client';
import { workshop2SampleOrderStatusToFloorTab } from '@/lib/production/workshop2-floor-bridge-sync';
import { workshop2ArticleHref, W2_ARTICLE_SECTION_DOM } from '@/lib/production/workshop2-url';
import { resolveWorkshop2ReleaseActiveSampleOrder } from '@/lib/production/workshop2-release-production-display';
import { useToast } from '@/hooks/use-toast';
import { Workshop2SampleEconomicsRollupPanel } from '@/components/brand/production/Workshop2SampleEconomicsRollupPanel';
import * as LucideIcons from 'lucide-react';
import {
  Workshop2OperationalMetaChips,
  Workshop2OperationalPanelChrome,
  Workshop2OperationalPanelShell,
} from '@/components/brand/production/workshop2-operational-panel-chrome';
import { buildWorkshop2SamplePanelMeta } from '@/lib/production/workshop2-ux-phase1-helpers';
import { summarizeWorkshop2GoldSampleStatus } from '@/lib/production/workshop2-gold-sample-status';
import { summarizeWorkshop2SampleOrderStatus } from '@/lib/production/workshop2-sample-order-status';
import {
  evaluateWorkshop2FloorMesReverseSyncBlocked,
  summarizeWorkshop2FloorMesChip,
  type Workshop2FloorMesPollState,
} from '@/lib/production/workshop2-floor-mes';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import { Workshop2GateChecksBlock } from '@/components/brand/production/Workshop2GateChecksBlock';
import type { Workshop2ApiGateCheck } from '@/lib/production/workshop2-api-gate-messages';
import { workshop2RuMarkingSampleOrderHintRu } from '@/lib/production/workshop2-marking-sample-order-gate';

const STATUS_RU: Record<string, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  in_progress: 'В работе',
  received: 'Получен',
  approved: 'Утверждён',
  cancelled: 'Отменён',
};

type Props = {
  dossier: Workshop2DossierPhase1 | null;
  collectionId: string;
  categoryLeafId?: string;
  articleUrlSegment?: string;
  onDossierPatch: (patch: Partial<Workshop2DossierPhase1>) => void;
};

/** Панель «Образец»: заказ, статус, эталон (dossier-backed, не только localStorage цеха). */
export function Workshop2ArticleSamplePanel({
  dossier,
  collectionId,
  categoryLeafId,
  articleUrlSegment,
  onDossierPatch,
}: Props) {
  const { ref } = useArticleWorkspace();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Workshop2SampleOrderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [handoffReady, setHandoffReady] = useState<boolean | null>(null);
  const [handoffBlockers, setHandoffBlockers] = useState<string[]>([]);
  const [contractorId, setContractorId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [sizeLabel, setSizeLabel] = useState('M');
  const [qty, setQty] = useState('1');
  const [floorSyncBusy, setFloorSyncBusy] = useState(false);
  const [lastGateChecks, setLastGateChecks] = useState<Workshop2ApiGateCheck[] | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchWorkshop2SampleOrders(collectionId, String(ref.articleId));
      setOrders(list);
      const active = list[0];
      if (active) {
        onDossierPatch({
          sampleWorkflow: {
            activeSampleOrderId: active.id,
            floorStatusLabel: STATUS_RU[active.status] ?? active.status,
            lastSyncedAt: new Date().toISOString(),
          },
        });
      }
    } finally {
      setLoading(false);
    }
  }, [collectionId, ref.articleId, onDossierPatch]);

  useEffect(() => {
    void reload();
    const t = setInterval(() => void reload(), 30_000);
    return () => clearInterval(t);
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    void fetchWorkshop2HandoffReadiness(collectionId, String(ref.articleId), categoryLeafId).then(
      (r) => {
        if (cancelled) return;
        if (!r) {
          setHandoffReady(null);
          setHandoffBlockers([]);
          return;
        }
        setHandoffReady(r.allowed !== false);
        setHandoffBlockers(
          r.checks.filter((c) => c.severity === 'blocker').map((c) => c.messageRu)
        );
      }
    );
    return () => {
      cancelled = true;
    };
  }, [categoryLeafId, collectionId, ref.articleId]);

  const gold = dossier?.goldSampleStatus;
  const goldApproved = gold?.status === 'approved';

  const vaultFileCount = useMemo(
    () =>
      (dossier?.vaultDocuments ?? []).filter((d) =>
        Boolean((d as { storagePath?: string }).storagePath?.trim())
      ).length,
    [dossier?.vaultDocuments]
  );

  const activeOrder = useMemo(
    () =>
      resolveWorkshop2ReleaseActiveSampleOrder(
        orders,
        dossier?.sampleWorkflow?.activeSampleOrderId
      ),
    [dossier?.sampleWorkflow?.activeSampleOrderId, orders]
  );

  const sampleOrderStatus = useMemo(
    () =>
      summarizeWorkshop2SampleOrderStatus({
        handoffInput: {
          dossier: dossier ?? emptyWorkshop2DossierPhase1(),
          categoryLeafId,
          vaultFileCount,
        },
        activeOrderCount: orders.length,
        activeOrderStatus: activeOrder?.status,
        movementStatus: activeOrder?.movementStatus,
        pgBacked: true,
      }),
    [
      activeOrder?.movementStatus,
      activeOrder?.status,
      categoryLeafId,
      dossier,
      orders.length,
      vaultFileCount,
    ]
  );

  const goldSampleStatus = useMemo(
    () =>
      summarizeWorkshop2GoldSampleStatus({
        gold,
        hasActiveSampleOrder: orders.length > 0,
        persistsViaPut: true,
      }),
    [gold, orders.length]
  );

  const samplePanelMeta = useMemo(
    () =>
      buildWorkshop2SamplePanelMeta({
        order: sampleOrderStatus,
        gold: goldSampleStatus,
      }),
    [goldSampleStatus, sampleOrderStatus]
  );

  const canCreateOrder = handoffReady !== false && sampleOrderStatus.gateAllowed;
  const markingGateHintRu = useMemo(
    () => (dossier ? workshop2RuMarkingSampleOrderHintRu(dossier) : null),
    [dossier]
  );
  const floorHref =
    articleUrlSegment?.trim() &&
    workshop2ContextToProductionFloorFromSampleOrder(
      { collectionId, articleLineId: articleUrlSegment.trim() },
      activeOrder?.status
    );

  const releaseHref = articleUrlSegment?.trim()
    ? workshop2ArticleHref(collectionId, articleUrlSegment.trim(), {
        w2pane: 'release',
        w2relsub: 'order',
        hash: W2_ARTICLE_SECTION_DOM.release,
      })
    : null;

  const movementHref =
    articleUrlSegment?.trim() && activeOrder
      ? workshop2ArticleHref(collectionId, articleUrlSegment.trim(), {
          w2pane: 'stock',
          hash: W2_ARTICLE_SECTION_DOM.stock,
        })
      : null;

  const handleCreateOrder = async () => {
    if (!canCreateOrder) {
      toast({
        title: 'Заказ образца заблокирован',
        description:
          handoffBlockers[0] ?? 'Завершите handoff-readiness: Vault, готовность ТЗ и передачу.',
        variant: 'destructive',
      });
      return;
    }
    const result = await createWorkshop2SampleOrderApi({
      collectionId,
      articleId: String(ref.articleId),
      contractorId: contractorId.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
      sizes: { [sizeLabel.trim() || 'M']: Number(qty) || 1 },
      quantity: Number(qty) || 1,
    });
    if (!result.ok) {
      if (result.status === 409 && result.checks?.length) {
        setLastGateChecks(result.checks);
      }
      toast({
        title:
          result.status === 409 ? 'Заказ образца заблокирован' : 'Не удалось создать заказ образца',
        description: describeWorkshop2CreateSampleOrderFailure(result),
        variant: 'destructive',
      });
      return;
    }
    setLastGateChecks(null);
    toast({ title: 'Заказ образца создан', description: result.order.id.slice(0, 8) });
    void reload();
  };

  const handleProbeSampleOrderGate = async () => {
    const result = await createWorkshop2SampleOrderApi({
      collectionId,
      articleId: String(ref.articleId),
      contractorId: contractorId.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
      sizes: { [sizeLabel.trim() || 'M']: Number(qty) || 1 },
      quantity: Number(qty) || 1,
    });
    if (!result.ok && result.checks?.length) {
      setLastGateChecks(result.checks);
      return;
    }
    if (result.ok) {
      setLastGateChecks(null);
      toast({ title: 'Заказ образца создан', description: result.order.id.slice(0, 8) });
      void reload();
    }
  };

  const floorMesChip = useMemo(() => {
    const mirror = dossier?.floorBridgeMirror;
    const pollRaw =
      workshop2PgMirrorStr(mirror, 'floorMesPollState') || String(mirror?.floorMesPollState ?? '');
    const pollState = (pollRaw || 'fail_closed') as Workshop2FloorMesPollState;
    const lastPollAt =
      workshop2PgMirrorStr(mirror, 'floorMesLastPollAt') ||
      (typeof mirror?.floorMesLastPollAt === 'string' ? mirror.floorMesLastPollAt : undefined);
    return summarizeWorkshop2FloorMesChip({
      configured: Boolean(mirror?.floorMesConfigured),
      pollState,
      lastPollAt,
    });
  }, [dossier?.floorBridgeMirror]);

  const handleFloorSync = async (floorTab: string) => {
    const blocked = evaluateWorkshop2FloorMesReverseSyncBlocked();
    if (blocked.blocked) {
      toast({
        title: 'Синхронизация с пола недоступна',
        description: blocked.messageRu,
        variant: 'destructive',
      });
      return;
    }
    const active = orders[0];
    if (!active) {
      toast({ title: 'Нет заказа образца', variant: 'destructive' });
      return;
    }
    setFloorSyncBusy(true);
    try {
      const res = await postWorkshop2FloorSampleSync({
        collectionId,
        articleId: String(ref.articleId),
        floorTab,
        orderId: active.id,
        actor: 'brand-workspace',
      });
      if (!res.ok) {
        toast({
          title: 'Синхронизация с пола не выполнена',
          description: res.reason,
          variant: 'destructive',
        });
        return;
      }
      onDossierPatch({
        sampleWorkflow: {
          activeSampleOrderId: active.id,
          floorStatusLabel: STATUS_RU[res.resolved.orderStatus] ?? res.resolved.orderStatus,
          lastSyncedAt: new Date().toISOString(),
          lastFloorTab: floorTab,
        },
        ...(res.resolved.orderStatus === 'approved'
          ? {
              goldSampleStatus: {
                status: 'approved' as const,
                approvedAt: new Date().toISOString(),
                approvedBy: 'floor-bridge-sync',
                linkedSampleOrderId: active.id,
              },
            }
          : {}),
      });
      await reload();
      toast({
        title: 'Синхронизировано с пола',
        description: `Вкладка ${floorTab} → ${STATUS_RU[res.resolved.orderStatus] ?? res.resolved.orderStatus}`,
      });
    } finally {
      setFloorSyncBusy(false);
    }
  };

  const handleApproveGold = async () => {
    const nextStatus = goldApproved ? 'pending' : 'approved';
    const goldSampleStatus = {
      status: nextStatus as 'pending' | 'approved',
      approvedAt: nextStatus === 'approved' ? new Date().toISOString() : undefined,
      approvedBy: nextStatus === 'approved' ? 'brand-workspace' : undefined,
      linkedSampleOrderId: orders[0]?.id,
    };
    onDossierPatch({ goldSampleStatus });
    if (dossier) {
      const merged = { ...dossier, goldSampleStatus };
      await saveWorkshop2DossierToApi({
        collectionId,
        articleId: String(ref.articleId),
        dossier: merged,
      });
    }
    toast({
      title: nextStatus === 'approved' ? 'Эталонный образец утверждён' : 'Утверждение снято',
    });
  };

  return (
    <Workshop2OperationalPanelShell>
      <Workshop2OperationalPanelChrome
        icon={LucideIcons.Shirt}
        title="Образец"
        description="Заказ, статус и эталон — на сервере (PG/API)."
        meta={<Workshop2OperationalMetaChips {...samplePanelMeta} />}
      />
      <div className="space-y-3 text-[11px]" data-testid="workshop2-sample-panel">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={goldApproved ? 'default' : 'outline'}>
            Эталон: {goldApproved ? 'утверждён' : (gold?.status ?? 'ожидание')}
          </Badge>
          {dossier?.sampleWorkflow?.floorStatusLabel ? (
            <Badge variant="secondary">Цех: {dossier.sampleWorkflow.floorStatusLabel}</Badge>
          ) : null}
          <Badge
            variant="outline"
            className={
              floorMesChip.tone === 'emerald'
                ? 'border-emerald-500/40 text-emerald-700'
                : floorMesChip.tone === 'amber'
                  ? 'border-amber-500/40 text-amber-800'
                  : 'border-slate-400/50 text-slate-600'
            }
          >
            {floorMesChip.labelRu}
          </Badge>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-[10px]"
            onClick={() => void reload()}
          >
            {loading ? '…' : 'Обновить'}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => void handleApproveGold()}
          >
            {goldApproved ? 'Снять эталон' : 'Утвердить эталон'}
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Label className="space-y-1">
            <span className="text-text-muted text-[10px]">Подрядчик (id)</span>
            <Input
              className="h-8"
              value={contractorId}
              onChange={(e) => setContractorId(e.target.value)}
            />
          </Label>
          <Label className="space-y-1">
            <span className="text-text-muted text-[10px]">Срок</span>
            <Input
              type="date"
              className="h-8"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Label>
          <Label className="space-y-1">
            <span className="text-text-muted text-[10px]">Размер</span>
            <Input
              className="h-8"
              value={sizeLabel}
              onChange={(e) => setSizeLabel(e.target.value)}
            />
          </Label>
          <Label className="space-y-1">
            <span className="text-text-muted text-[10px]">Кол-во</span>
            <Input className="h-8" value={qty} onChange={(e) => setQty(e.target.value)} />
          </Label>
        </div>
        {handoffReady === false ? (
          <p className="text-[10px] text-rose-800" data-testid="workshop2-sample-handoff-blocked">
            До заказа образца: {handoffBlockers.join(' · ') || 'проверьте handoff-readiness.'}
          </p>
        ) : null}
        {markingGateHintRu ? (
          <p
            className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-900"
            data-testid="workshop2-sample-marking-gate-hint"
          >
            {markingGateHintRu}
          </p>
        ) : null}
        {lastGateChecks?.length ? (
          <Workshop2GateChecksBlock
            checks={lastGateChecks}
            title="Sample-order gate (409) — полный список проверок"
            testId="workshop2-sample-order-gate-checks"
            collectionId={collectionId}
            articleUrlSegment={articleUrlSegment?.trim() || String(ref.articleId)}
            onGateAction={({ href }) => {
              const hash = href.includes('#') ? href.split('#')[1] : null;
              if (hash) {
                document
                  .getElementById(hash)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.location.href = href;
              }
            }}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8"
            disabled={!canCreateOrder}
            data-testid="workshop2-sample-create-order"
            onClick={() => void handleCreateOrder()}
          >
            Создать заказ образца
          </Button>
          {!canCreateOrder ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-[10px]"
              data-testid="workshop2-sample-probe-gate"
              onClick={() => void handleProbeSampleOrderGate()}
            >
              Показать все blockers (409)
            </Button>
          ) : null}
          {releaseHref ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-[10px]"
              asChild
              data-testid="workshop2-sample-link-release"
            >
              <Link href={releaseHref}>Производство → статус</Link>
            </Button>
          ) : null}
          {floorHref ? (
            <Button type="button" size="sm" variant="outline" className="h-8" asChild>
              <Link href={floorHref}>Открыть на полу</Link>
            </Button>
          ) : null}
          {movementHref ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              asChild
              data-testid="workshop2-sample-movement-deep-link"
            >
              <Link href={movementHref}>Движение образца (склад)</Link>
            </Button>
          ) : null}
          {activeOrder ? (
            <Workshop2DossierPersistButton
              busy={floorSyncBusy}
              variant="secondary"
              className="h-8"
              testId="workshop2-floor-sync-from-tab"
              title="sampleFloorSyncMirror "
              onClick={() => {
                const st = activeOrder.status;
                void handleFloorSync(
                  workshop2SampleOrderStatusToFloorTab(
                    st as import('@/lib/production/workshop2-dossier-phase1.types').Workshop2SampleOrderStatus
                  )
                );
              }}
            />
          ) : null}
        </div>

        {orders.length === 0 ? (
          <p className="text-text-secondary">Заказов образца пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li
                key={o.id}
                className="border-border-default flex flex-wrap items-center justify-between gap-2 rounded-md border px-2 py-1.5"
              >
                <span>
                  <span className="text-text-muted block font-mono text-[10px]">ID заказа</span>
                  <span className="break-all font-mono text-[11px]">{o.id}</span>
                  {' · '}
                  {STATUS_RU[o.status] ?? o.status}
                  {o.dueDate ? ` · до ${o.dueDate}` : ''}
                </span>
                <div className="flex gap-1">
                  {(['sent', 'in_progress', 'received', 'approved'] as const).map((st) => (
                    <Button
                      key={st}
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[9px]"
                      onClick={() =>
                        void patchWorkshop2SampleOrderApi({
                          collectionId,
                          articleId: String(ref.articleId),
                          orderId: o.id,
                          status: st,
                        }).then(() => reload())
                      }
                    >
                      {STATUS_RU[st]}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Workshop2SampleEconomicsRollupPanel
        dossier={dossier}
        collectionId={collectionId}
        articleId={String(ref.articleId)}
        onDossierPatch={onDossierPatch}
      />
    </Workshop2OperationalPanelShell>
  );
}
