'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildShopCollaborativeOrderSession,
  shopCollaborativeParticipantStatusRu,
  summarizeShopCollaborativeOrder,
} from '@/lib/b2b/shop-collaborative-order';
import {
  shopCollaborativeApprovalCanAdvance,
  shopCollaborativeApprovalStorageModeLabelRu,
  shopCollaborativeApprovalWaitingBrandMargin,
  type ShopCollaborativeApprovalState,
  type ShopCollaborativeApprovalStepId,
} from '@/lib/shop/shop-collaborative-approval-feed';
import {
  advanceShopCollaborativeApprovalStep,
  fetchShopCollaborativeApproval,
} from '@/lib/shop/shop-collaborative-approval-store';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { useShopCollaborativeSessionLive } from '@/hooks/use-shop-collaborative-session-live';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ShopCollaborativeSessionLiveBadges } from '@/components/shop/b2b/ShopCollaborativeSessionLiveBadges';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

function useShopCollaborativeApprovalState(orderId: string) {
  const { buyerId } = useShopCoreBuyerId();
  const [state, setState] = useState<ShopCollaborativeApprovalState | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyStep, setBusyStep] = useState<ShopCollaborativeApprovalStepId | null>(null);

  const reload = useCallback(async () => {
    if (!orderId.trim()) {
      setState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const next = await fetchShopCollaborativeApproval({ buyerId, orderId });
      setState(next);
    } finally {
      setLoading(false);
    }
  }, [buyerId, orderId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const advanceStep = useCallback(
    async (stepId: ShopCollaborativeApprovalStepId) => {
      setBusyStep(stepId);
      try {
        const result = await advanceShopCollaborativeApprovalStep({ buyerId, orderId, stepId });
        setState(result.state);
        setStorageMode(result.storageMode ?? null);
        return result;
      } finally {
        setBusyStep(null);
      }
    },
    [buyerId, orderId]
  );

  return { buyerId, state, storageMode, loading, busyStep, reload, advanceStep };
}

export function ShopCollaborativeOrderSessionPanel() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const { activeOrderId } = useSpineActiveWholesaleOrderId({ resolveFrom: ['allocation', 'operational'] });
  const { buyerId, state, loading, reload } = useShopCollaborativeApprovalState(activeOrderId);
  const live = useShopCollaborativeSessionLive({
    orderId: activeOrderId,
    collectionId,
    buyerId,
    enabled: Boolean(activeOrderId.trim()),
  });
  const session = useMemo(
    () =>
      buildShopCollaborativeOrderSession({
        orderId: activeOrderId,
        collectionId,
        buyerId,
        approvalState: state,
      }),
    [activeOrderId, collectionId, buyerId, state]
  );
  const summary = useMemo(() => summarizeShopCollaborativeOrder(session), [session]);

  useEffect(() => {
    if (!live.sessionPollTs) return;
    void reload();
  }, [live.sessionPollTs, reload]);

  return (
    <div className="space-y-4" data-testid="shop-collaborative-order-session-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Заказ: {session.orderId}</Badge>
        <Badge variant="outline">Редактирование: {summary.editing}</Badge>
        {loading ? (
          <Badge variant="outline" className="text-[10px]">
            загрузка…
          </Badge>
        ) : null}
        <ShopCollaborativeSessionLiveBadges
          orderId={activeOrderId}
          collectionId={collectionId}
          buyerId={buyerId}
        />
        {state && shopCollaborativeApprovalWaitingBrandMargin(state) ? (
          <Badge variant="outline" className="text-[10px]" data-testid="shop-collaborative-brand-margin-pending">
            Ожидает бренда
          </Badge>
        ) : null}
        <Button size="sm" asChild>
          <Link href={session.approvalsHref}>Согласования</Link>
        </Button>
      </div>
      <div className={hubGadget.goldenPath} data-testid="shop-collaborative-session-cross-links">
        <Link
          href={session.matrixHref}
          className={hubGadget.goldenLink}
          data-testid="shop-collaborative-matrix-link"
        >
          Матрица
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={session.workingOrderHref}
          className={hubGadget.goldenLink}
          data-testid="shop-collaborative-working-order-versions-link"
        >
          Версии рабочего заказа
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={session.brandCoApprovePortalHref}
          className={hubGadget.goldenLink}
          data-testid="shop-collaborative-brand-portal-link"
        >
          Согласование бренда
        </Link>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Сессия совместного заказа</CardTitle>
          <CardDescription>
            Совместное редактирование — участники на одной матрице заказа.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {session.participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              data-testid={`shop-collaborative-participant-${p.id}`}
            >
              <span>{p.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {shopCollaborativeParticipantStatusRu(p.status)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ShopCollaborativeOrderApprovalsPanel() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const { activeOrderId } = useSpineActiveWholesaleOrderId({ resolveFrom: ['allocation', 'operational'] });
  const { toast } = useToast();
  const { buyerId, state, storageMode, loading, busyStep, advanceStep, reload } =
    useShopCollaborativeApprovalState(activeOrderId);
  const live = useShopCollaborativeSessionLive({
    orderId: activeOrderId,
    collectionId,
    buyerId,
    enabled: Boolean(activeOrderId.trim()),
  });
  const storageLabelRu = shopCollaborativeApprovalStorageModeLabelRu(storageMode);
  const storagePgTestId =
    storageMode === 'pg' ? 'shop-collaborative-session-storage-pg' : undefined;

  useEffect(() => {
    if (!live.sessionPollTs) return;
    void reload();
  }, [live.sessionPollTs, reload]);
  const session = useMemo(
    () =>
      buildShopCollaborativeOrderSession({
        orderId: activeOrderId,
        collectionId,
        buyerId,
        approvalState: state,
      }),
    [activeOrderId, collectionId, buyerId, state]
  );
  const summary = useMemo(() => summarizeShopCollaborativeOrder(session), [session]);
  const effectiveState = state ?? {
    buyerId,
    orderId: activeOrderId,
    matrixDone: false,
    marginDone: false,
    submitDone: false,
    updatedAt: '',
  };

  const onAdvance = async (stepId: ShopCollaborativeApprovalStepId) => {
    try {
      const result = await advanceStep(stepId);
      toast({
        title: result.advanced ? 'Шаг подтверждён' : 'Шаг недоступен',
        description:
          stepId === 'submit' && result.advanced
            ? 'Заказ отправлен на согласование бренду.'
            : result.advanced
              ? session.approvals.find((s) => s.id === stepId)?.labelRu
              : 'Сначала завершите предыдущий шаг.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: err instanceof Error ? err.message : 'Не удалось сохранить шаг.',
      });
    }
  };

  return (
    <div className="space-y-4" data-testid="shop-collaborative-order-approvals-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          Готово {summary.approvalsDone}/{summary.approvalsTotal}
        </Badge>
        {storageLabelRu ? (
          <Badge
            variant="outline"
            className="text-[10px]"
            data-testid={storagePgTestId ?? 'shop-collaborative-approval-storage-mode'}
          >
            {storageLabelRu}
          </Badge>
        ) : null}
        {loading ? (
          <Badge variant="outline" className="text-[10px]">
            загрузка…
          </Badge>
        ) : null}
        <Button size="sm" variant="outline" asChild>
          <Link href={session.landedMarginHref}>Маржа с доставкой</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={session.matrixHref}>Проверить матрицу</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.brandOrderChatHref}>Чат заказа бренда</Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Цепочка согласований</CardTitle>
          <CardDescription>
            Блокировка матрицы → маржа → отправка бренду. Сохранение в PG / файл.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {session.approvals.map((step) => {
            const stepId = step.id as ShopCollaborativeApprovalStepId;
            const canAdvance = shopCollaborativeApprovalCanAdvance(effectiveState, stepId, 'shop');
            const waitingBrand =
              stepId === 'margin' &&
              shopCollaborativeApprovalWaitingBrandMargin(effectiveState);
            return (
              <div
                key={step.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                data-testid={`shop-collaborative-approval-${step.id}`}
              >
                <span>{step.labelRu}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={step.done ? 'secondary' : 'outline'}>
                    {step.done ? 'готово' : 'ожидание'}
                  </Badge>
                  {!step.done && canAdvance ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyStep === stepId}
                      data-testid={`shop-collaborative-approval-advance-${step.id}`}
                      onClick={() => void onAdvance(stepId)}
                    >
                      {busyStep === stepId ? '…' : 'Подтвердить'}
                    </Button>
                  ) : null}
                  {waitingBrand ? (
                    <Badge variant="outline" className="text-[10px]" data-testid="shop-collaborative-approval-brand-only-margin">
                      только бренд
                    </Badge>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export function ShopCollaborativeOrderCommsPanel() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const { activeOrderId } = useSpineActiveWholesaleOrderId({ resolveFrom: ['allocation', 'operational'] });
  const session = useMemo(
    () => buildShopCollaborativeOrderSession({ orderId: activeOrderId, collectionId }),
    [activeOrderId, collectionId]
  );

  return (
    <div className="space-y-4" data-testid="shop-collaborative-order-comms-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Чат по заказу</CardTitle>
          <CardDescription>Столп 5: чат и календарь в контексте B2B-заказа.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.messagesHref}>Чат заказа</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.calendarHref}>Календарь заказа</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.trackingHref}>Трекинг магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.brandOrderHandoffHref}>Передача бренда</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
