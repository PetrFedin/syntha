'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildBrandInventoryOpsSession } from '@/lib/b2b/brand-inventory-ops';
import { ArrowRightLeft, Network, Package, Warehouse } from 'lucide-react';

type Props = {
  collectionId?: string;
};

export function BrandInventoryOverviewBridgePanel({ collectionId }: Props) {
  const session = buildBrandInventoryOpsSession({ collectionId });

  return (
    <Card data-testid="brand-inventory-overview-bridge-panel">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Package className="h-4 w-4" />
          <CardTitle className="text-base">ATP бренда · журнал</CardTitle>
        </div>
        <CardDescription>
          Матрица бренда → перенос остатков → синхронизация с розницей магазина (столп 4).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={session.countHref} data-testid="brand-inventory-bridge-count-link">
            Физический пересчёт
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.balanceHref} data-testid="brand-inventory-bridge-balance-link">
            Вкладка баланса
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.inventoryBalanceHref}>Перенос остатков</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.multiLocationHref}>Несколько складов</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.legacyMatrixHref}>Полная матрица (legacy)</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.shopInventoryOverviewHref}>Склад магазина</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.shopLandedMarginHref}>Маржа магазина</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function BrandInventoryBalanceBridgePanel({ collectionId }: Props) {
  const session = buildBrandInventoryOpsSession({ collectionId });

  return (
    <div className="space-y-4" data-testid="brand-inventory-balance-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            <CardTitle className="text-base">Баланс · перенос</CardTitle>
          </div>
          <CardDescription>Предложения WMS между складами и офлайн-точками.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.inventoryBalanceHref} data-testid="brand-inventory-balance-deep-link">
              Открыть перенос остатков
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shadowInventoryHref}>Теневой склад</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.warehouseHref}>
              <Warehouse className="mr-1 h-3 w-3" />
              Склад
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.overviewHref}>Обзор</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.shopLandedMarginHref}>Маржа магазина</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandInventoryNetworkBridgePanel({ collectionId }: Props) {
  const session = buildBrandInventoryOpsSession({ collectionId });

  return (
    <div className="space-y-4" data-testid="brand-inventory-network-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Network className="h-4 w-4" />
            <CardTitle className="text-base">Сеть ритейлеров</CardTitle>
          </div>
          <CardDescription>ATP магазина · сверка · оповещения пополнения по сети.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.shopInventoryOverviewHref} data-testid="brand-inventory-shop-stock-link">
              Склад магазина
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopInventoryReconcileHref}>Сверка магазина</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.replenishmentAtpHref}>Пополнение · ATP</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.replenishmentAlertsHref}>Оповещения пополнения</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.shopOrderCommsHref}>Трекинг заказа магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.shopMatrixHref}>Матрица магазина</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandInventoryPhysicalCountPanel({ collectionId }: Props) {
  const session = buildBrandInventoryOpsSession({ collectionId });

  return (
    <div className="space-y-4" data-testid="brand-inventory-physical-count-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Физический пересчёт · сверка</CardTitle>
          <CardDescription>
            Цикл пересчёта → расхождения → корректировка журнала магазина (бренд оркестрирует сеть).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.shopInventoryReconcileHref} data-testid="brand-inventory-count-reconcile-link">
              Сверка магазина
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.cycleCountHref}>Циклический пересчёт</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.multiLocationHref}>Несколько складов</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.countHref}>Вкладка пересчёта</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.shopLandedMarginHref}>Маржа магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.brandLandedMarginHref}>Маржа бренда</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
