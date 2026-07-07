'use client';

import { useSearchParams } from 'next/navigation';
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
import { Warehouse, Search, MoveRight, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

const inventory = [
  {
    id: 'i1',
    name: 'Кашемир (Black)',
    stock: '120м',
    reserved: '45м',
    available: '75м',
    health: 'Normal',
  },
  {
    id: 'i2',
    name: 'Молнии YKK #5',
    stock: '2500 шт',
    reserved: '800 шт',
    available: '1700 шт',
    health: 'Normal',
  },
  {
    id: 'i3',
    name: 'Шелк (Natural)',
    stock: '40м',
    reserved: '35м',
    available: '5м',
    health: 'Critical',
  },
];

export default function SupplierInventoryPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Warehouse className="text-accent-primary h-5 w-5" />
            <span className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
              Global Warehouse Sync
            </span>
          </div>
          <h1 className="font-headline text-base font-black uppercase tracking-tighter">
            Складские остатки
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Контроль наличия, резервов и автоматизация пополнения.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border-default rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <History className="mr-2 h-3.5 w-3.5" /> История движений
          </Button>
          <Button className="bg-text-primary rounded-xl text-[10px] font-black uppercase tracking-widest text-white">
            <MoveRight className="mr-2 h-3.5 w-3.5" /> Перемещение
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                Товаров в наличии
              </p>
              <h4 className="text-text-primary text-sm font-black tracking-tighter">128 SKU</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                Критический остаток
              </p>
              <h4 className="text-text-primary text-sm font-black tracking-tighter">12 позиций</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-subtle overflow-hidden rounded-xl shadow-sm">
        <CardHeader className="bg-bg-surface2/80 border-border-subtle border-b p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="relative w-full max-w-md">
              <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Поиск по складу..."
                className="border-border-default h-11 rounded-xl bg-white pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-bg-surface2/30 hover:bg-bg-surface2/30">
                <TableHead className="py-4 pl-8 text-[10px] font-black uppercase tracking-widest">
                  Позиция
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Общий запас
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  В резерве
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Доступно
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Статус
                </TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest">
                  Действие
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-bg-surface2 group transition-colors">
                  <TableCell className="py-6 pl-8">
                    <div>
                      <p className="text-text-primary text-xs font-black uppercase tracking-tighter">
                        {item.name}
                      </p>
                      <p className="text-text-muted text-[9px] font-bold uppercase tracking-widest">
                        ID: {item.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-primary text-xs font-black">
                    {item.stock}
                  </TableCell>
                  <TableCell className="text-text-muted text-xs font-bold uppercase tracking-widest">
                    {item.reserved}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'text-xs font-black',
                        item.health === 'Critical' ? 'text-rose-600' : 'text-emerald-600'
                      )}
                    >
                      {item.available}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                        item.health === 'Normal'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      )}
                    >
                      {item.health}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border-default h-8 rounded-lg text-[8px] font-black uppercase"
                    >
                      Пополнить
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
