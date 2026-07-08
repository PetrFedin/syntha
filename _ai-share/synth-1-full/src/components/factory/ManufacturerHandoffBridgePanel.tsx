'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { ClipboardList, Factory } from 'lucide-react';

type Props = {
  factoryId: string;
  orderId?: string;
  collectionId?: string;
};

export function ManufacturerHandoffBridgePanel({ factoryId, orderId, collectionId }: Props) {
  const session = buildManufacturerHandoffQueueSession({ factoryId, orderId, collectionId });

  return (
    <div className="space-y-4" data-testid="manufacturer-handoff-orders-bridge-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Factory className="h-4 w-4" />
            <CardTitle className="text-base">Производственные заказы</CardTitle>
          </div>
          <CardDescription>
            Подтверждение передачи → PO в цехе → закупка материалов.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link
              href={session.factoryOrdersHref}
              data-testid="mfr-handoff-bridge-prod-orders-link"
            >
              Заказы цеха
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.handoffHref} data-testid="mfr-handoff-bridge-queue-link">
              Очередь передачи
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.materialsHref}>Материалы / закупки</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <CardTitle className="text-base">Сквозные роли</CardTitle>
          </div>
          <CardDescription>Передача бренда · трекинг магазина после передачи.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={session.brandHandoffHref} data-testid="mfr-handoff-bridge-brand-ops-link">
              Вкладка передачи бренда
            </Link>
          </Button>
          {orderId ? (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link href={session.shopTrackingHref}>Трекинг магазина</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={session.shopOrderCommsHref}>Связь по заказу магазина</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={session.shopLandedMarginHref}>Маржа магазина</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={session.brandOrderChatHref}>Чат заказа бренда</Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href={session.brandQcGateHref}>Гейт КК бренда</Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href={session.productionOpsCutTicketHref}>Техкарта раскроя</Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href={session.manufacturerOrderCommsHref}>Связь цеха</Link>
              </Button>
            </>
          ) : (
            <p className="text-text-secondary text-sm">Добавьте `?order=` для трекинга магазина.</p>
          )}
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.sampleQueueHref}>Очередь образцов</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
