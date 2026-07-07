'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** NuOrder-style: планирование ассортимента байером по категориям/бюджету до заказа. */
const mockCategories = [
  { id: 'outerwear', name: 'Верхняя одежда', budget: 40, plannedUnits: 120 },
  { id: 'tops', name: 'Топы и блузы', budget: 25, plannedUnits: 200 },
  { id: 'bottoms', name: 'Брюки и юбки', budget: 20, plannedUnits: 150 },
  { id: 'shoes', name: 'Обувь', budget: 15, plannedUnits: 80 },
];

export default function B2BAssortmentPlanningPage() {
  const [totalBudget, setTotalBudget] = useState(2000000);
  const [categories, setCategories] = useState(mockCategories);

  const totalPlannedPercent = categories.reduce((s, c) => s + c.budget, 0);
  const byCategory = totalPlannedPercent
    ? categories.map((c) => ({ ...c, amount: Math.round((totalBudget * c.budget) / 100) }))
    : [];

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader
        backHref={ROUTES.shop.b2bOrderMode}
        lead="Распределите бюджет по категориям перед заказом в матрице."
      />
      <Card>
        <CardHeader>
          <CardTitle>Бюджет и категории</CardTitle>
          <CardDescription>
            Задайте общий бюджет и долю по категориям. План можно перенести в матрицу заказа.
          </CardDescription>
          <div className="grid max-w-xs gap-2 pt-2">
            <Label>Общий бюджет (₽)</Label>
            <Input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value) || 0)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {byCategory.map((c) => (
            <div
              key={c.id}
              className="bg-bg-surface2 border-border-subtle flex items-center justify-between rounded-lg border p-3"
            >
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-sm">{c.budget}%</span>
                <span className="font-semibold">{c.amount.toLocaleString('ru-RU')} ₽</span>
                <span className="text-text-muted text-xs">{c.plannedUnits} ед. план</span>
              </div>
            </div>
          ))}
          <p className="text-text-muted pt-2 text-xs">
            Итого: {totalPlannedPercent}% от бюджета. После сохранения перейдите в матрицу и
            собирайте заказ в рамках плана.
          </p>
          <Button className="mt-2" asChild>
            <Link href={ROUTES.shop.b2bMatrix}>Открыть матрицу заказа</Link>
          </Button>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bBudget}>
            <DollarSign className="mr-1 h-3 w-3" /> OTB Бюджет
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrderMode}>Режим заказа</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Матрица, заказы, аналитика, выставки"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
