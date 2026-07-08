'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Share2 } from 'lucide-react';
import { B2BModulePage } from '@/components/shop/B2BModulePage';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

/** NuOrder: Collaborative Buying — совместное редактирование заказа несколькими байерами. */
export function ShopB2bCollaborativeOrderLegacyPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <B2BModulePage
        title="Collaborative Buying"
        description="Совместное редактирование заказа несколькими байерами (NuOrder)"
        moduleId="collaborative-order"
        icon={Users}
        phase={2}
      >
        <Card>
          <CardHeader>
            <CardTitle>Совместный заказ</CardTitle>
            <CardDescription>
              Пригласите коллег для совместного формирования заказа. Изменения синхронизируются в
              реальном времени.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <Share2 className="h-4 w-4" />
              <span>Ссылка для приглашения генерируется в матрице заказа.</span>
            </div>
            <Button asChild>
              <Link href={ROUTES.shop.b2bMatrix}>Открыть матрицу заказа</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={LEGACY_ROUTES.shop.b2bMarginCalculator}>Margin Calculator</Link>
            </Button>
          </CardContent>
        </Card>
      </B2BModulePage>
    </CabinetPageContent>
  );
}
