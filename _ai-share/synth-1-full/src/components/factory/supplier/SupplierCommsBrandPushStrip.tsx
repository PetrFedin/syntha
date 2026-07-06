'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { buildSupOpCommsTailHref } from '@/lib/platform/wave-yj-sup-op-procurement-chain';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

type Props = {
  collectionId: string;
  articleId: string;
  orderId: string;
  productionOrderId?: string;
};

/** Domain-event push: forecast/SLA → POST bulk-confirm + brand chat SSE bump. */
export function SupplierCommsBrandPushStrip({
  collectionId,
  articleId,
  orderId,
  productionOrderId,
}: Props) {
  const session = buildSupplierOrderCommsSession({
    collectionId,
    articleId,
    orderId,
    productionOrderId,
  });
  const brandChatHref = buildSupOpCommsTailHref({
    orderId,
    collectionId,
    sectionId: 'sup-cm-cabinet',
    productionOrderId,
    pillarId: 'comms',
  });
  const [pushing, setPushing] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [pushOk, setPushOk] = useState<boolean | null>(null);

  const handleBrandPush = async () => {
    if (pushing) return;
    setPushing(true);
    setPushMessage(null);
    setPushOk(null);
    try {
      const res = await fetch('/api/workshop2/supplier/material-request/bulk-confirm', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          articleId,
          b2bOrderId: orderId,
          productionOrderId: productionOrderId?.trim() || undefined,
          updatedBy: 'supplier-comms-brand-push',
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        confirmed?: number;
        idempotent?: number;
        messageRu?: string;
      };
      if (!res.ok || !json.ok) {
        setPushOk(false);
        setPushMessage(json.messageRu ?? 'Не удалось отправить push — проверьте MRP queue.');
        return;
      }
      const allIdempotent = (json.confirmed ?? 0) === 0 && (json.idempotent ?? 0) > 0;
      setPushOk(true);
      setPushMessage(
        json.messageRu ??
          (allIdempotent ? 'Уже отправлено · inbox/SSE bump активен.' : 'Push → чат бренда отправлен.')
      );
    } catch {
      setPushOk(false);
      setPushMessage('Ошибка сети при domain push.');
    } finally {
      setPushing(false);
    }
  };

  return (
    <div
      className="border-border-subtle space-y-2 rounded-md border bg-bg-surface2/60 px-3 py-2 text-xs"
      data-testid="sup-cm-cabinet-brand-push-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          Уведомление
        </Badge>
        <span className="text-text-secondary">
          SLA/прогноз → системное сообщение в чат заказа + SSE inbox.
        </span>
        <Button
          type="button"
          size="sm"
          variant="default"
          className="h-7 text-[10px]"
          disabled={pushing}
          data-testid="sup-cm-cabinet-brand-push-submit"
          onClick={() => void handleBrandPush()}
        >
          {pushing ? 'Отправка…' : 'Push → чат бренда'}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
          <Link href={brandChatHref} data-testid="sup-cm-cabinet-brand-push-chat-link">
            Чат бренду
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link href={session.entitiesHref} data-testid="sup-cm-cabinet-brand-push-entities-link">
            Треды сущностей
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link href={session.supplyTabHref} data-testid="sup-cm-cabinet-brand-push-supply-link">
            MRP · поставка
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link href={session.shopTrackingHref} data-testid="sup-cm-cabinet-brand-push-tracking-link">
            Трекинг магазина
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link href={session.brandOrderHandoffHref} data-testid="sup-cm-cabinet-brand-push-handoff-link">
            Передача бренда
          </Link>
        </Button>
      </div>
      {pushMessage ? (
        <p
          className={pushOk ? 'text-text-secondary' : 'text-destructive'}
          data-testid="sup-cm-cabinet-brand-push-message"
        >
          {pushMessage}
        </p>
      ) : null}
    </div>
  );
}
