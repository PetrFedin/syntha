'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Download, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

const mockDocuments = [
  {
    id: 'doc1',
    name: 'Инвойс #INV-0012-1.pdf',
    brand: 'Syntha Lab',
    type: 'Финансовый',
    date: '2024-07-29',
    status: 'Ожидает оплаты',
  },
  {
    id: 'doc3',
    name: 'Сертификат на кашемир.pdf',
    brand: 'Syntha Lab',
    type: 'Сертификат',
    date: '2024-07-20',
    status: 'Актуален',
  },
  {
    id: 'doc4',
    name: 'Акт сверки Q2 2024.xlsx',
    brand: 'Nordic Wool',
    type: 'Финансовый',
    date: '2024-07-15',
    status: 'Согласован',
  },
];

const statusConfig: Record<string, string> = {
  'Ожидает оплаты': 'secondary',
  Подписан: 'default',
  Актуален: 'default',
  Согласован: 'default',
  Архивный: 'outline',
};

export default function DocumentsPage() {
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const brands = [...new Set(mockDocuments.map((d) => d.brand))];
  const types = [...new Set(mockDocuments.map((d) => d.type))];

  const filteredDocuments = mockDocuments.filter(
    (doc) =>
      (filterBrand === 'all' || doc.brand === filterBrand) &&
      (filterType === 'all' || doc.type === filterType)
  );

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Счета, сертификаты и акты в одном месте; связь с финансами и контрактами." />
      <ShopAnalyticsSegmentErpStrip />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Документы</CardTitle>
            <CardDescription>
              Все ваши счета, сертификаты и другие файлы в одном месте.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск по названию..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Загрузить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Все бренды" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все бренды</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название документа</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.brand}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        (statusConfig[doc.status] ?? 'outline') as
                          | 'default'
                          | 'secondary'
                          | 'outline'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Скачать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-documents-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analyticsFootfall} data-testid="shop-b2b-documents-footfall-link">
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>

      <RelatedModulesBlock
        title="Связанные разделы"
        links={getShopB2BHubLinks().filter(
          (l) =>
            l.href === ROUTES.shop.b2bFinance ||
            l.href === ROUTES.shop.b2bPayment ||
            l.href === ROUTES.shop.b2bContracts ||
            l.href === ROUTES.shop.b2bOrders
        )}
        className="mt-2"
      />
    </CabinetPageContent>
  );
}
