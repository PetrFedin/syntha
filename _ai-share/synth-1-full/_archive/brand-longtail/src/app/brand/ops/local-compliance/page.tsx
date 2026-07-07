'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  UserCheck,
  ShieldCheck,
  History,
  ExternalLink,
  Download,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { getRecentEdoDocuments } from '@/lib/fashion/edo-status';
import { Button } from '@/components/ui/button';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function LocalCompliancePage() {
  const docs = getRecentEdoDocuments();

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 p-8 pb-24">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-text-primary text-3xl font-bold tracking-tight">
            Compliance & EDO (RF)
          </h1>
        </div>
        <p className="text-muted-foreground">
          Управление электронным документооборотом (Диадок/Сбис), маркировкой "Честный ЗНАК" и
          юридическим комплаенсом.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* EDO Section */}
        <Card className="border-2 border-emerald-50 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              <h3 className="text-text-primary text-[14px] text-lg font-bold uppercase">
                Электронный документооборот
              </h3>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-[10px] font-bold uppercase text-emerald-700"
            >
              Active Connection
            </Badge>
          </div>

          <div className="mb-6 space-y-4">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-bg-surface2 group flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-emerald-200"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-text-muted text-[10px] font-black uppercase leading-none">
                      {doc.id}
                    </span>
                    <Badge variant="outline" className="h-3.5 bg-white text-[8px] uppercase">
                      {doc.type}
                    </Badge>
                  </div>
                  <div className="text-text-primary truncate text-xs font-bold">
                    {doc.counterparty}
                  </div>
                  <div className="text-text-secondary text-[10px] font-semibold">
                    {doc.totalAmount.toLocaleString()} ₽
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge className={doc.status === 'signed' ? 'bg-green-500' : 'bg-orange-500'}>
                    {doc.status.toUpperCase()}
                  </Badge>
                  {doc.signedAt && (
                    <span className="text-text-muted text-[9px] font-bold">{doc.signedAt}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button className="h-10 w-full bg-emerald-600 text-[11px] font-bold uppercase text-white shadow-sm hover:bg-emerald-700">
            <ExternalLink className="mr-2 h-4 w-4" /> Перейти в Диадок
          </Button>
        </Card>

        {/* Honest Mark Batch Section */}
        <Card className="border-2 border-blue-50 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-text-primary text-[14px] text-lg font-bold uppercase">
                Маркировка (Баланс КМ)
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-500">
              CRPT Sync: OK
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-center">
              <div className="mb-2 text-2xl font-black leading-none text-blue-800">1,240</div>
              <div className="text-[10px] font-black uppercase text-blue-400">Остатки КМ</div>
            </div>
            <div className="bg-bg-surface2 border-border-default rounded-lg border p-4 text-center">
              <div className="text-text-primary mb-2 text-2xl font-black leading-none">14</div>
              <div className="text-text-muted text-[10px] font-black uppercase">В работе</div>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <div className="mb-1 text-[10px] font-black uppercase leading-none text-amber-700">
                  Ожидание маркировки
                </div>
                <div className="text-[11px] font-medium text-amber-600">
                  Обнаружено 5 SKU без GTIN для категории "Трикотаж". Требуется ручной ввод.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-9 text-[10px] font-bold uppercase">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Скачать Коды
            </Button>
            <Button variant="outline" className="h-9 text-[10px] font-bold uppercase">
              <History className="mr-1.5 h-3.5 w-3.5" /> История КМ
            </Button>
          </div>
        </Card>
      </div>

      <div className="bg-bg-surface2 border-border-default mt-8 flex items-center gap-4 rounded-lg border p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 shadow-md">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-text-muted mb-1 text-[11px] font-black uppercase leading-none">
            Инфраструктурный модуль (РФ)
          </div>
          <div className="text-text-primary text-sm font-bold leading-tight tracking-tight">
            Система автоматически сопоставляет входящие УПД с остатками Честного ЗНАКа и обновляет
            статусы на PDP.
          </div>
        </div>
      </div>
    </CabinetPageContent>
  );
}
