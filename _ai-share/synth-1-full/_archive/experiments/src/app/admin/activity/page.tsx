'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Eye, ShoppingCart, Heart, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

function subDays(date: Date, amount: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - amount);
  return newDate;
}

function subHours(date: Date, amount: number) {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() - amount);
  return newDate;
}

const mockActivity = [
  {
    id: 1,
    user: 'Бренд Syntha',
    role: 'brand',
    avatar: 'https://picsum.photos/seed/syntha-logo/40/40',
    action: 'Запуск тендера',
    target: 'Верхняя одежда FW26',
    type: 'order',
    date: new Date().toISOString(),
  },
  {
    id: 2,
    user: 'Фабрика ModaTech',
    role: 'manufacturer',
    avatar: 'https://picsum.photos/seed/factory1/40/40',
    action: 'Подтверждение заказа',
    target: 'Партия #B2B-0012',
    type: 'product',
    date: subHours(new Date(), 1).toISOString(),
  },
  {
    id: 3,
    user: 'Магазин Podium',
    role: 'shop',
    avatar: 'https://picsum.photos/seed/podium-logo/40/40',
    action: 'Оплата счета',
    target: 'Инвойс #INV-124',
    type: 'cart',
    date: subHours(new Date(), 2).toISOString(),
  },
  {
    id: 4,
    user: 'Дистрибьютор Hub-Central',
    role: 'distributor',
    avatar: 'https://picsum.photos/seed/dist1/40/40',
    action: 'Обновление остатков',
    target: 'Склад Казахстан',
    type: 'view',
    date: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 5,
    user: 'Поставщик SilkRoad',
    role: 'supplier',
    avatar: 'https://picsum.photos/seed/supp1/40/40',
    action: 'Новое поступление',
    target: 'Шелк натуральный (белый)',
    type: 'product',
    date: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 6,
    user: 'Алексей Иванов',
    role: 'client',
    avatar: 'https://picsum.photos/seed/user1/40/40',
    action: 'Покупка (B2C)',
    target: 'Шерстяное пальто',
    type: 'cart',
    date: subHours(new Date(), 4).toISOString(),
  },
];

const roleConfig = {
  brand: { label: 'Бренд', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  manufacturer: { label: 'Производство', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  supplier: { label: 'Поставщик', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  distributor: { label: 'Дистрибьютор', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  shop: { label: 'Магазин', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  client: { label: 'Клиент', color: 'bg-bg-surface2 text-text-secondary border-border-subtle' },
};

const actionConfig = {
  cart: { icon: ShoppingCart, color: 'text-green-500' },
  product: { icon: Eye, color: 'text-blue-500' },
  order: { icon: ShoppingCart, color: 'text-orange-500' },
  review: { icon: MessageSquare, color: 'text-accent-primary' },
  view: { icon: Eye, color: 'text-gray-500' },
  wishlist: { icon: Heart, color: 'text-red-500' },
};

export default function ActivityLogPage() {
  return (
    <CabinetPageContent maxWidth="full" className="space-y-4">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-headline text-base font-black uppercase tracking-tighter">
            Глобальная лента событий
          </h1>
          <p className="border-accent-primary border-l-2 pl-4 text-sm font-medium italic text-muted-foreground">
            "Мониторинг кросс-функционального взаимодействия всех участников платформы в реальном
            времени."
          </p>
        </div>
      </header>

      <Card className="border-border-subtle shadow-md/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-tight">
            Журнал транзакций и действий
          </CardTitle>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <CardDescription className="text-xs font-medium">
              Полный аудит активности: от B2C покупок до B2B тендеров.
            </CardDescription>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по всей платформе..."
                className="h-9 pl-8 text-xs font-bold uppercase tracking-wider"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Участник / Роль
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Действие
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Объект системы
                </TableHead>
                <TableHead className="text-text-muted text-right text-[9px] font-black uppercase tracking-widest">
                  Таймштамп
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockActivity.map((activity) => {
                const config = actionConfig[activity.type as keyof typeof actionConfig] || {
                  icon: Eye,
                  color: 'text-gray-500',
                };
                const role = roleConfig[activity.role as keyof typeof roleConfig];
                return (
                  <TableRow
                    key={activity.id}
                    className="border-border-subtle group/row hover:bg-bg-surface2/80"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="border-border-subtle h-8 w-8 border transition-transform group-hover/row:scale-110">
                          <AvatarImage src={activity.avatar} alt={activity.user} />
                          <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-text-primary mb-1 text-xs font-black uppercase leading-none tracking-tight">
                            {activity.user}
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'border-border-subtle rounded border bg-white p-1 shadow-sm',
                            config.color
                          )}
                        >
                          <config.icon className="h-3 w-3" />
                        </div>
                        <span className="text-text-secondary text-[11px] font-bold uppercase tracking-tight">
                          {activity.action}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-text-muted text-[11px] font-medium italic">
                        "{activity.target}"
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-text-primary mb-0.5 text-[10px] font-black leading-none">
                          {format(new Date(activity.date), 'HH:mm', { locale: ru })}
                        </span>
                        <span className="text-text-muted text-[8px] font-bold uppercase tracking-widest">
                          {format(new Date(activity.date), 'dd MMM yyyy', { locale: ru })}
                        </span>
                      </div>
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
