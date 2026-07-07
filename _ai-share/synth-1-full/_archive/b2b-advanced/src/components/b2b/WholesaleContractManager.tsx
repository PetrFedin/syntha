'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  ShieldCheck,
  PenTool,
  Lock,
  Clock,
  ArrowRight,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

export function WholesaleContractManager({ orderId = '#8821' }) {
  const [step, setStep] = useState<'review' | 'signing' | 'completed'>('review');
  const [isSigned, setIsSigned] = useState(false);

  const contractDetails = {
    title: 'Генеральное соглашение об оптовых закупках',
    version: 'v2026.02',
    parties: {
      brand: 'Syntha Lab HQ',
      retailer: 'Premium Store Moscow',
    },
    clauses: [
      {
        id: 1,
        title: 'Предмет договора',
        content:
          'Покупатель соглашается приобрести количество товара, указанное в матрице заказа #8821.',
      },
      {
        id: 2,
        title: 'Условия оплаты',
        content:
          'Оплата производится с отсрочкой 30 календарных дней с даты выставления счета, в рублях РФ.',
      },
      {
        id: 3,
        title: 'Инкотермс',
        content:
          'Поставка осуществляется на условиях DAP (Поставка в месте назначения) согласно Инкотермс 2020.',
      },
      {
        id: 4,
        title: 'Интеллектуальная собственность',
        content:
          'Ритейлеру предоставляется ограниченная лицензия на использование активов бренда для маркетинга.',
      },
    ],
  };

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
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
              LEGAL_SIGN_v3.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Договор купли-
            <br />
            продажи
          </h2>
          <p className="max-w-md text-left text-xs font-medium text-slate-400">
            Юридически значимая цифровая подпись для оптовых заказов. Все контракты фиксируются в
            приватном блокчейне для обеспечения неизменности условий.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Download className="h-4 w-4" /> Скачать PDF
          </Button>
          {step === 'review' && (
            <Button
              onClick={() => setStep('signing')}
              className="h-10 gap-2 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200"
            >
              Начать подписание <PenTool className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Document Viewer */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-2xl shadow-slate-200/50">
            <div className="space-y-10 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                    {contractDetails.title}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Document Hash: 0x4f...8921
                  </p>
                </div>
                <Badge className="border-none bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                  {step === 'completed' ? 'EXECUTED' : 'PENDING SIGNATURE'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 border-y border-slate-50 py-4">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Продавец (Бренд)
                  </p>
                  <p className="text-sm font-black uppercase text-slate-900">
                    {contractDetails.parties.brand}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">ИНН: 7701234567</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Покупатель (Ритейлер)
                  </p>
                  <p className="text-sm font-black uppercase text-slate-900">
                    {contractDetails.parties.retailer}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">ИНН: 7709876543</p>
                </div>
              </div>

              <div className="space-y-4">
                {contractDetails.clauses.map((clause) => (
                  <div key={clause.id} className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
                      {clause.id}. {clause.title}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-slate-600">
                      {clause.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between pt-10">
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Подписи сторон
                  </p>
                  <div className="flex gap-3">
                    <div className="space-y-3">
                      <div className="flex h-12 w-48 items-center justify-center border-b-2 border-slate-100 font-sans text-base italic text-slate-300">
                        / Syntha Lab Admin /
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Уполномоченное лицо
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="relative flex h-12 w-48 items-center justify-center border-b-2 border-slate-100">
                        {step === 'completed' ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-sans text-sm italic text-indigo-600"
                          >
                            Premium Store HQ
                          </motion.div>
                        ) : (
                          <span className="text-[9px] font-black uppercase italic tracking-widest text-slate-200">
                            Требуется подпись
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Представитель ритейлера
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Signing Controls */}
        <div className="space-y-4 lg:col-span-4">
          <AnimatePresence mode="wait">
            {step === 'signing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="relative space-y-4 overflow-hidden rounded-xl border-none bg-indigo-600 p-4 text-white shadow-2xl shadow-indigo-200/50">
                  <div className="absolute right-0 top-0 p-4 opacity-10">
                    <PenTool className="h-32 w-32" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-base font-black uppercase tracking-tight">Цифровой сейф</h3>
                    <div className="space-y-4">
                      <p className="text-[10px] font-medium uppercase leading-relaxed text-white/70">
                        Введите ваш профессиональный токен идентификации для подтверждения
                        контракта. Это действие необратимо.
                      </p>
                      <div className="space-y-2">
                        <Input
                          placeholder="AUTH_TOKEN_…"
                          className="h-10 rounded-xl border-white/20 bg-white/10 font-black tracking-widest text-white placeholder:text-white/30"
                        />
                      </div>
                      <Button
                        onClick={() => setStep('completed')}
                        className="h-10 w-full rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-2xl"
                      >
                        Подтвердить и подписать
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 'completed' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="space-y-6 rounded-xl border-none bg-emerald-500 p-4 text-white shadow-2xl shadow-emerald-200/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black uppercase tracking-tight">
                      Контракт защищен
                    </h3>
                    <p className="text-[10px] font-medium uppercase leading-relaxed text-white/80">
                      Соглашение по заказу #8821 подписано обеими сторонами и верифицировано через
                      протокол Syntha.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="h-12 flex-1 rounded-xl border-white/20 bg-white/10 text-[9px] font-black uppercase tracking-widest text-white"
                    >
                      Просмотр в Explorer
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 flex-1 rounded-xl border-white/20 bg-white/10 text-[9px] font-black uppercase tracking-widest text-white"
                    >
                      Лог аудита
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 'review' && (
              <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                    <Eye className="h-5 w-5 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                    Статус проверки
                  </h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-[9px] font-medium leading-relaxed text-amber-900">
                      Пожалуйста, просмотрите все пункты перед подписанием. Изменения в логистике
                      после подписания потребуют внесения поправок в контракт.
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Последний просмотр: 2 мин назад</span>
                    </div>
                    <span>Вер: 2.1</span>
                  </div>
                </div>
              </Card>
            )}
          </AnimatePresence>

          <Card className="relative space-y-6 overflow-hidden rounded-xl border-none bg-slate-900 p-4 text-white shadow-xl shadow-slate-200/50">
            <div className="absolute right-0 top-0 p-4 opacity-5">
              <Lock className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <h4 className="text-sm font-black uppercase tracking-tight">Security Anchor</h4>
              <p className="text-[9px] font-medium uppercase leading-relaxed text-white/50">
                Multi-party computation (MPC) protocol ensures that contract secrets remain private
                while verifying the validity of the signatures.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">
                  Node Cluster: Secured
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
