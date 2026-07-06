'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandCmOrderContextPeerStrip } from '@/components/platform/BrandCmOrderContextPeerStrip';
import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { Factory, MessageSquare } from 'lucide-react';

type Props = {
  orderId: string;
  collectionId?: string;
};

export function BrandOrderCommsChatPanel({ orderId, collectionId }: Props) {
  const session = buildBrandOrderCommsSession({ orderId, collectionId });

  return (
    <div className="space-y-4" data-testid="brand-order-comms-chat-panel">
      <BrandCmOrderContextPeerStrip collectionId={collectionId ?? ''} orderId={orderId} />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <CardTitle className="text-base">Чат заказа</CardTitle>
          </div>
          <CardDescription>Столп 5 · сообщения и треды сущностей в контексте {orderId}.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.messagesHref} data-testid="brand-order-comms-messages-link">
              Открыть сообщения
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link
              href={`${session.messagesHref}&${PILLAR_CAPABILITY_FEATURE_PARAM}=entities`}
              data-testid="brand-order-comms-entities-link"
            >
              Треды сущностей
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.calendarHref}>Календарь заказа</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandOrderCommsHandoffPanel({ orderId, collectionId }: Props) {
  const session = buildBrandOrderCommsSession({ orderId, collectionId });

  return (
    <div className="space-y-4" data-testid="brand-order-comms-handoff-panel">
      <BrandCmOrderContextPeerStrip collectionId={collectionId ?? ''} orderId={orderId} />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Factory className="h-4 w-4" />
            <CardTitle className="text-base">Передача в производство</CardTitle>
          </div>
          <CardDescription>Столп 4 · операции бренда → очередь цеха → трекинг магазина.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.productionOpsHref} data-testid="brand-order-comms-prod-ops-link">
              Передача бренда tab
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.w2SupplyHref}>Снабжение W2</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.shopCollaborativeApprovalsHref}>Согласования магазина</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
