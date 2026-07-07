'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Store, FileText, Video, Wallet } from 'lucide-react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopAgentRepCoreWorkspace } from '@/components/shop/b2b/ShopAgentRepCoreWorkspace';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { B2b3dSlaChip } from '@/components/shop/b2b/B2b3dSlaChip';
import { B2bRepBrandSwitcher } from '@/components/shop/b2b/B2bRepBrandSwitcher';
import {
  B2bRepOfflineSyncClient,
  getWorkshop2B2bOfflineQueueCountSync,
} from '@/components/shop/b2b/B2bRepOfflineSyncClient';
import { B2bRepMobileShell } from '@/components/shop/b2b/B2bMobileShells';
import {
  WORKSHOP2_B2B_OFFLINE_DRAFT_STORAGE_KEY,
  type Workshop2B2bOfflineDraft,
} from '@/lib/production/workshop2-b2b-wave22-parity';
import type { Workshop2RepAppointment } from '@/lib/production/workshop2-rep-appointments';
import { workshop2CollectionAssortmentHref } from '@/lib/production/workshop2-b2b-collection-href';

const B2bMatrixOrderGrid = dynamic(
  () =>
    import('@/components/shop/b2b/B2bMatrixOrderGrid').then((m) => ({
      default: m.B2bMatrixOrderGrid,
    })),
  { ssr: false }
);

/** Shopify/Candid: Sales Rep Portal — портал для репов и showroom */
export default function SalesRepPortalPage() {
  if (isPlatformCoreMode()) {
    return <ShopAgentRepCoreWorkspace />;
  }

  const [payoutBusy, setPayoutBusy] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [commissionRub, setCommissionRub] = useState<number | null>(null);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [linesheetShareMsg, setLinesheetShareMsg] = useState<string | null>(null);
  const [offlineMsg, setOfflineMsg] = useState<string | null>(null);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [appointments, setAppointments] = useState<Workshop2RepAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [publishGate, setPublishGate] = useState<{
    ready: boolean;
    label: string;
    messageRu: string;
  } | null>(null);
  const repId = 'rep-anna';
  const demoOrderId = 'B2B-SS27-001';
  const demoCampaignId = 'SS27::demo-ss27-01';
  const demoCollectionId = 'SS27';
  const demoArticleId = 'demo-ss27-01';

  const createShareLink = async () => {
    const res = await fetch(
      `/api/shop/b2b/rep/share-link?campaignId=${encodeURIComponent(demoCampaignId)}&repId=${encodeURIComponent(repId)}`
    );
    const json = (await res.json()) as { shareUrl?: string };
    setShareUrl(json.shareUrl ?? null);
  };

  const shareLinesheetEmail = async () => {
    const res = await fetch('/api/shop/b2b/linesheet/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId: demoCollectionId,
        articleId: demoArticleId,
        repId,
        email: 'buyer@demo.ru',
      }),
    });
    const json = (await res.json()) as { messageRu?: string; shareUrl?: string; configured?: boolean };
    setLinesheetShareMsg(json.messageRu ?? (res.ok ? 'Share создан' : `Ошибка (${res.status})`));
    if (json.shareUrl) setShareUrl(json.shareUrl);
  };

  const queueOfflineDraft = () => {
    const draft: Workshop2B2bOfflineDraft = {
      id: `draft-${Date.now()}`,
      createdAt: new Date().toISOString(),
      payload: { campaignId: demoCampaignId, repId, lines: [] },
    };
    const raw = localStorage.getItem(WORKSHOP2_B2B_OFFLINE_DRAFT_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as Workshop2B2bOfflineDraft[]) : [];
    list.push(draft);
    localStorage.setItem(WORKSHOP2_B2B_OFFLINE_DRAFT_STORAGE_KEY, JSON.stringify(list));
    setOfflineMsg(`Черновик в очереди (${list.length})`);
  };

  const syncOfflineDrafts = useCallback(async () => {
    const raw = localStorage.getItem(WORKSHOP2_B2B_OFFLINE_DRAFT_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as Workshop2B2bOfflineDraft[]) : [];
    if (!list.length) {
      setOfflineMsg('Очередь пуста');
      return;
    }
    const draft = list[0]!;
    const res = await fetch('/api/shop/b2b/orders/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repId, ...draft.payload, status: 'submitted' }),
    });
    const json = (await res.json()) as { messageRu?: string };
    if (res.ok) {
      localStorage.setItem(WORKSHOP2_B2B_OFFLINE_DRAFT_STORAGE_KEY, JSON.stringify(list.slice(1)));
    }
    setOfflineMsg(json.messageRu ?? (res.ok ? 'Синхронизировано' : `Ошибка sync (${res.status})`));
  }, [repId]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch(`/api/shop/b2b/rep/appointments?repId=${encodeURIComponent(repId)}`);
        const json = (await r.json()) as { appointments?: Workshop2RepAppointment[] };
        setAppointments(json.appointments ?? []);
      } catch {
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    })();
  }, [repId]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch('/api/workshop2/collections/SS27/publish-showroom-readiness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleIds: ['demo-ss27-01'] }),
        });
        const json = (await r.json()) as { ready?: boolean; messageRu?: string };
        setPublishGate({
          ready: Boolean(json.ready),
          label: json.ready ? 'Showroom: готов' : 'Showroom: gate',
          messageRu: json.messageRu ?? (json.ready ? 'Публикация разрешена' : 'Gate блокирует publish'),
        });
      } catch {
        setPublishGate({
          ready: false,
          label: 'Showroom: API',
          messageRu: 'Не удалось проверить publish-showroom-readiness.',
        });
      }
    })();
  }, []);

  useEffect(() => {
    setOfflineQueueCount(getWorkshop2B2bOfflineQueueCountSync());
  }, []);

  useEffect(() => {
    const runSync = () => {
      const raw = localStorage.getItem(WORKSHOP2_B2B_OFFLINE_DRAFT_STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as Workshop2B2bOfflineDraft[]) : [];
      if (list.length > 0) void syncOfflineDrafts();
    };
    runSync();
    window.addEventListener('online', runSync);
    return () => window.removeEventListener('online', runSync);
  }, [syncOfflineDrafts]);

  const previewCommission = async () => {
    try {
      const res = await fetch(`/api/shop/b2b/orders/${encodeURIComponent(demoOrderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'submitted', repId }),
      });
      const json = (await res.json()) as {
        order?: { commissionPreview?: { commissionRub?: number } };
        messageRu?: string;
      };
      setCommissionRub(json.order?.commissionPreview?.commissionRub ?? null);
      setPayoutMessage(json.messageRu ?? (res.ok ? 'Комиссия рассчитана' : 'Ошибка'));
    } catch {
      setPayoutMessage('Сеть недоступна');
    }
  };

  const reorderForBuyer = async () => {
    setReorderMessage(null);
    try {
      const res = await fetch(`/api/shop/b2b/orders/${encodeURIComponent(demoOrderId)}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repId }),
      });
      const json = (await res.json()) as { messageRu?: string; order?: { id?: string } };
      setReorderMessage(
        json.messageRu ?? (res.ok ? `Reorder ${json.order?.id}` : 'Reorder не создан')
      );
    } catch {
      setReorderMessage('Сеть недоступна');
    }
  };

  const requestPayout = async () => {
    setPayoutBusy(true);
    setPayoutMessage(null);
    try {
      const res = await fetch('/api/shop/b2b/commissions/payout-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repId: 'rep-anna', orderIds: ['B2B-SS27-001'] }),
      });
      const json = (await res.json()) as { messageRu?: string };
      setPayoutMessage(json.messageRu ?? (res.ok ? 'Запрос отправлен' : 'Ошибка payout'));
    } catch {
      setPayoutMessage('Сеть недоступна');
    } finally {
      setPayoutBusy(false);
    }
  };

  return (
    <B2bRepMobileShell
      repId={repId}
      demoCampaignId={demoCampaignId}
      onShareUrl={setShareUrl}
      onSampleMessage={setOfflineMsg}
    >
      <CabinetPageContent
        maxWidth="3xl"
        className="space-y-6"
        data-testid="shop-b2b-sales-rep-portal"
      >
        <ShopB2bContentHeader lead="Портал торгового представителя: встречи в шоуруме, видео и материалы по брендам (сценарии Shopify / Candid)." />

        <B2bRepOfflineSyncClient repId={repId} onQueueChange={setOfflineQueueCount} />
        {offlineQueueCount > 0 ? (
          <p
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            data-testid="shop-b2b-rep-offline-queue-banner"
          >
            Офлайн очередь: {offlineQueueCount}
          </p>
        ) : null}

        <B2bRepBrandSwitcher />

        <div className="flex flex-wrap items-center gap-2" data-testid="shop-b2b-rep-3d-sla-row">
          <B2b3dSlaChip />
          {publishGate ? (
            <>
              <Badge variant={publishGate.ready ? 'default' : 'secondary'} title={publishGate.messageRu}>
                {publishGate.label}
              </Badge>
              <span className="text-text-secondary text-xs">{publishGate.messageRu}</span>
            </>
          ) : null}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" /> Ближайшие встречи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appointmentsLoading ? (
                <p className="text-text-secondary text-xs">Загрузка из B2B orders…</p>
              ) : appointments.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-text-secondary text-xs">
                    Нет встреч — создайте заказ или запишитесь в шоурум.
                  </p>
                  <Button size="sm" variant="outline" className="min-h-11" asChild>
                    <Link href={ROUTES.shop.b2bOrders}>К заказам</Link>
                  </Button>
                </div>
              ) : (
                appointments.map((a) => (
                  <div
                    key={a.id}
                    className="bg-bg-surface2 flex items-center justify-between rounded-lg p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.retailer}</p>
                      <p className="text-text-secondary text-xs">
                        {a.date} ·{' '}
                        {a.type === 'showroom'
                          ? 'Шоурум'
                          : a.type === 'video'
                            ? 'Видео'
                            : 'Поставка'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.status === 'confirmed' ? 'default' : 'secondary'}>
                        {a.status === 'confirmed' ? 'Подтверждено' : 'Ожидает'}
                      </Badge>
                      {a.href ? (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
                          <Link href={a.href}>Заказ</Link>
                        </Button>
                      ) : null}
                    </div>
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
            <CardContent>
              <p className="text-text-secondary mb-3 text-sm">
                Забронируйте время в шоуруме бренда
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={ROUTES.shop.b2bVipRoomBooking}>Записаться</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Мои лайншиты
            </CardTitle>
            <CardDescription>Доступные коллекции для показа клиентам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href={ROUTES.shop.b2bCatalog}>Каталог FW26</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={ROUTES.shop.b2bEzOrder}>EZ Order</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="shop-b2b-rep-attribution">
          <CardHeader>
            <CardTitle className="text-base">Атрибуция и reorder</CardTitle>
            <CardDescription>
              Rep на submit показывает commission preview; reorder клонирует строки заказа.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void previewCommission()}>
              Комиссия при submit
            </Button>
            <Button size="sm" variant="outline" onClick={() => void reorderForBuyer()}>
              Reorder для байера
            </Button>
            {commissionRub != null ? (
              <p className="text-text-secondary w-full text-xs">
                Preview комиссии: {commissionRub.toLocaleString('ru-RU')} ₽
              </p>
            ) : null}
            {reorderMessage ? (
              <p className="text-text-secondary w-full text-xs">{reorderMessage}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="shop-b2b-rep-share-offline">
          <CardHeader>
            <CardTitle className="text-base">Share link и offline draft</CardTitle>
            <CardDescription>
              Токенизированная ссылка linesheet · localStorage sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void createShareLink()}>
              Ссылка linesheet
            </Button>
            <Button size="sm" variant="outline" onClick={() => void shareLinesheetEmail()}>
              Email share (journal)
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={workshop2CollectionAssortmentHref(demoCollectionId)} data-testid="shop-b2b-rep-assortment-w2">
                W2 · assortment plan
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={queueOfflineDraft}>
              Offline черновик
            </Button>
            <Button size="sm" onClick={() => void syncOfflineDrafts()}>
              Sync при online
            </Button>
            {shareUrl ? (
              <p className="text-text-secondary w-full break-all text-xs">{shareUrl}</p>
            ) : null}
            {linesheetShareMsg ? (
              <p className="text-text-secondary w-full text-xs">{linesheetShareMsg}</p>
            ) : null}
            {offlineMsg ? <p className="text-text-secondary w-full text-xs">{offlineMsg}</p> : null}
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="shop-b2b-rep-matrix-panel">
          <CardHeader>
            <CardTitle className="text-base">Ввод заказа в матрице</CardTitle>
            <CardDescription>Тот же grid, что в buyer showroom — batch cart/matrix API.</CardDescription>
          </CardHeader>
          <CardContent>
            <B2bMatrixOrderGrid collectionId={demoCollectionId} articleId={demoArticleId} compact />
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="shop-b2b-commission-payout-stub">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" /> Запрос выплаты комиссии
            </CardTitle>
            <CardDescription>
              Помечает комиссии как payout_pending в PG (без fake bank transfer ACK).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" disabled={payoutBusy} onClick={() => void requestPayout()}>
              {payoutBusy ? 'Отправка…' : 'Запросить выплату (rep-anna)'}
            </Button>
            {payoutMessage ? <p className="text-text-secondary text-xs">{payoutMessage}</p> : null}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.shop.b2bVideoConsultation}>
              <Video className="mr-1 h-3 w-3" /> Видео-консультация
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.shop.b2bCatalog}>B2B каталог</Link>
          </Button>
        </div>
      </CabinetPageContent>
    </B2bRepMobileShell>
  );
}
