'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { fetchBrandLandedMarginSkuDefaults } from '@/lib/b2b/landed-margin-feed-store';
import { products } from '@/lib/products';
import { simulateMargin } from '@/lib/fashion/margin-simulator';

type Props = {
  collectionId?: string;
  orderId?: string;
};

export function BrandMarginSimulatorPanel({ collectionId, orderId }: Props) {
  const [selectedSku, setSelectedSku] = useState(products[0].sku);
  const [retailPrice, setRetailPrice] = useState(String(products[0].price));
  const [productionCost, setProductionCost] = useState(
    String(Math.round(products[0].price * 0.25))
  );
  const [storageMode, setStorageMode] = useState('demo');

  const product = useMemo(
    () => products.find((p) => p.sku === selectedSku) || products[0],
    [selectedSku]
  );

  const loadSkuDefaults = useCallback(
    async (sku: string) => {
      const defaults = await fetchBrandLandedMarginSkuDefaults({ collectionId, orderId, sku });
      if (!defaults.ok) return;
      setStorageMode(defaults.storageMode ?? 'demo');
      if (defaults.retailRub != null) setRetailPrice(String(defaults.retailRub));
      if (defaults.productionRub != null) setProductionCost(String(defaults.productionRub));
    },
    [collectionId, orderId]
  );

  useEffect(() => {
    void loadSkuDefaults(selectedSku);
  }, [loadSkuDefaults, selectedSku]);

  const simulation = useMemo(
    () =>
      simulateMargin(product, {
        retailPrice: parseFloat(retailPrice) || 0,
        productionCost: parseFloat(productionCost) || 0,
      }),
    [product, retailPrice, productionCost]
  );

  return (
    <div className="space-y-4" data-testid="brand-margin-simulator-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" data-testid={`brand-margin-simulator-feed-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG margin feed' : `${storageMode} margin feed`}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Параметры SKU</CardTitle>
              <CardDescription>Unit economics · defaults from PG margin feed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Выберите товар</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={selectedSku}
                  onChange={(e) => {
                    const p = products.find((x) => x.sku === e.target.value)!;
                    setSelectedSku(p.sku);
                    setRetailPrice(String(p.price));
                    setProductionCost(String(Math.round(p.price * 0.25)));
                  }}
                >
                  {products.slice(0, 20).map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retail">Retail Price (₽)</Label>
                <Input
                  id="retail"
                  inputMode="decimal"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Себестоимость производства (₽)</Label>
                <Input
                  id="cost"
                  inputMode="decimal"
                  value={productionCost}
                  onChange={(e) => setProductionCost(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="py-3">
                <CardDescription className="text-[10px] font-bold uppercase">
                  Net Profit
                </CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {simulation.netProfit.toLocaleString()} ₽
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="py-3">
                <CardDescription className="text-[10px] font-bold uppercase">
                  Net Margin
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-emerald-700">
                  {simulation.netMarginPct}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="py-3">
                <CardDescription className="text-[10px] font-bold uppercase">
                  Markup (x)
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-blue-700">
                  {simulation.markup}x
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unit Economics Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Retail Price (inc. VAT)</TableCell>
                    <TableCell className="text-right font-mono">
                      {simulation.retailPrice.toLocaleString()} ₽
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">VAT (20%)</TableCell>
                    <TableCell className="text-right font-mono text-rose-600">
                      -{Math.round(simulation.retailPrice * 0.166).toLocaleString()} ₽
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Себестоимость</TableCell>
                    <TableCell className="text-right font-mono text-rose-600">
                      -{simulation.productionCost.toLocaleString()} ₽
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Logistics & Warehousing</TableCell>
                    <TableCell className="text-right font-mono text-rose-600">
                      -{simulation.logisticsCost.toLocaleString()} ₽
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Marketing & Sales</TableCell>
                    <TableCell className="text-right font-mono text-rose-600">
                      -{simulation.marketingCost.toLocaleString()} ₽
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Net Operating Profit</TableCell>
                    <TableCell className="text-right font-bold text-emerald-700">
                      {simulation.netProfit.toLocaleString()} ₽
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
