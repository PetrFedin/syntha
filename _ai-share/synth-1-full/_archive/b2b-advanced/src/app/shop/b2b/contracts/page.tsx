'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
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
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import Image from 'next/image';
import { GlobalTradeAi } from '@/components/distributor/global-trade-ai';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';

const mockContracts = [
  {
    id: 'contr_123',
    brand: 'Syntha Lab',
    brandLogo: 'https://picsum.photos/seed/syntha-lab/40/40',
    type: 'Договор поставки',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
  },
  {
    id: 'contr_124',
    brand: 'Nordic Wool',
    brandLogo: 'https://picsum.photos/seed/nordic-wool/40/40',
    type: 'Договор на предзаказ',
    status: 'pending',
    startDate: '2024-08-01',
    endDate: '2024-10-31',
  },
  {
    id: 'contr_125',
    brand: 'Syntha Lab',
    brandLogo: 'https://picsum.photos/seed/syntha-lab/40/40',
    type: 'Договор поставки',
    status: 'expired',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  },
];

const statusConfig = {
  active: { label: 'Активен', icon: CheckCircle, color: 'text-green-600' },
  pending: { label: 'На согласовании', icon: Clock, color: 'text-amber-600' },
  expired: { label: 'Истек', icon: XCircle, color: 'text-red-600' },
};

export default function ContractsPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Юридические документы с брендами; связь с документами, финансами и заказами." />
      <ShopAnalyticsSegmentErpStrip />

      <GlobalTradeAi />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Контракты</CardTitle>
            <CardDescription>
              Управление юридическими документами с брендами-партнерами.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Создать новый контракт
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер / ID</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Тип документа</TableHead>
                <TableHead>Срок действия</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContracts.map((contract) => {
                const statusInfo = statusConfig[contract.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono">
                      <Link href={ROUTES.shop.b2bContract(contract.id)} className="hover:underline">
                        {contract.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={contract.brandLogo}
                          alt={contract.brand}
                          width={24}
                          height={24}
                          className="rounded-full border"
                        />
                        <Link
                          href={`${ROUTES.shop.b2bPartners}/${contract.brand.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')}`}
                          className="font-medium hover:underline"
                        >
                          {contract.brand}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>
                      {new Date(contract.startDate).toLocaleDateString('ru-RU')} -{' '}
                      {new Date(contract.endDate).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-current/30 flex w-fit items-center gap-1.5 ${statusInfo.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={ROUTES.shop.b2bContract(contract.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Просмотреть
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-contracts-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analyticsFootfall} data-testid="shop-b2b-contracts-footfall-link">
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
            l.href === ROUTES.shop.b2bDocuments ||
            l.href === ROUTES.shop.b2bPayment ||
            l.href === ROUTES.shop.b2bOrders
        )}
        className="mt-2"
      />
    </CabinetPageContent>
  );
}
