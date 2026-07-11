'use client';

import { Truck } from 'lucide-react';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { ShopOrderProductionPillarCard } from '@/components/platform/ShopOrderProductionPillarCard';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';

const SHOP_ORDER_PRODUCTION_SECTIONS = new Set(['shop-op-tracking']);

type Props = {
  collectionId: string;
  sectionId: string;
  orderId?: string | null;
  articleId?: string | null;
};

/** Shop · Order Production: tracking and receiving entry point inside core cabinet. */
export function ShopOrderProductionCabinetWorkspace({
  collectionId,
  sectionId,
  orderId,
  articleId,
}: Props) {
  if (!SHOP_ORDER_PRODUCTION_SECTIONS.has(sectionId)) {
    return (
      <PlatformCoreEmptyState
        title="Раздел исполнения не найден"
        reason="Ссылка устарела или вкладка больше не входит в рабочий контур Shop Order Production."
        nextActionLabel="Открыть трекинг исполнения"
        nextActionHref={roleCoreCabinetHref({
          roleId: 'shop',
          pillarId: 'order_production',
          collectionId,
          sectionId: 'shop-op-tracking',
          orderId,
          articleId,
        })}
      />
    );
  }

  return (
    <div data-testid="shop-order-production-workspace" className="min-w-0 space-y-2.5">
      <header className="border-border-subtle border-b pb-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Truck className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
          <h1 className="truncate text-[15px] font-semibold text-text-primary">
            Трекинг исполнения и приёмка
          </h1>
        </div>
        <p className="mt-0.5 max-w-3xl text-[12px] leading-5 text-text-secondary">
          Контролируйте производство, готовность к отгрузке, ETA, документы и следующий шаг приёмки магазина.
        </p>
      </header>

      <ShopOrderProductionPillarCard compact={false} minimalChrome />
    </div>
  );
}
