'use client';

import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  loadBrandProductionState,
  resetBrandProductionToSeed,
  setArticleLifecycleStage,
  updateIntegrationConfig,
  setCurrentRole,
  exportPOToCsvRows,
  type BrandProductionState,
} from '@/lib/brand-production';
import {
  loadBrandProductionOpsWithMode,
  persistBrandProductionOpsState,
} from '@/lib/brand-production/brand-production-ops-client';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  ARTICLE_LIFECYCLE_ORDER,
  ARTICLE_LIFECYCLE_LABELS,
  type ArticleLifecycleStage,
  type ProductionRole,
} from '@/lib/brand-production/types';
import { computeProductionAlerts, collectionKpi } from '@/lib/brand-production/alerts';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '@/lib/brand-production/rbac';
import {
  Factory,
  Package,
  ClipboardList,
  MessageSquare,
  Plug,
  History,
  Shield,
  Download,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { B2bPriorityWorkflowPanel } from '@/components/b2b/B2bPriorityWorkflowPanel';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import { BrandProductionCutTicketPanel } from '@/components/brand/production/BrandProductionCutTicketPanel';
import { BrandProductionOperationsPanel } from '@/components/brand/production/BrandProductionOperationsPanel';
import { BrandProductionHandoffPanel } from '@/components/brand/production/BrandProductionHandoffPanel';
import { BrandProductionQcGatePanel } from '@/components/brand/production/BrandProductionQcGatePanel';
import { BrandOpOperationsHandoffPeerStrip } from '@/components/platform/BrandOpOperationsHandoffPeerStrip';
import {
  BrandProductionOpsGoldenPathStrip,
  brandProductionOpsGoldenPathStepFromFeature,
} from '@/components/brand/production/BrandProductionOpsGoldenPathStrip';
import { getSynthaThreeCoresFullMatrixGroups } from '@/lib/syntha-priority-cores';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function ProductionOperationsPageInner() {
  const [state, setState] = useState<BrandProductionState | null>(null);
  const [opsStorageMode, setOpsStorageMode] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get('order') ??
    searchParams.get('orderId') ??
    searchParams.get('wholesaleOrderId') ??
    undefined;
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-production-ops');

  const refresh = useCallback(() => {
    if (isPlatformCoreMode()) {
      void loadBrandProductionOpsWithMode().then(({ state: next, storageMode }) => {
        setState(next);
        setOpsStorageMode(storageMode);
      });
      return;
    }
    setState(loadBrandProductionState());
    setOpsStorageMode('local');
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persistSkipRef = useRef(true);
  useEffect(() => {
    if (!state || !isPlatformCoreMode() || opsStorageMode !== 'postgres') return;
    if (persistSkipRef.current) {
      persistSkipRef.current = false;
      return;
    }
    void persistBrandProductionOpsState(state);
  }, [state, opsStorageMode]);

  useEffect(() => {
    if (state?.collections?.length && !selectedCollectionId) {
      setSelectedCollectionId(state.collections[0].id);
    }
  }, [state, selectedCollectionId]);

  const alerts = useMemo(() => (state ? computeProductionAlerts(state) : []), [state]);
  const kpi = useMemo(
    () => (state && selectedCollectionId ? collectionKpi(state, selectedCollectionId) : null),
    [state, selectedCollectionId]
  );
  const perm = state ? ROLE_PERMISSIONS[state.currentRole] : null;

  if (!state) {
    return (
      <div className="container py-12 text-center text-sm text-slate-500">
        Загрузка модели производства…
      </div>
    );
  }

  const exportPoCsv = (poId: string) => {
    const rows = exportPOToCsvRows(state, poId);
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `PO-${poId}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6 pb-24">
      <PillarCapabilityWorkspaceChrome
        workspaceId="brand-production-ops"
        ctx={{ orderId, role: 'brand', collectionId: collectionId || selectedCollectionId || undefined }}
        crossLinksTitle="Производство · связи столпов"
        beforeTabs={
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-2xl text-sm text-slate-500">
                {isPlatformCoreMode()
                  ? 'Platform Core: состояние производства только в PostgreSQL — без localStorage.'
                  : 'Единая модель: localStorage → REST. Коллекция → артикулы → BOM → PO → QC → B2B.'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {opsStorageMode === 'postgres' ? (
                  <Badge variant="outline" className="text-[9px]" data-testid="brand-production-ops-storage-pg">
                    PG
                  </Badge>
                ) : opsStorageMode === 'unavailable' ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/50 text-[9px] text-amber-800"
                    data-testid="brand-production-ops-storage-unavailable"
                  >
                    PG недоступен
                  </Badge>
                ) : null}
                <span className="text-[10px] uppercase text-slate-500">Роль (мок):</span>
                <select
                  value={state.currentRole}
                  onChange={(e) => {
                    const next = setCurrentRole(state, e.target.value as ProductionRole);
                    setState(next);
                  }}
                  className="h-9 rounded-lg border px-2 text-xs"
                >
                  {(Object.keys(ROLE_LABELS) as ProductionRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 text-xs"
                  onClick={() => {
                    const next = resetBrandProductionToSeed();
                    setState(next);
                    if (isPlatformCoreMode()) void persistBrandProductionOpsState(next);
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Сброс к seed
                </Button>
                <Button variant="outline" size="sm" className="h-9 text-xs" asChild>
                  <Link href={ROUTES.brand.production}>Схема коллекции</Link>
                </Button>
              </div>
            </div>
            <B2bOrderUrlContextBanner
              variant="brand"
              className="rounded-xl border border-slate-200/80 bg-slate-50/90 shadow-sm"
            />
          </>
        }
      >
        <div className="mb-4">
          <BrandProductionOpsGoldenPathStrip
            orderId={orderId}
            collectionId={collectionId || selectedCollectionId || undefined}
            activeStep={brandProductionOpsGoldenPathStepFromFeature(activeFeatureId)}
          />
        </div>
        {activeFeatureId === 'operations' ? (
          <>
      {orderId ? (
        <BrandOpOperationsHandoffPeerStrip
          orderId={orderId}
          collectionId={collectionId || selectedCollectionId}
          activeFeature="operations"
        />
      ) : null}
      <BrandProductionOperationsPanel
        state={state}
        selectedCollectionId={collectionId || selectedCollectionId}
        localSourceCollectionId={selectedCollectionId}
        orderId={orderId}
      />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto gap-1 shadow-inner')}>
          <TabsTrigger value="overview" className="text-xs">
            Обзор и алерты
          </TabsTrigger>
          <TabsTrigger value="articles" className="text-xs">
            Коллекции · артикулы
          </TabsTrigger>
          <TabsTrigger value="po" className="text-xs">
            PO и фабрики
          </TabsTrigger>
          <TabsTrigger value="bom" className="text-xs">
            BOM
          </TabsTrigger>
          <TabsTrigger value="qc" className="text-xs">
            QC
          </TabsTrigger>
          <TabsTrigger value="comms" className="text-xs">
            С фабрикой
          </TabsTrigger>
          <TabsTrigger value="b2b" className="text-xs">
            B2B · склад
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs">
            Интеграции
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">
            Аудит
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Что горит
                </CardTitle>
                <CardDescription className="text-xs">
                  Дедлайны, PO без подтверждения, материалы к раскрою, QC.
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-80 space-y-2 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500">Нет критичных алертов по текущим данным.</p>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        'rounded-lg border p-2 text-xs',
                        a.severity === 'critical' && 'border-rose-200 bg-rose-50',
                        a.severity === 'warning' && 'border-amber-200 bg-amber-50',
                        a.severity === 'info' && 'border-slate-100 bg-slate-50'
                      )}
                    >
                      <p className="font-semibold">{a.title}</p>
                      <p className="mt-0.5 text-slate-600">{a.detail}</p>
                      {a.href && (
                        <Link
                          href={a.href}
                          className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-indigo-600"
                        >
                          Перейти <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">KPI по коллекции</CardTitle>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="mt-2 h-8 max-w-xs rounded-lg border px-2 text-xs"
                >
                  {state.collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {kpi && (
                  <>
                    <p>
                      Артикулов: <strong>{kpi.totalArticles}</strong> · BOM заполнен:{' '}
                      <strong>{kpi.bomPct}%</strong>
                    </p>
                    {kpi.dropDeadline && (
                      <p className="text-slate-600">
                        Целевой дроп: <strong>{kpi.dropDeadline}</strong>
                      </p>
                    )}
                    <div className="space-y-1">
                      {ARTICLE_LIFECYCLE_ORDER.map((st) => {
                        const n = kpi.byStage[st] ?? 0;
                        if (!n) return null;
                        return (
                          <div key={st} className="flex justify-between">
                            <span>{kpi.labels[st]}</span>
                            <Badge variant="outline">{n}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Артикулы и жизненный цикл</CardTitle>
              <CardDescription className="text-xs">
                Правила: на этап PO — только после утверждения Gold Sample и этапа «Утверждение»;
                производство — после подтверждённого PO; склад — после успешного QC (блокировка при
                fail/rework с флагом отгрузки).
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">Название</th>
                    <th className="pb-2">Коллекция</th>
                    <th className="pb-2">Дроп</th>
                    <th className="pb-2">Этап</th>
                    <th className="pb-2">Gold Sample</th>
                    <th className="pb-2">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {state.articles.map((art) => {
                    const col = state.collections.find((c) => c.id === art.collectionId);
                    return (
                      <tr key={art.id} className="border-b border-slate-50">
                        <td className="py-2 font-mono font-medium">{art.sku}</td>
                        <td>{art.name}</td>
                        <td>{col?.code ?? art.collectionId}</td>
                        <td>{art.dropId}</td>
                        <td>
                          <Badge variant="outline">
                            {ARTICLE_LIFECYCLE_LABELS[art.lifecycleStage]}
                          </Badge>
                        </td>
                        <td>{art.goldSampleApproved ? '✓' : '—'}</td>
                        <td>
                          {perm?.changeLifecycle ? (
                            <select
                              className="h-7 max-w-[140px] rounded border text-[10px]"
                              value={art.lifecycleStage}
                              onChange={(e) => {
                                const r = setArticleLifecycleStage(
                                  state,
                                  art.id,
                                  e.target.value as ArticleLifecycleStage
                                );
                                if (r.ok) setState(r.state);
                                else alert(r.error);
                              }}
                            >
                              {ARTICLE_LIFECYCLE_ORDER.map((st) => (
                                <option key={st} value={st}>
                                  {ARTICLE_LIFECYCLE_LABELS[st]}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-400">Нет прав</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="po" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Factory className="h-4 w-4" aria-hidden /> PO → коллекция → артикулы → размеры
              </CardTitle>
              <CardDescription className="text-xs">
                Критический путь и риск срыва учитываются в алертах. Экспорт в Excel/CSV для фабрики
                (подготовка к ERP).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.purchaseOrders.map((po) => {
                const fac = state.factories.find((f) => f.id === po.factoryId);
                const col = state.collections.find((c) => c.id === po.collectionId);
                return (
                  <div key={po.id} className="space-y-2 rounded-xl border p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <span className="font-semibold">{po.code}</span>
                        <Badge className="ml-2 text-[10px]">{po.status}</Badge>
                        {po.atRisk && (
                          <Badge variant="destructive" className="ml-1 text-[10px]">
                            Риск срока
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px]"
                          onClick={() => exportPoCsv(po.id)}
                        >
                          <Download className="mr-1 h-3 w-3" aria-hidden /> CSV для фабрики
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-[10px]" asChild>
                          <Link href={`${ROUTES.brand.productionGantt}?po=${po.id}`}>Gantt</Link>
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      {col?.name} · {fac?.name} · финиш пути: {po.criticalPathEnd ?? '—'}
                    </p>
                    <ul className="space-y-1 text-xs">
                      {po.lines.map((ln) => {
                        const a = state.articles.find((x) => x.id === ln.articleId);
                        return (
                          <li key={ln.id}>
                            {a?.sku}:{' '}
                            {Object.entries(ln.sizeBreakdown)
                              .map(([s, q]) => `${s}:${q}`)
                              .join(', ')}{' '}
                            (всего {ln.totalQty})
                          </li>
                        );
                      })}
                    </ul>
                    {typeof fac?.utilizationPct === 'number' && (
                      <div className="pt-2">
                        <p className="mb-1 text-[10px] text-slate-500">
                          Загрузка фабрики ~{fac.utilizationPct}%
                        </p>
                        <Progress
                          value={fac.utilizationPct}
                          className="h-1.5"
                          aria-label={`Загрузка фабрики ${fac?.name ?? po.factoryId}: ${fac.utilizationPct}%`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" aria-hidden /> BOM по артикулу
              </CardTitle>
              <CardDescription className="text-xs">
                Резерв, статус закупки, ETA до фабрики — горизонтальная связь с артикулом и
                раскроем.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-2">Артикул</th>
                    <th className="pb-2">Материал</th>
                    <th className="pb-2">Поставщик</th>
                    <th className="pb-2">Статус</th>
                    <th className="pb-2">ETA</th>
                    <th className="pb-2">Резерв</th>
                  </tr>
                </thead>
                <tbody>
                  {state.bomLines.map((b) => {
                    const a = state.articles.find((x) => x.id === b.articleId);
                    return (
                      <tr key={b.id} className="border-b border-slate-50">
                        <td className="py-2 font-mono">{a?.sku}</td>
                        <td>
                          {b.materialCode} {b.materialName}
                        </td>
                        <td>{b.supplierName}</td>
                        <td>
                          <Badge variant="outline">{b.purchaseStatus}</Badge>
                        </td>
                        <td>{b.etaToFactory ?? '—'}</td>
                        <td>{b.reservedQty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4" /> QC: планы и инспекции
              </CardTitle>
              <CardDescription className="text-xs">
                Блокировка отгрузки при fail/rework. Полевой сценарий:{' '}
                <Link href={ROUTES.brand.productionQcApp} className="text-indigo-600 underline">
                  QC App
                </Link>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="mb-2 font-semibold">Планы</p>
                <ul className="space-y-1">
                  {state.qcPlans.map((p) => (
                    <li key={p.id}>
                      PO {p.poId} · {p.type} · {p.scheduledAt} ·{' '}
                      <Badge variant="outline">{p.status}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 font-semibold">Инспекции</p>
                <ul className="space-y-2">
                  {state.qcInspections.map((i) => (
                    <li key={i.id} className="rounded-lg border p-2">
                      {i.result} · {i.inspectorLabel} · блок отгрузки:{' '}
                      {i.blocksShipment ? 'да' : 'нет'} · {i.notes}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" /> Треды с фабрикой
              </CardTitle>
              <CardDescription className="text-xs">
                По артикулу и по PO: комментарии, версии техпака, вложения (URL). Уведомления —
                через API позже.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.threads.map((th) => (
                <div key={th.id} className="rounded-xl border p-3">
                  <Badge className="mb-2 text-[10px]">
                    {th.scope} · {th.scopeId}
                  </Badge>
                  <ul className="space-y-2 text-xs">
                    {th.messages.map((m) => (
                      <li key={m.id} className="border-l-2 border-indigo-200 pl-2">
                        <span className="text-slate-500">{m.at}</span> ·{' '}
                        <strong>{m.authorLabel}</strong> ({m.authorRole})
                        {m.techPackVersion && (
                          <span className="text-indigo-600"> · TP {m.techPackVersion}</span>
                        )}
                        <p className="mt-0.5">{m.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="b2b" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">B2B и склад</CardTitle>
              <CardDescription className="text-xs">
                Готовность к лайншиту/pre-order, остатки готовой продукции, заказы B2B по коллекции
                (связь с артикулами).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="mb-2 font-semibold">Артикулы</p>
                <ul className="space-y-1">
                  {state.articles.map((a) => (
                    <li key={a.id}>
                      {a.sku}: лайншит {a.linesheetReady ? '✓' : '—'} · готов к B2B{' '}
                      {a.b2bReady ? '✓' : '—'} · остаток ГП <strong>{a.finishedGoodsQty}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 font-semibold">Заказы B2B (рефы)</p>
                <ul className="space-y-1">
                  {state.b2bOrderRefs.map((o) => (
                    <li key={o.id}>
                      {o.orderRef}: {o.articleSku} × {o.qty} · {o.status}{' '}
                      <Link
                        href={`${ROUTES.shop.b2bOrders}?sku=${encodeURIComponent(o.articleSku)}`}
                        className="ml-1 text-indigo-600"
                      >
                        → заказы
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plug className="h-4 w-4" /> Интеграции (настройка под API)
              </CardTitle>
              <CardDescription className="text-xs">
                Webhook для статусов с фабрики, выгрузка в ERP. Сохраняется локально; бэкенд
                подставит URL и секреты.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-lg space-y-3 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.integration.erpExportEnabled}
                  onChange={(e) =>
                    setState(updateIntegrationConfig(state, { erpExportEnabled: e.target.checked }))
                  }
                  disabled={!perm?.integration}
                />
                Экспорт в ERP включён
              </label>
              <div>
                <span className="text-slate-500">Тип ERP</span>
                <select
                  className="ml-2 h-8 rounded border px-2"
                  value={state.integration.erpType ?? '1c'}
                  onChange={(e) =>
                    perm?.integration &&
                    setState(
                      updateIntegrationConfig(state, {
                        erpType: e.target.value as '1c' | 'moy_sklad' | 'custom',
                      })
                    )
                  }
                  disabled={!perm?.integration}
                >
                  <option value="1c">1С</option>
                  <option value="moy_sklad">МойСклад</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <span className="mb-1 block text-slate-500">Webhook URL (статусы фабрики)</span>
                <input
                  className="h-9 w-full rounded border px-2 text-xs"
                  placeholder="https://api.brend.ru/webhooks/factory"
                  value={state.integration.webhookUrl ?? ''}
                  onChange={(e) =>
                    perm?.integration &&
                    setState(updateIntegrationConfig(state, { webhookUrl: e.target.value }))
                  }
                  disabled={!perm?.integration}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.integration.factoryStatusWebhookEnabled}
                  onChange={(e) =>
                    perm?.integration &&
                    setState(
                      updateIntegrationConfig(state, {
                        factoryStatusWebhookEnabled: e.target.checked,
                      })
                    )
                  }
                  disabled={!perm?.integration}
                />
                Принимать push-статусы от фабрики
              </label>
              {!perm?.integration && (
                <p className="text-amber-600">Смените роль на «Админ» для редактирования.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="h-4 w-4" /> История изменений
              </CardTitle>
              <CardDescription className="text-xs">
                Кто и когда сдвинул этап / изменил настройки (под API — userId с сервера).
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 space-y-2 overflow-y-auto text-xs">
              {state.auditLog.map((a) => (
                <div key={a.id} className="border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{a.at}</span> · <strong>{a.userLabel}</strong> ·{' '}
                  {a.entityType} {a.entityId}
                  <br />
                  <span className="text-slate-600">
                    {a.action}
                    {a.fromValue != null && a.toValue != null && (
                      <>
                        : {a.fromValue} → {a.toValue}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <B2bPriorityWorkflowPanel
        title="Полная матрица направлений: ТЗ · B2B · команды"
        lead="Та же связка, что на реестрах B2B: вертикаль цеха, оптовый контур, надстройка коммуникаций, горизонталь ролей — из хаба операций производства."
        groups={getSynthaThreeCoresFullMatrixGroups()}
      />
          </>
        ) : null}
        {activeFeatureId === 'handoff' ? (
          <BrandProductionHandoffPanel
            state={state}
            selectedCollectionId={selectedCollectionId}
            orderId={orderId}
          />
        ) : null}
        {activeFeatureId === 'cut-ticket' ? (
          <BrandProductionCutTicketPanel
            state={state}
            selectedCollectionId={selectedCollectionId}
            orderId={orderId}
          />
        ) : null}
        {activeFeatureId === 'qc-gate' ? (
          <BrandProductionQcGatePanel state={state} selectedCollectionId={selectedCollectionId} />
        ) : null}
      </PillarCapabilityWorkspaceChrome>

      <Card className="border-dashed">
        <CardContent className="flex flex-wrap items-center gap-3 py-3 text-[10px] text-slate-500">
          <Shield className="h-4 w-4" />
          <span>
            Роли: дизайн / продакшн / закупки / мерчендайзинг — разные права на смену статусов и PO
            (см. переключатель роли). После API проверка на сервере.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductionOperationsPage() {
  return (
    <Suspense fallback={null}>
      <ProductionOperationsPageInner />
    </Suspense>
  );
}
