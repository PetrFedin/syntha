'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FileText, Send, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import {
  factorySupplierMessagesWorkshop2ArticleContextHref,
  factorySupplierCalendarB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import { PLATFORM_CORE_B2B_MESSAGE_TEMPLATES } from '@/lib/platform-core-ports/communications/platform-core-b2b-message-templates';
import type { SupplierProcurementBomLine } from '@/lib/platform-core-pillar-snapshot.types';

type Props = {
  orderId: string;
};

function lineLabel(line: SupplierProcurementBomLine): string {
  const name = line.materialName?.trim() || '—';
  const qty = line.yieldPerUnit ?? line.consumption ?? line.quantity;
  const unit = line.unit?.trim();
  if (qty != null && qty > 0) {
    return `${name} · ${qty}${unit ? ` ${unit}` : ''}`;
  }
  return name;
}

/** sup×comms: карточка котировки материалов (BOM + шаблон quote + календарь поставки). */
export function SupplierMaterialQuoteCard({ orderId }: Props) {
  const demo = usePlatformCoreDemoContext();
  const { collectionId, demoArticleId, factoryId } = demo;

  const { snapshot } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'supplier',
    factoryId,
    wholesaleOrderId: orderId || undefined,
  });

  const live =
    snapshot?.pillarId === 'order_production' && 'supplierProcurement' in snapshot
      ? snapshot.supplierProcurement
      : null;

  const bomLines = (live?.bomLines ?? []).filter((l) => l.materialName?.trim());
  const materialsDone =
    live?.chainSteps?.find((s) => s.id === 'materials_supplied')?.done === true;
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const quoteTemplate = PLATFORM_CORE_B2B_MESSAGE_TEMPLATES.find(
    (t) => t.id === 'article-price-quote'
  );
  const quoteBody = quoteTemplate?.buildBody({
    collectionId,
    articleId: demoArticleId,
  });
  const articleChatHref = factorySupplierMessagesWorkshop2ArticleContextHref(
    collectionId,
    demoArticleId
  );
  const calendarHref = factorySupplierCalendarB2bOrderContextHref(orderId);

  if (!orderId.trim() || bomLines.length === 0) return null;

  const confirmDelivery = async () => {
    setDeliveryBusy(true);
    try {
      const res = await fetch(
        `/api/workshop2/supplier/b2b-orders/${encodeURIComponent(orderId)}/delivery-confirm`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionId,
            articleId: demoArticleId,
            productionOrderId: live?.productionOrderId ?? undefined,
            confirmedCount: bomLines.length,
          }),
        }
      );
      if (res.ok) setDeliveryConfirmed(true);
    } finally {
      setDeliveryBusy(false);
    }
  };

  const showDeliveryConfirmed = materialsDone || deliveryConfirmed;

  return (
    <Card
      className="border-amber-200/60 bg-amber-50/30"
      data-testid="sup-cm-material-quote-card"
    >
      <CardContent className="space-y-2 p-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <FileText className="text-amber-800 h-3.5 w-3.5" aria-hidden />
          <p className="text-sm font-semibold">Котировка материалов</p>
          {showDeliveryConfirmed ? (
            <Badge
              variant="outline"
              className="border-emerald-300 text-[9px] text-emerald-800"
              data-testid="sup-cm-quote-materials-confirmed-badge"
            >
              Поставка подтверждена
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px]">
              Ожидает подтверждения
            </Badge>
          )}
        </div>
        <ul className="text-text-secondary space-y-0.5" data-testid="sup-cm-quote-bom-lines">
          {bomLines.slice(0, 5).map((line, idx) => (
            <li key={`${line.materialName}-${idx}`} className="text-[10px]">
              · {lineLabel(line)}
            </li>
          ))}
          {bomLines.length > 5 ? (
            <li className="text-text-muted text-[10px]">+ ещё {bomLines.length - 5} строк</li>
          ) : null}
        </ul>
        {quoteBody ? (
          <p
            className="text-text-muted rounded border border-dashed border-amber-200/80 bg-white/60 px-2 py-1.5 text-[10px] leading-relaxed"
            data-testid="sup-cm-quote-template-preview"
          >
            {quoteBody}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
            <Link
              href={articleChatHref}
              data-testid="sup-cm-quote-send-link"
            >
              <Send className="mr-1 h-3 w-3" aria-hidden />
              Отправить котировку
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
            <Link href={calendarHref} data-testid="sup-cm-quote-delivery-calendar-link">
              Календарь поставки
            </Link>
          </Button>
          {!showDeliveryConfirmed ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[10px]"
              disabled={deliveryBusy}
              onClick={() => void confirmDelivery()}
              data-testid="sup-cm-delivery-confirm-btn"
            >
              <Truck className="mr-1 h-3 w-3" aria-hidden />
              {deliveryBusy ? '…' : 'Подтвердить поставку'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
