'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix';
import { factoryProductionOrdersOrderContextHref } from '@/lib/platform-core-routes';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  role: 'manufacturer' | 'supplier';
};

/** Контекст B2B-заказа на factory calendar — без дубля чата (comms cross-nav). */
export function PlatformCoreFactoryCalendarOrderContextStrip({ orderId, role }: Props) {
  const demo = usePlatformCoreDemoContext();

  const stripTestId =
    role === 'supplier' ? 'sup-cm-calendar-context-strip' : 'mfr-cm-calendar-context-strip';

  return (
    <div
      className={cn(hubGadget.goldenPath, 'mb-2')}
      data-testid={stripTestId}
      data-audit-legacy="factory-calendar-order-context-strip"
      data-variant={role}
    >
      <span className="text-text-muted font-mono text-[9px]">{orderId}</span>
      {role === 'manufacturer' ? (
        <>
          <Link
            href={factoryHandoffQueueHrefForDemo(demo)}
            data-testid="factory-calendar-handoff-link"
            className={hubGadget.goldenLink}
          >
            Очередь
          </Link>
          <Link
            href={factoryProductionOrdersOrderContextHref(orderId, { factoryId: demo.factoryId })}
            data-testid="factory-calendar-prod-orders-link"
            className={hubGadget.goldenLink}
          >
            Заказы
          </Link>
        </>
      ) : (
        <Link
          href={factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' })}
          data-testid="sup-cm-calendar-procurement-link"
          className={hubGadget.goldenLink}
        >
          Закупка
        </Link>
      )}
    </div>
  );
}
