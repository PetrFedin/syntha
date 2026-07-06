'use client';

import Link from 'next/link';
import { CommsContextualThreadLink } from '@/components/platform/CommsContextualThreadLink';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkshop2B2bOrderDetail } from '@/hooks/use-workshop2-b2b-order-detail';
import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { PLATFORM_CORE_ORDER_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import {
  WAVE_YN_CHAT_TAB_RU,
  WAVE_YN_OPEN_MESSAGES_RU,
} from '@/lib/platform/wave-yn-comms-contextual-thread';
import { MessageSquare, Factory } from 'lucide-react';

type Props = {
  orderId: string;
  collectionId: string;
};

/** Comms detail · registry SoT + slim summary (без дубля chain/PO/lines из registry). */
export function BrandOrderCommsDetailPanel({ orderId, collectionId }: Props) {
  const { order, loadState } = useWorkshop2B2bOrderDetail(orderId, true);
  const session = buildBrandOrderCommsSession({ orderId, collectionId });

  if (loadState === 'loading') {
    return (
      <p className="text-text-muted text-sm" data-testid="brand-order-comms-detail-loading">
        Загрузка контекста заказа…
      </p>
    );
  }

  if (loadState === 'error' || !order) {
    return (
      <Card className="border-amber-200 bg-amber-50/50" data-testid="brand-order-comms-detail-error">
        <CardContent className="py-4 text-center text-sm text-amber-900">
          {PLATFORM_CORE_ORDER_UNAVAILABLE_RU}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="brand-order-comms-detail-panel">
      <div className={hubGadget.goldenPath} data-testid="brand-order-comms-registry-sot-strip">
        <span className="text-text-muted text-[10px] uppercase">Реестр SoT</span>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={session.registryHref}
          className={hubGadget.goldenLink}
          data-testid="brand-order-comms-registry-sot-link"
        >
          Полная карточка заказа
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={brandCrmSegmentationFeatureHref('segments', collectionId)}
          className={hubGadget.goldenLink}
          data-testid="brand-order-comms-crm-segments-link"
        >
          Сегменты CRM
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={brandCrmSegmentationFeatureHref('pricelist', collectionId)}
          className={hubGadget.goldenLink}
          data-testid="brand-order-comms-crm-pricelist-link"
        >
          Прайс-лист
        </Link>
      </div>

      <Card data-testid="brand-order-comms-detail-summary-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Order context · comms</CardTitle>
          <CardDescription>
            Краткий контекст для чата и передачи. Цепочка, PO и строки — в реестре (SoT выше).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-text-muted text-[10px] font-bold uppercase">Заказ</p>
            <p className="font-mono text-xs font-semibold">{orderId}</p>
          </div>
          <div>
            <p className="text-text-muted text-[10px] font-bold uppercase">Статус</p>
            <Badge variant="outline" data-testid="brand-order-comms-detail-status">
              {order.statusLabelRu}
            </Badge>
          </div>
          <div>
            <p className="text-text-muted text-[10px] font-bold uppercase">Партнёр</p>
            <p className="font-medium">{order.buyerLabelRu}</p>
          </div>
          <div>
            <p className="text-text-muted text-[10px] font-bold uppercase">Сумма</p>
            <p className="font-black tabular-nums">{order.totalRub.toLocaleString('ru-RU')} ₽</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link href={session.chatHref} data-testid="brand-order-comms-detail-chat-tab-link">
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            {WAVE_YN_CHAT_TAB_RU}
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.handoffHref} data-testid="brand-order-comms-detail-handoff-tab-link">
            <Factory className="mr-1.5 h-3.5 w-3.5" />
            Вкладка передачи
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <CommsContextualThreadLink
            href={session.messagesHref}
            orderId={orderId}
            collectionId={collectionId}
            contextualSource="order-card"
            data-testid="brand-order-comms-detail-messages-link"
          >
            {WAVE_YN_OPEN_MESSAGES_RU}
          </CommsContextualThreadLink>
        </Button>
      </div>
    </div>
  );
}
