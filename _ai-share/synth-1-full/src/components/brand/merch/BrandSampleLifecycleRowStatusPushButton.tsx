'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  fetchWorkshop2ActiveSampleOrder,
  postWorkshop2SampleOrderTransitionApi,
} from '@/lib/production/workshop2-sample-api-client';
import { labelWorkshop2SampleOrderStatusRu } from '@/lib/production/workshop2-release-production-display';
import { getNextWorkshop2SampleOrderStatus } from '@/lib/production/workshop2-sample-order-transitions';
import { useToast } from '@/hooks/use-toast';

type Props = {
  collectionId: string;
  articleId: string;
  sku: string;
  disabled?: boolean;
};

/** POST sample-order transition → domain event + comms inbox bump (не только peer href). */
export function BrandSampleLifecycleRowStatusPushButton({
  collectionId,
  articleId,
  sku,
  disabled,
}: Props) {
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWorkshop2ActiveSampleOrder(collectionId, articleId);
        if (cancelled) return;
        setOrderId(res.order?.id ?? null);
        setCurrentStatus(res.order?.status ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  const nextStatus = currentStatus ? getNextWorkshop2SampleOrderStatus(currentStatus) : null;

  const handlePush = useCallback(async () => {
    if (!orderId || !nextStatus || pushing) return;
    setPushing(true);
    try {
      const res = await postWorkshop2SampleOrderTransitionApi({
        collectionId,
        articleId,
        orderId,
        toStatus: nextStatus,
        actor: 'brand-sample-lifecycle-rounds',
        note: `Round push · ${sku}`,
      });
      if (res.ok && res.order) {
        setCurrentStatus(res.order.status);
        toast({
          title: 'Статус образца обновлён',
          description: `${labelWorkshop2SampleOrderStatusRu(res.from)} → ${labelWorkshop2SampleOrderStatusRu(res.order.status)} · inbox SSE`,
        });
      } else {
        toast({
          title: 'Push не выполнен',
          description: res.messageRu ?? 'Проверьте allowed transitions.',
          variant: 'destructive',
        });
      }
    } finally {
      setPushing(false);
    }
  }, [articleId, collectionId, nextStatus, orderId, pushing, sku, toast]);

  if (loading) {
    return (
      <span
        className="text-text-muted text-[10px]"
        data-testid={`brand-sample-lifecycle-push-${sku}-loading`}
      >
        …
      </span>
    );
  }

  if (!orderId || !nextStatus) {
    return (
      <span
        className="text-text-muted text-[10px]"
        data-testid={`brand-sample-lifecycle-push-${sku}-idle`}
        title={orderId ? 'Финальный статус' : 'Нет активного sample-order в PG'}
      >
        —
      </span>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className="h-7 text-[10px]"
      disabled={disabled || pushing}
      data-testid={`brand-sample-lifecycle-push-${sku}-btn`}
      onClick={() => void handlePush()}
    >
      {pushing ? '…' : `Push → ${nextStatus}`}
    </Button>
  );
}
