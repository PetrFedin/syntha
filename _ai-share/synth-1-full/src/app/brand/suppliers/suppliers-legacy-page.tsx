'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, PlusCircle, MoreHorizontal } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getSupplierLinks } from '@/lib/data/entity-links';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';
import { ROUTES } from '@/lib/routes';

const SupplierRfqContent = dynamic(() => import('@/app/brand/suppliers/rfq/page'), { ssr: false });
const SourcingLiveContent = dynamic(
  () => import('@/app/brand/suppliers/live/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);

const mockSuppliers = [
  {
    id: 'S01',
    name: 'Global Textiles Ltd',
    type: 'Ткани',
    rating: 4.8,
    status: 'active',
    orders: 24,
    lastOrder: '2026-03-01',
    materials: 12,
  },
  {
    id: 'S02',
    name: 'YKK Russia',
    type: 'Фурнитура',
    rating: 4.9,
    status: 'active',
    orders: 156,
    lastOrder: '2026-03-10',
    materials: 8,
  },
  {
    id: 'S03',
    name: 'Smart Tailor Lab',
    type: 'Цех (CMT)',
    rating: 4.5,
    status: 'warning',
    orders: 5,
    lastOrder: '2026-02-28',
    materials: 0,
  },
  {
    id: 'S04',
    name: 'Italian Yarns',
    type: 'Ткани',
    rating: 4.7,
    status: 'active',
    orders: 18,
    lastOrder: '2026-03-05',
    materials: 6,
  },
  {
    id: 'S05',
    name: 'EcoFabrics Co',
    type: 'Ткани',
    rating: 4.6,
    status: 'active',
    orders: 9,
    lastOrder: '2026-02-20',
    materials: 4,
  },
];

export default function BrandSuppliersLegacyPage() {
  const [tab, setTab] = useState('registry');

  return (
    <CabinetPageContent maxWidth="full" className="space-y-6 pb-16">
      <RegistryPageHeader
        title="Поставщики"
        leadPlain="Реестр поставщиков, RFQ и live-сорсинг (демо-данные вне Platform Core)."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="registry">Реестр</TabsTrigger>
          <TabsTrigger value="rfq">RFQ</TabsTrigger>
          <TabsTrigger value="sourcing-live">LIVE сорсинг</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Реестр поставщиков</CardTitle>
                <CardDescription>Демо-каталог для закупок и сорсинга.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input placeholder="Поиск…" className="pl-8" />
                </div>
                <Button>
                  <PlusCircle className="mr-2 size-4" />
                  Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Поставщик</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Заказы</TableHead>
                    <TableHead>Материалы</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSuppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`${ROUTES.brand.suppliers}/${s.id}`}
                          className="hover:underline"
                        >
                          {s.name}
                        </Link>
                      </TableCell>
                      <TableCell>{s.type}</TableCell>
                      <TableCell>{s.rating}</TableCell>
                      <TableCell>{s.orders}</TableCell>
                      <TableCell>{s.materials}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'warning' ? 'destructive' : 'secondary'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`${ROUTES.brand.suppliers}/${s.id}`}>
                                Карточка поставщика
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfq" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'rfq' ? <SupplierRfqContent /> : null}
        </TabsContent>

        <TabsContent
          value="sourcing-live"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          {tab === 'sourcing-live' ? <SourcingLiveContent /> : null}
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock title="Связанные модули" links={getSupplierLinks()} />
    </CabinetPageContent>
  );
}
