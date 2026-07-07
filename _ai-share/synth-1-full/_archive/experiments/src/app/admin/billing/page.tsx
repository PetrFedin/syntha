'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const billingHistory = [
  {
    id: 'inv_124',
    member: 'Демо-магазин · Москва 1',
    role: 'shop',
    amount: '150 000 ₽',
    date: '2026-02-05',
    status: 'Оплачен',
    type: 'subscription',
  },
  {
    id: 'inv_123',
    member: 'Бренд Syntha',
    role: 'brand',
    amount: '425 000 ₽',
    date: '2026-02-04',
    status: 'Оплачен',
    type: 'commission',
  },
  {
    id: 'inv_122',
    member: 'Дистрибьютор Hub-Central',
    role: 'distributor',
    amount: '85 000 ₽',
    date: '2026-02-03',
    status: 'В ожидании',
    type: 'promo',
  },
  {
    id: 'inv_121',
    member: 'Фабрика ModaTech',
    role: 'manufacturer',
    amount: '12 500 ₽',
    date: '2026-02-01',
    status: 'Оплачен',
    type: 'subscription',
  },
  {
    id: 'inv_120',
    member: 'Бренд Nordic Wool',
    role: 'brand',
    amount: '35 000 ₽',
    date: '2026-01-30',
    status: 'Оплачен',
    type: 'ads',
  },
];

const roleConfig = {
  brand: { label: 'Бренд', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  manufacturer: { label: 'Производство', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  supplier: { label: 'Поставщик', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  distributor: { label: 'Дистрибьютор', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  shop: { label: 'Магазин', color: 'bg-rose-50 text-rose-600 border-rose-100' },
};

export default function BillingPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Оплачен':
        return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case 'В ожидании':
        return <Clock className="h-3 w-3 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <CabinetPageContent maxWidth="full" className="space-y-4">
      <header className="border-b pb-4">
        <h1 className="font-headline text-base font-black uppercase tracking-tighter">
          Финансовый клиринг OS
        </h1>
        <p className="font-medium text-muted-foreground">
          Контроль взаиморасчетов, комиссий и подписок всей экосистемы.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="border-border-subtle shadow-md/20 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-[10px] font-black uppercase">
              GMV Экосистемы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-text-primary text-sm font-black tracking-tight">84.4 млн ₽</div>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <span className="text-emerald-500">▲</span> +12% к прошлому месяцу
            </p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle shadow-md/20 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-[10px] font-black uppercase">
              Комиссионный доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-accent-primary text-sm font-black tracking-tight">4.2 млн ₽</div>
            <p className="text-text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
              Чистая прибыль OS
            </p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle shadow-md/20 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-text-muted text-[10px] font-black uppercase">
              Подписки (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-text-primary text-sm font-black tracking-tight">1.8 млн ₽</div>
            <p className="text-text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
              1,240 активных брендов
            </p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle shadow-md/20 border-rose-100 bg-rose-50 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-rose-400">
              Дебиторская задолж.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-black tracking-tight text-rose-600">350 000 ₽</div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
              12 просроченных счетов
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-subtle shadow-md/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-tight">
            Реестр глобальных транзакций
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  ID / Дата
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Участник / Роль
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Тип платежа
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Сумма
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Статус
                </TableHead>
                <TableHead className="text-text-muted text-right text-[9px] font-black uppercase tracking-widest">
                  Действие
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => {
                const role = roleConfig[item.role as keyof typeof roleConfig] || {
                  label: 'Система',
                  color: 'bg-bg-surface2',
                };
                return (
                  <TableRow
                    key={item.id}
                    className="border-border-subtle group/row hover:bg-bg-surface2/80"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-text-primary font-mono text-[10px] font-bold">
                          {item.id}
                        </span>
                        <span className="text-text-muted text-[9px] font-medium">
                          {format(new Date(item.date), 'dd.MM.yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-text-primary mb-1 text-[11px] font-black uppercase leading-none tracking-tight">
                          {item.member}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'flex h-3.5 w-fit items-center justify-center px-1 py-0 text-[7px] font-black uppercase',
                            role.color
                          )}
                        >
                          {role.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                        {item.type === 'subscription'
                          ? 'Подписка'
                          : item.type === 'commission'
                            ? 'Комиссия B2B'
                            : item.type === 'promo'
                              ? 'Продвижение'
                              : 'Реклама'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-text-primary text-xs font-black tracking-tight">
                        {item.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex w-fit items-center gap-1 border-none px-2 py-0.5 text-[8px] font-black uppercase',
                          item.status === 'Оплачен'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {getStatusVariant(item.status)}
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-bg-surface2 h-7 w-7 rounded-lg p-0 transition-colors"
                      >
                        <FileText className="text-text-muted h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
