'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { RealRouteAi } from '@/components/distributor/real-route-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DistributorTerritoryPage() {
  const [protectionOn, setProtectionOn] = useState(true);
  const allowedRegions = ['Москва', 'МО', 'СПб', 'ЛО'];

  return (
    <CabinetPageContent maxWidth="full" className="space-y-6 duration-300 animate-in fade-in">
      <header className="space-y-2">
        <h1 className="text-sm font-black uppercase tracking-tighter">
          Логистическая Карта & AI Маршруты
        </h1>
        <p className="text-text-muted max-w-2xl text-sm font-medium italic">
          Глобальный мониторинг поставок в реальном времени с использованием предиктивной аналитики
          маршрутов.
        </p>
      </header>

      <Card className="rounded-xl border border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" /> Territory Protection Logic
          </CardTitle>
          <CardDescription>
            Автоматическая блокировка заказов от магазинов вне эксклюзивного региона
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant={protectionOn ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProtectionOn(!protectionOn)}
              className="rounded-lg"
            >
              {protectionOn ? 'Включено' : 'Выключено'}
            </Button>
            <span className="text-text-secondary text-[11px]">
              Разрешённые регионы: {allowedRegions.join(', ')}
            </span>
          </div>
          <p className="text-text-secondary text-[10px]">
            Заказы с доставкой вне указанных регионов будут отклонены. Связь с заказами и
            ритейлерами.
          </p>
        </CardContent>
      </Card>

      <RealRouteAi />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { label: 'Активных маршрутов', value: '14' },
          { label: 'Объем в пути', value: '42.5M ₽' },
          { label: 'Средняя задержка', value: '4.2ч' },
        ].map((stat, i) => (
          <div
            key={i}
            className="border-border-subtle flex flex-col gap-1 rounded-xl border bg-white p-4 shadow-sm"
          >
            <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
              {stat.label}
            </span>
            <span className="text-text-primary text-base font-black">{stat.value}</span>
          </div>
        ))}
      </div>
    </CabinetPageContent>
  );
}
