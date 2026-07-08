'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Package, QrCode, Truck, Factory, ArrowUpFromLine } from 'lucide-react';
import { getAvailableQty, type InventoryItem } from '@/lib/warehouse';
import { cn } from '@/lib/utils';
import { getLogisticsLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

const MOCK_INVENTORY: InventoryItem[] = [
  {
    skuId: 'TP-9921',
    size: 'M',
    color: 'Black',
    qty: 120,
    reserved: 30,
    location: 'main',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    skuId: 'TP-9921',
    size: 'L',
    color: 'Black',
    qty: 80,
    reserved: 0,
    location: 'main',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    skuId: 'TP-8812',
    size: 'M',
    color: 'Green',
    qty: 200,
    reserved: 50,
    location: 'retailer',
    locationId: 'TSUM',
    updatedAt: '2026-03-09T14:00:00Z',
  },
];

export default function WarehousePage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Складской учёт"
        leadPlain="Инвентарь, остатки, связь с Production и маркировкой"
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.production}>
                <Factory className="mr-2 h-4 w-4" /> Production
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.logisticsDutyCalculator}>
                <Truck className="mr-2 h-4 w-4" /> Duty Calculator
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.logisticsConsolidation}>
                <Package className="mr-2 h-4 w-4" /> Консолидация
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.logisticsShadowInventory}>
                <ArrowUpFromLine className="mr-2 h-4 w-4" /> Shadow Inventory
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.complianceStock}>
                <QrCode className="mr-2 h-4 w-4" /> КИЗ / Честный ЗНАК
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Всего SKU</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">
              {new Set(MOCK_INVENTORY.map((i) => i.skuId)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">В наличии</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{MOCK_INVENTORY.reduce((s, i) => s + i.qty, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Зарезервировано</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">
              {MOCK_INVENTORY.reduce((s, i) => s + (i.reserved ?? 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Остатки по позициям</CardTitle>
          <p className="text-text-secondary text-sm">Связь с B2B заказами и Production</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Цвет</TableHead>
                <TableHead>Кол-во</TableHead>
                <TableHead>Резерв</TableHead>
                <TableHead>Доступно</TableHead>
                <TableHead>Локация</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INVENTORY.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono font-bold">{item.skuId}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.color}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.reserved ?? 0}</TableCell>
                  <TableCell
                    className={cn(getAvailableQty(item) < 20 && 'font-bold text-amber-600')}
                  >
                    {getAvailableQty(item)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px]">
                      {item.location}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getLogisticsLinks()} className="mt-6" />
    </CabinetPageContent>
  );
}
