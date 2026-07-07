'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Percent } from 'lucide-react';
import { B2BModulePage } from '@/components/shop/B2BModulePage';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { withShopB2bCoreLegacyGuard } from '@/app/shop/b2b/shop-b2b-core-legacy-guard';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';

/** NuOrder: виджет расчёта маржи в корзине. */
function B2BMarginCalculatorPageContent() {
  const [buyPrice, setBuyPrice] = useState(10000);
  const [sellPrice, setSellPrice] = useState(15000);
  const margin = sellPrice > 0 ? (((sellPrice - buyPrice) / sellPrice) * 100).toFixed(1) : '0';

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopAnalyticsSegmentErpStrip />
      <B2BModulePage
        title="Margin Calculator"
        description="Расчёт маржи в корзине"
        moduleId="margin-calculator"
        icon={Calculator}
        phase={2}
      >
        <Card>
          <CardHeader>
            <CardTitle>Калькулятор маржи</CardTitle>
            <CardDescription>
              Введите закупочную и розничную цену для расчёта маржинальности.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Закупочная цена (₽)</Label>
              <Input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Розничная цена (₽)</Label>
              <Input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value) || 0)}
              />
            </div>
            <div className="bg-bg-surface2 border-border-subtle flex items-center gap-2 rounded-lg border p-3">
              <Percent className="text-text-secondary h-4 w-4" />
              <span className="font-semibold">Маржа: {margin}%</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
                <Link href={ROUTES.shop.b2bCollaborativeOrder}>Совместный заказ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </B2BModulePage>
      <div className="border-border-subtle mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-margin-calculator-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analyticsFootfall}
            data-testid="shop-b2b-margin-calculator-footfall-link"
          >
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>
    </CabinetPageContent>
  );
}

export default withShopB2bCoreLegacyGuard(
  ROUTES.shop.b2bMarginCalculator,
  B2BMarginCalculatorPageContent
);
