'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { buildSupOpCommsTailHref } from '@/lib/platform/wave-yj-sup-op-procurement-chain';
import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { buildWorkshop2SupplierBulkConfirmIdempotencyKey } from '@/lib/production/workshop2-supplier-bulk-confirm-idempotency';

type Props = {
  collectionId: string;
  articleId: string;
  orderId: string;
  productionOrderId?: string;
  materialsConfirmed?: boolean;
};

/** PATCH material-request → brand order chat + domain event bump (не только ссылки). */
export function SupplierProcurementBrandNotifyStrip({
  collectionId,
  articleId,
  orderId,
  productionOrderId,
  materialsConfirmed = false,
}: Props) {
  const session = buildSupplierProcurementSession({
    collectionId,
    articleId,
    orderId,
    productionOrderId,
  });
  const brandChatHref = buildSupOpCommsTailHref({
    orderId,
    collectionId,
    sectionId: 'sup-op-procurement',
    productionOrderId,
  });
  const entitiesHref = appendSupplierOpPoContextToHref(session.entitiesHref, {
    orderId,
    productionOrderId,
  });
  const [pushing, setPushing] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [pushOk, setPushOk] = useState<boolean | null>(null);

  const handleBrandNotify = async () => {
    if (pushing) return;
    setPushing(true);
    setPushMessage(null);
    setPushOk(null);
    try {
      const idempotencyKey = buildWorkshop2SupplierBulkConfirmIdempotencyKey({
        b2bOrderId: orderId,
        collectionId,
        articleId,
        productionOrderId: productionOrderId?.trim() || undefined,
        notifyOnly: true,
      });
      const res = await fetch('/api/workshop2/supplier/material-request/bulk-confirm', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          collectionId,
          articleId,
          b2bOrderId: orderId,
          productionOrderId: productionOrderId?.trim() || undefined,
          notifyOnly: true,
          idempotencyKey,
          updatedBy: 'supplier-procurement-brand-push',
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
        setPushMessage('Не удалось отправить notify — проверьте PO/BOM queue.');
        return;
      }
      const allIdempotent = (json.confirmed ?? 0) === 0 && (json.idempotent ?? 0) > 0;
      setPushOk(true);
      setPushMessage(
        json.messageRu ??
          (allIdempotent
            ? 'Уже подтверждено · push/SSE активен.'
            : 'Уведомление бренду отправлено · резерв B2B + materials_supplied.')
      );
    } catch {
      setPushOk(false);
      setPushMessage('Ошибка сети при brand notify.');
    } finally {
      setPushing(false);
    }
  };

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 space-y-2 rounded-md border px-3 py-2 text-xs"
      data-testid="sup-op-procurement-brand-push-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          Уведомление бренду
        </Badge>
        <span className="text-text-secondary">
          Подтверждение BOM → чат заказа + push/SSE chain.
        </span>
        <Button
          type="button"
          size="sm"
          variant="default"
          className="h-7 text-[10px]"
          disabled={pushing || !materialsConfirmed}
          data-testid="sup-op-procurement-brand-push-submit"
          onClick={() => void handleBrandNotify()}
        >
          {pushing ? 'Отправка…' : materialsConfirmed ? 'Push → бренд' : 'Push после confirm'}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
          <Link
            href={brandChatHref}
            data-testid="sup-op-procurement-brand-push-chat-link"
            data-comms-tail-po={productionOrderId?.trim() || undefined}
          >
            Чат бренду
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
          <Link
            href={entitiesHref}
            data-testid="sup-op-procurement-brand-push-entities-link"
            data-comms-tail-po={productionOrderId?.trim() || undefined}
          >
            Треды сущностей
          </Link>
        </Button>
      </div>
      {pushMessage ? (
        <p
          className={pushOk ? 'text-text-secondary' : 'text-destructive'}
          data-testid="sup-op-procurement-brand-push-message"
        >
          {pushMessage}
        </p>
      ) : null}
    </div>
  );
}
