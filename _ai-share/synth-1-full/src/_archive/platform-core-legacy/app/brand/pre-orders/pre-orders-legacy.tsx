'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MessageSquare, Check, Clock, Package, Factory } from 'lucide-react';
import Image from 'next/image';
import { products } from '@/lib/products';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { ROUTES } from '@/lib/routes';

const preOrdersData = [
  {
    id: 'po_001',
    product: products.find((p) => p.id === '9'),
    customer: { name: 'Елена Васильева', avatar: 'https://picsum.photos/seed/po_user1/40/40' },
    date: '2024-07-28',
    source: 'Live-трансляция "Презентация SS25"',
    status: 'new',
  },
  {
    id: 'po_002',
    product: products.find((p) => p.id === '4'),
    customer: { name: 'Иван Петров', avatar: 'https://picsum.photos/seed/po_user2/40/40' },
    date: '2024-07-27',
    source: 'Карточка товара',
    status: 'in_progress',
  },
  {
    id: 'po_003',
    product: products.find((p) => p.id === '1'),
    customer: { name: 'Анна Михайлова', avatar: 'https://picsum.photos/seed/po_user3/40/40' },
    date: '2024-07-26',
    source: 'AI-стилист',
    status: 'completed',
  },
];

const statusConfig = {
  new: { label: 'Новый', color: 'bg-blue-500' },
  in_progress: { label: 'В работе', color: 'bg-yellow-500' },
  completed: { label: 'Завершен', color: 'bg-green-500' },
};

export function BrandPreOrdersLegacyPage() {
  const [filterCollection, setFilterCollection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const collections = [
    ...new Set(
      preOrdersData
        .map((po) => po.product?.season)
        .filter((s): s is string => typeof s === 'string' && s.length > 0)
    ),
  ];

  const filteredOrders = preOrdersData.filter((order) => {
    const collectionMatch =
      filterCollection === 'all' || order.product?.season === filterCollection;
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    return collectionMatch && statusMatch;
  });

  return (
    <div className="space-y-4 p-4">
      <SectionInfoCard
        title="Предзаказы (Pre-orders)"
        description="Запросы на предзаказ от B2C клиентов. Связь с Production (объёмы под пошив), B2B заказами и Live-трансляциями."
        icon={Package}
        iconBg="bg-accent-primary/15"
        iconColor="text-accent-primary"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              B2C → Production
            </Badge>
            <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.b2bOrders}>Заказы</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.production}>Production</Link>
            </Button>
          </>
        }
      />
      <header>
        <h1 className="font-headline text-base font-bold">Предзаказы</h1>
        <p className="text-muted-foreground">
          Управляйте запросами на предзаказ от клиентов и связывайтесь с ними для оформления
          покупки.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <CardTitle>Список запросов</CardTitle>
            <div className="flex gap-2">
              <Select value={filterCollection} onValueChange={setFilterCollection}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Все коллекции" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все коллекции</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Дата запроса</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={order.product?.images[0].url || ''}
                        alt={order.product?.name || ''}
                        width={40}
                        height={50}
                        className="rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{order.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.product?.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={order.customer.avatar} />
                        <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{order.customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                    {order.source}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex w-fit items-center gap-1.5">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          statusConfig[order.status as keyof typeof statusConfig].color
                        )}
                      ></span>
                      {statusConfig[order.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Начать чат
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
