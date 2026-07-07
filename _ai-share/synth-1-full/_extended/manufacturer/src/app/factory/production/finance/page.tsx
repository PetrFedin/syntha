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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  FileText,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const transactions = [
  {
    id: 'tr1',
    date: '2024-08-01',
    amount: 1250000,
    type: 'income',
    label: 'Оплата PO-001 (Syntha Lab)',
    status: 'Завершено',
  },
  {
    id: 'tr2',
    date: '2024-08-03',
    amount: 450000,
    type: 'expense',
    label: 'Закупка сырья (Italian Yarns)',
    status: 'Завершено',
  },
  {
    id: 'tr3',
    date: '2024-08-05',
    amount: 800000,
    type: 'income',
    label: 'Предоплата PO-002 (Nordic Wool)',
    status: 'В обработке',
  },
];

export default function FactoryFinancePage() {
  const searchParams = useSearchParams();
  const activeRole = (searchParams.get('role') as 'manufacturer' | 'supplier') || 'manufacturer';

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-headline text-base font-black uppercase tracking-tighter">
          Финансовая аналитика
        </h1>
        <p className="text-muted-foreground">Учет доходов, расходов и дебиторской задолженности.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                Выручка (тек. месяц)
              </p>
              <h4 className="text-text-primary text-sm font-black tracking-tighter">2,050,000 ₽</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                Расходы (тек. месяц)
              </p>
              <h4 className="text-text-primary text-sm font-black tracking-tighter">450,000 ₽</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-accent-primary/10 text-accent-primary flex h-12 w-12 items-center justify-center rounded-2xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                Ожидаемые выплаты
              </p>
              <h4 className="text-text-primary text-sm font-black tracking-tighter">1,200,000 ₽</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-subtle overflow-hidden rounded-xl shadow-sm">
        <CardHeader className="bg-bg-surface2/80 border-border-subtle flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-tight">
              История транзакций
            </CardTitle>
            <CardDescription className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
              Последние финансовые операции
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border-default rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <Download className="mr-2 h-3.5 w-3.5" /> Экспорт (CSV)
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-bg-surface2/30 hover:bg-bg-surface2/30">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">
                  Назначение
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Дата
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Сумма
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Статус
                </TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest">
                  Документы
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tr) => (
                <TableRow key={tr.id} className="hover:bg-bg-surface2 transition-colors">
                  <TableCell className="py-4 pl-8">
                    <p className="text-text-primary text-xs font-black uppercase tracking-tighter">
                      {tr.label}
                    </p>
                  </TableCell>
                  <TableCell className="text-text-secondary text-[11px] font-bold uppercase tracking-widest">
                    {tr.date}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {tr.type === 'income' ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-rose-500" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-black',
                          tr.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        )}
                      >
                        {tr.type === 'income' ? '+' : '-'}
                        {tr.amount.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                        tr.status === 'Завершено'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-accent-primary/10 text-accent-primary'
                      )}
                    >
                      {tr.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-muted hover:text-accent-primary h-8 w-8"
                    >
                      <FileText className="h-4 w-4" />
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
