'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { B2B_ORDERS_REGISTRY_LABEL } from '@/lib/ui/b2b-registry-label';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getBuyerOnboardingLinks } from '@/lib/data/entity-links';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';

/** JOOR / B2B: рейтинг надёжности ритейлеров, лимиты, история платежей. */
const MOCK_PARTNERS = [
  { id: '1', name: 'Демо-магазин · Москва 1', score: 85, limit: '5 000 000 ₽', status: 'ok' },
  { id: '2', name: 'Демо-магазин · Москва 2', score: 92, limit: '15 000 000 ₽', status: 'ok' },
  { id: '3', name: 'Boutique No.7 (СПб)', score: 62, limit: '1 200 000 ₽', status: 'review' },
];

export default function CreditRiskPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <SectionInfoCard
        title="Credit Risk Scoring"
        description="JOOR-style: внутренний рейтинг надёжности ритейлеров. Лимиты, история платежей, автоматический пересчёт при задержках."
        icon={ShieldCheck}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        badges={
          <>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.retailers}>Партнёры</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.buyerApplications}>Заявки байеров</Link>
            </Button>
          </>
        }
      />
      <div className="flex items-center gap-3">
        <Link href={ROUTES.brand.retailers}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
          <ShieldCheck className="h-6 w-6" /> Credit Risk
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Рейтинг партнёров</CardTitle>
          <CardDescription>
            Скор и лимит по заявкам и истории оплат. При подключении API — обновление в реальном
            времени.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_PARTNERS.map((p) => (
              <li
                key={p.id}
                className="bg-bg-surface2 border-border-subtle flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-text-secondary text-sm">Лимит: {p.limit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{p.score}</span>
                  <Badge variant={p.status === 'ok' ? 'default' : 'secondary'}>
                    {p.status === 'ok' ? 'OK' : 'На проверке'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RelatedModulesBlock
        links={getBuyerOnboardingLinks()}
        title="Заявки байеров, партнёры, B2B заказы, Territory"
      />
    </CabinetPageContent>
  );
}
