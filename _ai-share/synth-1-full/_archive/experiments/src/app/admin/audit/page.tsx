'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, User, Filter } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const MOCK_LOG = [
  {
    id: '1',
    who: 'admin@synth.ru',
    action: 'order.approved',
    entity: 'ORD-7801',
    at: '11.03.2026 14:32',
  },
  {
    id: '2',
    who: 'brand@synth.ru',
    action: 'product.updated',
    entity: 'P-502',
    at: '11.03.2026 14:28',
  },
  {
    id: '3',
    who: 'shop@demo-retail.local',
    action: 'inventory.adjusted',
    entity: 'SKU-001',
    at: '11.03.2026 14:15',
  },
];

export default function AuditTrailPage() {
  const [userFilter, setUserFilter] = useState('');

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
          <FileText className="text-text-primary h-6 w-6" /> Audit Trail Ledger
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Неизменяемый лог всех значимых действий в системе
        </p>
      </header>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" /> Журнал действий
          </CardTitle>
          <CardDescription>Кто, когда, какое действие, над какой сущностью</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Фильтр по пользователю..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="max-w-xs rounded-lg"
            />
            <Button variant="outline" size="sm" className="rounded-lg">
              Экспорт
            </Button>
          </div>
          <ScrollArea className="border-border-default h-[320px] rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border-default bg-bg-surface2 border-b">
                  <th className="text-text-secondary p-2 text-left text-[10px] font-bold uppercase">
                    Время
                  </th>
                  <th className="text-text-secondary p-2 text-left text-[10px] font-bold uppercase">
                    Пользователь
                  </th>
                  <th className="text-text-secondary p-2 text-left text-[10px] font-bold uppercase">
                    Действие
                  </th>
                  <th className="text-text-secondary p-2 text-left text-[10px] font-bold uppercase">
                    Сущность
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LOG.map((r) => (
                  <tr key={r.id} className="border-border-subtle border-b">
                    <td className="text-text-secondary p-2">{r.at}</td>
                    <td className="p-2 font-medium">{r.who}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-[9px]">
                        {r.action}
                      </Badge>
                    </td>
                    <td className="p-2">{r.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.admin.home}>В админку</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
