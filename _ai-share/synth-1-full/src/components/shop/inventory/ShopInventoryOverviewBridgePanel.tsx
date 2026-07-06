'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import { Package, RefreshCw } from 'lucide-react';

type Props = {
  collectionId?: string;
};

export function ShopInventoryOverviewBridgePanel({ collectionId }: Props) {
  const session = buildShopInventoryOpsSession({ collectionId });

  return (
    <Card className="mb-4" data-testid="shop-inventory-overview-bridge-panel">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Package className="h-4 w-4" />
          <CardTitle className="text-base">ATP · replenish chain</CardTitle>
        </div>
        <CardDescription>
          Onfinity ledger → cycle count reconcile → replenishment rules (столп 4).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={session.reconcileHref} data-testid="shop-inventory-bridge-reconcile-link">
            Reconcile
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.cycleCountHref}>Cycle counting</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.replenishmentAtpHref}>Пополнение · ATP</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.replenishmentRulesHref}>
            <RefreshCw className="mr-1 h-3 w-3" />
            Rules
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.landedMarginHref}>Маржа с доставкой</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.orderCommsHref}>Трекинг заказа</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.brandInventoryOverviewHref}>Brand inventory</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
