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
            <Warehouse className="h-5 w-5 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
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
            className="rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest"
          >
            <History className="mr-2 h-3.5 w-3.5" /> История движений
          </Button>
          <Button className="rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white">
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
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Товаров в наличии
              </p>
              <h4 className="text-sm font-black tracking-tighter text-slate-900">128 SKU</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Критический остаток
              </p>
              <h4 className="text-sm font-black tracking-tighter text-slate-900">12 позиций</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-xl border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск по складу..."
                className="h-11 rounded-xl border-slate-200 bg-white pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
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
                <TableRow key={item.id} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="py-6 pl-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        ID: {item.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-black text-slate-900">{item.stock}</TableCell>
                  <TableCell className="text-xs font-bold uppercase tracking-widest text-slate-400">
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
                      className="h-8 rounded-lg border-slate-200 text-[8px] font-black uppercase"
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
