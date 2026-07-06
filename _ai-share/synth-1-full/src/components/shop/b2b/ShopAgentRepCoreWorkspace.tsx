'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { B2bRepBrandSwitcher } from '@/components/shop/b2b/B2bRepBrandSwitcher';
import {
  ShopAgentRepGoldenPathStrip,
  shopAgentRepGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopAgentRepGoldenPathStrip';
import { ShopAgentRepBrandCoPeerStrip } from '@/components/shop/b2b/ShopAgentRepBrandCoPeerStrip';
import { ShopAgentRepCommissionLedgerRuStrip } from '@/components/shop/b2b/ShopAgentRepCommissionLedgerRuStrip';
import { ShopAgentRepSectionRuStrip } from '@/components/shop/b2b/ShopAgentRepSectionRuStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { buildShopAgentRepSession, SHOP_AGENT_REP_DEMO_ID } from '@/lib/b2b/shop-agent-rep';
import { fetchShopAgentRepCommissionSummary } from '@/lib/fashion/brand-agent-rep-ledger-store';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { workshop2CollectionAssortmentHref } from '@/lib/production/workshop2-b2b-collection-href';
import type { Workshop2RepAppointment } from '@/lib/production/workshop2-rep-appointments';
import {
  appendShopRepOfflineDraft,
  fetchShopRepOfflineDrafts,
} from '@/lib/shop/shop-rep-offline-drafts-store';
import { Calendar, FileText, Store, Wallet } from 'lucide-react';

const B2bMatrixOrderGrid = dynamic(
  () =>
    import('@/components/shop/b2b/B2bMatrixOrderGrid').then((m) => ({
      default: m.B2bMatrixOrderGrid,
    })),
  { ssr: false }
);

function useShopAgentRepActions(session: ReturnType<typeof buildShopAgentRepSession>) {
  const [commissionRub, setCommissionRub] = useState<number | null>(null);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Workshop2RepAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [ledgerLines, setLedgerLines] = useState<
    Awaited<ReturnType<typeof fetchShopAgentRepCommissionSummary>>['lines']
  >([]);
  const [ledgerMode, setLedgerMode] = useState<'postgres' | 'file' | 'memory' | 'empty'>('empty');
  const [ledgerTotalRub, setLedgerTotalRub] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [draftStorageMode, setDraftStorageMode] = useState<'postgres' | 'file' | 'memory' | 'unavailable'>('memory');
  const [linesheetShareReady, setLinesheetShareReady] = useState<boolean | null>(null);

  const refreshLedger = useCallback(async () => {
    const summary = await fetchShopAgentRepCommissionSummary(session.repId);
    setLedgerLines(summary.lines);
    setLedgerMode(summary.mode);
    setLedgerTotalRub(summary.totalCommissionRub);
  }, [session.repId]);

  useEffect(() => {
    void refreshLedger();
  }, [refreshLedger]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch(
          `/api/shop/b2b/rep/appointments?repId=${encodeURIComponent(session.repId)}`
        );
        const json = (await r.json()) as { appointments?: Workshop2RepAppointment[] };
        setAppointments(json.appointments ?? []);
      } catch {
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    })();
  }, [session.repId]);

  useEffect(() => {
    void fetchShopRepOfflineDrafts(session.repId).then(({ config, storageMode }) => {
      setDraftCount(config.drafts.length);
      const mode =
        storageMode === 'postgres'
          ? 'postgres'
          : storageMode === 'file'
            ? 'file'
            : storageMode === 'unavailable'
              ? 'unavailable'
              : 'memory';
      setDraftStorageMode(mode);
      setLinesheetShareReady(mode !== 'unavailable');
    });
  }, [session.repId]);

  const previewCommission = useCallback(async () => {
    try {
      const res = await fetch(`/api/shop/b2b/orders/${encodeURIComponent(session.demoOrderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'submitted', repId: session.repId }),
      });
      const json = (await res.json()) as {
        order?: { commissionPreview?: { commissionRub?: number } };
        messageRu?: string;
      };
      setCommissionRub(json.order?.commissionPreview?.commissionRub ?? null);
      setPayoutMessage(json.messageRu ?? (res.ok ? 'Комиссия рассчитана' : 'Ошибка'));
      if (res.ok) await refreshLedger();
    } catch {
      setPayoutMessage('Сеть недоступна');
    }
  }, [session.demoOrderId, session.repId, refreshLedger]);

  const requestPayout = useCallback(async () => {
    try {
      const res = await fetch('/api/shop/b2b/commissions/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repId: session.repId,
          orderIds: [session.demoOrderId],
          action: 'payout_request',
        }),
      });
      const json = (await res.json()) as { messageRu?: string };
      setPayoutMessage(json.messageRu ?? (res.ok ? 'Запрос отправлен' : 'Ошибка payout'));
      if (res.ok) await refreshLedger();
    } catch {
      setPayoutMessage('Сеть недоступна');
    }
  }, [session.demoOrderId, session.repId, refreshLedger]);

  const createShareLink = useCallback(async () => {
    const res = await fetch(
      `/api/shop/b2b/rep/share-link?campaignId=${encodeURIComponent(session.demoCampaignId)}&repId=${encodeURIComponent(session.repId)}`
    );
    const json = (await res.json()) as { shareUrl?: string };
    setShareUrl(json.shareUrl ?? null);
    setPayoutMessage(res.ok ? 'Share link создан' : `Share link: ошибка (${res.status})`);
  }, [session.demoCampaignId, session.repId]);

  const shareLinesheetEmail = useCallback(async () => {
    try {
      const res = await fetch('/api/shop/b2b/linesheet/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: session.demoCollectionId,
          articleId: session.demoArticleId,
          repId: session.repId,
          email: 'buyer@demo.ru',
        }),
      });
      const json = (await res.json()) as { messageRu?: string; shareUrl?: string; ok?: boolean };
      setPayoutMessage(json.messageRu ?? (res.ok ? 'Linesheet share создан' : `Ошибка (${res.status})`));
      if (json.shareUrl) setShareUrl(json.shareUrl);
    } catch {
      setPayoutMessage('Linesheet share: сеть недоступна');
    }
  }, [session.demoArticleId, session.demoCollectionId, session.repId]);

  const queueOfflineDraft = useCallback(async () => {
    const result = await appendShopRepOfflineDraft({
      repId: session.repId,
      campaignId: session.demoCampaignId,
      payload: { lines: [] },
    });
    setDraftCount(result.config.drafts.length);
    const mode =
      result.storageMode === 'postgres'
        ? 'postgres'
        : result.storageMode === 'file'
          ? 'file'
          : result.storageMode === 'unavailable'
            ? 'unavailable'
            : 'memory';
    setDraftStorageMode(mode);
    setPayoutMessage(`Черновик сохранён (${result.config.drafts.length}) · ${result.storageMode ?? 'memory'}`);
  }, [session.demoCampaignId, session.repId]);

  return {
    appointments,
    appointmentsLoading,
    commissionRub,
    payoutMessage,
    shareUrl,
    ledgerLines,
    ledgerMode,
    ledgerTotalRub,
    previewCommission,
    requestPayout,
    createShareLink,
    shareLinesheetEmail,
    queueOfflineDraft,
    draftCount,
    draftStorageMode,
    linesheetShareReady,
  };
}

function ShopAgentRepPortalPanel({ session }: { session: ReturnType<typeof buildShopAgentRepSession> }) {
  const { appointments, appointmentsLoading } = useShopAgentRepActions(session);

  return (
    <div className="space-y-4" data-testid="shop-agent-rep-portal-panel">
      <B2bRepBrandSwitcher />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> Ближайшие встречи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {appointmentsLoading ? (
              <p className="text-text-secondary text-xs">Загрузка…</p>
            ) : appointments.length === 0 ? (
              <Button size="sm" variant="outline" asChild>
                <Link href={ROUTES.shop.b2bOrders}>К заказам</Link>
              </Button>
            ) : (
              appointments.map((a) => (
                <div key={a.id} className="bg-bg-surface2 flex items-center justify-between rounded-lg p-2">
                  <div>
                    <p className="text-sm font-medium">{a.retailer}</p>
                    <p className="text-text-secondary text-xs">{a.date}</p>
                  </div>
                  {a.href ? (
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={a.href}>Заказ</Link>
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4" /> Шоурумы
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={ROUTES.shop.b2bVipRoomBooking}>Записаться</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={session.matrixHref}>Заказ в матрице</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" /> Лайншиты
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={ROUTES.shop.b2bCatalog}>Каталог</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.matrixHref}>Заказ в матрице</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ShopAgentRepCommissionPanel({ session }: { session: ReturnType<typeof buildShopAgentRepSession> }) {
  const actions = useShopAgentRepActions(session);

  return (
    <div className="space-y-4" data-testid="shop-agent-rep-commission-panel">
      <ShopAgentRepCommissionLedgerRuStrip repId={session.repId} orderIds={[session.demoOrderId]} />
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" data-testid={`shop-agent-rep-commission-source-${actions.ledgerMode}`}>
          {actions.ledgerMode === 'postgres'
            ? 'PG · реестр'
            : actions.ledgerMode === 'file'
              ? 'Файл · реестр'
              : actions.ledgerMode === 'memory'
                ? 'Память · реестр'
                : 'Пусто'}{' '}
          · {actions.ledgerTotalRub.toLocaleString('ru-RU')} ₽
        </Badge>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Комиссия · доля</CardTitle>
          <CardDescription>Атрибуция rep и офлайн-черновики.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void actions.previewCommission()}>
            Рассчитать комиссию
          </Button>
          <Button size="sm" variant="outline" onClick={() => void actions.createShareLink()}>
            Ссылка для клиента
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={actions.linesheetShareReady === false}
            data-testid="shop-agent-rep-linesheet-share"
            onClick={() => void actions.shareLinesheetEmail()}
          >
            Лайншит по email
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={actions.draftStorageMode === 'unavailable'}
            onClick={() => void actions.queueOfflineDraft()}
          >
            Офлайн-черновик
          </Button>
          {actions.commissionRub != null ? (
            <Badge variant="secondary">{actions.commissionRub.toLocaleString('ru-RU')} ₽</Badge>
          ) : null}
          {actions.shareUrl ? (
            <p className="text-text-secondary w-full break-all text-xs">{actions.shareUrl}</p>
          ) : null}
          {actions.payoutMessage ? (
            <p className="text-text-secondary w-full text-xs">{actions.payoutMessage}</p>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Реестр комиссий</CardTitle>
          <CardDescription>Строки workshop2_b2b_commissions по repId.</CardDescription>
        </CardHeader>
        <CardContent>
          {actions.ledgerLines.length === 0 ? (
            <p className="text-text-secondary text-sm" data-testid="shop-agent-rep-commission-empty">
              Нет строк — рассчитайте комиссию после submit заказа.
            </p>
          ) : (
            <ul className="space-y-2">
              {actions.ledgerLines.map((line) => (
                <li
                  key={line.orderId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  data-testid={`shop-agent-rep-commission-line-${line.orderId}`}
                >
                  <span>{line.orderId}</span>
                  <span>{line.commissionRub.toLocaleString('ru-RU')} ₽</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" /> Запрос выплаты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" onClick={() => void actions.requestPayout()}>
            Запросить выплату
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ShopAgentRepMatrixPanel({ session }: { session: ReturnType<typeof buildShopAgentRepSession> }) {
  return (
    <div className="space-y-4" data-testid="shop-agent-rep-matrix-panel">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={session.matrixHref}>Full matrix</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={workshop2CollectionAssortmentHref(session.demoCollectionId)}>W2 assortment</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={`${ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=portal`}>
            Portal
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.brandLedgerHref}>Brand ledger</Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ввод заказа в матрице</CardTitle>
        </CardHeader>
        <CardContent>
          <B2bMatrixOrderGrid
            collectionId={session.demoCollectionId}
            articleId={session.demoArticleId}
            compact
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ShopAgentRepWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection') ?? undefined;
  const orderId = searchParams.get('order') ?? searchParams.get('orderId') ?? undefined;
  const session = useMemo(
    () =>
      buildShopAgentRepSession({
        repId: SHOP_AGENT_REP_DEMO_ID,
        collectionId,
        orderId,
      }),
    [collectionId, orderId]
  );
  const ctx = { collectionId, orderId };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-agent-rep');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-agent-rep"
      ctx={ctx}
      crossLinksTitle="Rep → matrix → collaborative"
      beforeTabs={
        <ShopB2bContentHeader lead="RepSpark / Zedonk: rep portal в рабочей цепочке Platform Core." />
      }
    >
      <div className="mb-4 space-y-3">
        <ShopAgentRepSectionRuStrip repId={session.repId} />
        <ShopAgentRepGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={shopAgentRepGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopAgentRepBrandCoPeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'portal' ? <ShopAgentRepPortalPanel session={session} /> : null}
      {activeFeatureId === 'commission' ? <ShopAgentRepCommissionPanel session={session} /> : null}
      {activeFeatureId === 'matrix' ? <ShopAgentRepMatrixPanel session={session} /> : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function ShopAgentRepCoreWorkspace() {
  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6" data-testid="shop-b2b-sales-rep-portal">
      <Suspense fallback={null}>
        <ShopAgentRepWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}
