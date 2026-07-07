'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle2,
  FileCheck,
  CreditCard,
  History,
  Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { EscrowTransaction } from '@/lib/types/b2b';
import { cn } from '@/lib/cn';

export function B2BPaymentEscrow() {
  const { viewRole } = useUIState();
  const { b2bEscrowTransactions, addEscrowTransaction } = useB2BState();
  const [selectedTx, setSelectedTx] = useState<EscrowTransaction | null>(null);

  const mockTxs: EscrowTransaction[] = [
    {
      id: 'ESC-9921',
      orderId: 'WH-8241',
      totalAmount: 1250000,
      depositAmount: 250000,
      status: 'held',
      createdAt: '2026-02-05T10:00:00Z',
    },
    {
      id: 'ESC-9922',
      orderId: 'WH-9012',
      totalAmount: 480000,
      depositAmount: 96000,
      status: 'released',
      createdAt: '2026-01-20T14:30:00Z',
    },
  ];

  const transactions = b2bEscrowTransactions.length > 0 ? b2bEscrowTransactions : mockTxs;

  return (
    <div className="bg-bg-surface2 min-h-screen space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-emerald-100 text-[9px] font-black uppercase tracking-widest text-emerald-600"
            >
              Escrow_Protocol_v3.4
            </Badge>
          </div>
          <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
            Финансовый
            <br />
            Гарант
          </h2>
          <p className="text-text-muted max-w-md text-xs font-medium">
            Безопасные B2B-транзакции через смарт-контракт эскроу. Средства удерживаются до
            подтверждения этапов поставки.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-border-default h-12 gap-2 rounded-xl bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <History className="h-4 w-4" /> Журнал аудита
          </Button>
          <Button className="bg-text-primary h-12 gap-2 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-xl">
            Настройки эскроу <Lock className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Transaction List */}
        <div className="space-y-4 lg:col-span-5">
          <h3 className="text-text-muted px-2 text-left text-[10px] font-black uppercase tracking-widest">
            Активные эскроу-контракты
          </h3>
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className={cn(
                'flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-300',
                selectedTx?.id === tx.id
                  ? 'scale-[1.02] border-emerald-200 bg-white shadow-xl shadow-emerald-100'
                  : 'border-border-subtle hover:border-border-default bg-white/50 hover:bg-white'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      tx.status === 'released'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-accent-primary/15 text-accent-primary'
                    )}
                  >
                    {tx.status === 'released' ? (
                      <Unlock className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-text-primary text-xs font-black uppercase">
                      Заказ {tx.orderId}
                    </p>
                    <p className="text-text-muted text-[9px] font-bold uppercase">{tx.id}</p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    'text-[8px] font-black uppercase tracking-widest',
                    tx.status === 'released'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  )}
                >
                  {tx.status === 'released' ? 'Выплачено' : 'Удержано'}
                </Badge>
              </div>

              <div className="border-border-subtle flex items-end justify-between border-t pt-4">
                <div className="space-y-1">
                  <p className="text-text-muted text-[8px] font-black uppercase leading-none tracking-widest">
                    Удержанная сумма
                  </p>
                  <p className="text-text-primary text-sm font-black">
                    {tx.depositAmount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-text-muted text-[8px] font-black uppercase leading-none tracking-widest">
                    Сумма контракта
                  </p>
                  <p className="text-text-secondary text-sm font-bold">
                    {tx.totalAmount.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detailed Status & Controls */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedTx ? (
              <motion.div
                key={selectedTx.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <Card className="relative overflow-hidden rounded-xl border-none bg-white p-3 shadow-2xl shadow-md">
                  <div className="absolute right-0 top-0 p-4 opacity-[0.03]">
                    <ShieldCheck className="h-64 w-64" />
                  </div>

                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                          Жизненный цикл эскроу
                        </p>
                        <h3 className="text-text-primary text-base font-black uppercase tracking-tight">
                          Верификация контракта
                        </h3>
                      </div>
                      <Badge className="bg-text-primary border-none px-4 py-1.5 text-[10px] font-black uppercase text-white">
                        v3.4 Защищено
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-6">
                        <div className="bg-bg-surface2 space-y-4 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <CreditCard className="text-accent-primary h-5 w-5" />
                            <h4 className="text-text-primary text-xs font-black uppercase">
                              Депозит ритейлера
                            </h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-text-primary text-sm font-black">
                              {selectedTx.depositAmount.toLocaleString('ru-RU')} ₽
                            </p>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span className="text-text-muted text-[10px] font-bold uppercase">
                                Подтверждено и удержано
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-bg-surface2 space-y-4 rounded-xl p-4 opacity-50">
                          <div className="flex items-center gap-3">
                            <DollarSign className="text-text-muted h-5 w-5" />
                            <h4 className="text-text-primary text-xs font-black uppercase">
                              Выплата остатка
                            </h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-text-muted text-sm font-black">
                              {(selectedTx.totalAmount - selectedTx.depositAmount).toLocaleString(
                                'ru-RU'
                              )}{' '}
                              ₽
                            </p>
                            <div className="flex items-center gap-2">
                              <Clock className="text-text-muted h-3 w-3" />
                              <span className="text-text-muted text-[10px] font-bold uppercase">
                                Ожидает этапа
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                          <h4 className="text-text-muted ml-2 text-left text-[10px] font-black uppercase tracking-widest">
                            Требуемые действия
                          </h4>
                          <Button className="bg-accent-primary shadow-accent-primary/15 h-10 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                            Подтвердить получение <FileCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="border-border-default h-10 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest"
                          >
                            Открыть спор <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="border-border-subtle flex flex-col items-center justify-center space-y-2 rounded-xl border-2 border-dashed p-4 text-center">
                          <Info className="text-text-muted h-5 w-5" />
                          <p className="text-text-muted text-[10px] font-medium leading-relaxed">
                            Как только доставка будет подтверждена ритейлером, удержанные средства
                            будут переведены бренду в течение 24 часов.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Card className="bg-text-primary space-y-6 rounded-xl border-none p-4 text-white shadow-2xl shadow-md">
                    <h4 className="text-sm font-black uppercase tracking-tight">
                      Движок комплаенса
                    </h4>
                    <p className="text-[11px] font-medium leading-relaxed text-white/60">
                      "Все транзакции автоматически проверяются на соответствие региональным
                      торговым правилам и политике AML."
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                        Комплаенс пройден
                      </span>
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </div>
                  </Card>

                  <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-md">
                    <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
                      Подтверждение средств
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="bg-bg-surface2 border-border-subtle flex h-12 w-12 items-center justify-center rounded-xl border">
                        <CreditCard className="text-text-muted h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-text-primary text-[10px] font-black uppercase">
                          Верифицированный кошелек
                        </p>
                        <p className="text-text-muted text-[8px] font-bold uppercase">
                          Банк: Premium International
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-auto w-full gap-2 p-0 text-[10px] font-black uppercase tracking-widest hover:bg-transparent"
                    >
                      Просмотреть сертификат <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-4 opacity-30">
                <Lock className="text-text-muted h-20 w-20" />
                <p className="text-text-muted text-[11px] font-black uppercase tracking-widest">
                  Выберите контракт для просмотра деталей безопасности
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
