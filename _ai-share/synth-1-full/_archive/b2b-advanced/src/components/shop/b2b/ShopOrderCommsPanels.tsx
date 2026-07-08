'use client';

import Link from 'next/link';
import { CommsContextualThreadLink } from '@/components/platform/CommsContextualThreadLink';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopCmOrderContextPeerStrip } from '@/components/platform/ShopCmOrderContextPeerStrip';
import {
  buildShopOrderCommsSession,
  shopOrderCommsCalendarDeepHref,
  shopOrderCommsMessagesDeepHref,
} from '@/lib/b2b/shop-order-comms';
import { WAVE_YN_OPEN_MESSAGES_RU } from '@/lib/platform/wave-yn-comms-contextual-thread';
import { Calendar, MessageSquare } from 'lucide-react';

type Props = {
  orderId?: string;
  collectionId?: string;
};

export function ShopOrderCommsChatPanel({ orderId, collectionId }: Props) {
  if (!orderId?.trim()) {
    return (
      <Card data-testid="shop-order-comms-chat-missing-order">
        <CardContent className="py-8 text-center text-sm text-text-secondary">
          Укажите `?order=` для order-context chat.
        </CardContent>
      </Card>
    );
  }

  const session = useMemo(
    () => buildShopOrderCommsSession({ orderId, collectionId }),
    [orderId, collectionId]
  );
  const messagesHref = shopOrderCommsMessagesDeepHref(orderId);

  return (
    <div className="space-y-4" data-testid="shop-order-comms-chat-panel">
      <ShopCmOrderContextPeerStrip collectionId={collectionId ?? ''} orderId={orderId} />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <CardTitle className="text-base">Чат заказа</CardTitle>
          </div>
          <CardDescription>NuOrder collab: messages в контексте заказа {orderId}.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <CommsContextualThreadLink
              href={messagesHref}
              orderId={orderId}
              collectionId={collectionId}
              contextualSource="order-card"
              data-testid="shop-order-comms-messages-deep-link"
            >
              {WAVE_YN_OPEN_MESSAGES_RU}
            </CommsContextualThreadLink>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.collaborativeHref}>Совместный заказ comms</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.brandOrderChatHref}>Чат заказа бренда</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ShopOrderCommsCalendarPanel({ orderId, collectionId }: Props) {
  if (!orderId?.trim()) {
    return (
      <Card data-testid="shop-order-comms-calendar-missing-order">
        <CardContent className="py-8 text-center text-sm text-text-secondary">
          Укажите `?order=` для order calendar.
        </CardContent>
      </Card>
    );
  }

  const session = useMemo(
    () => buildShopOrderCommsSession({ orderId, collectionId }),
    [orderId, collectionId]
  );
  const calendarHref = shopOrderCommsCalendarDeepHref(orderId);

  return (
    <div className="space-y-4" data-testid="shop-order-comms-calendar-panel">
      <ShopCmOrderContextPeerStrip collectionId={collectionId ?? ''} orderId={orderId} />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="h-4 w-4" />
            <CardTitle className="text-base">Календарь заказа</CardTitle>
          </div>
          <CardDescription>Delivery windows · milestones · production sync.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={calendarHref} data-testid="shop-order-comms-calendar-deep-link">
              Open calendar
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.workingOrderHref}>Рабочий заказ</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.replenishmentAtpHref}>Пополнение · ATP</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
