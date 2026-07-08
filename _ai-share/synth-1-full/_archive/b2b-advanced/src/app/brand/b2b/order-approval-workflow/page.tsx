'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { B2BOrdersAmendmentsFinanceBadges } from '@/components/brand/SectionBadgeCta';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { getB2BLinks } from '@/lib/data/entity-links';
import { CheckCircle2, ArrowLeft, ClipboardList, Clock } from 'lucide-react';

const MOCK_APPROVALS = [
  {
    id: 'a1',
    orderId: 'PO-301',
    partner: 'Демо-магазин · Москва 1',
    requestedAt: '2026-03-10T09:00:00',
    step: 'credit_check',
    stepLabel: 'Проверка лимита',
    status: 'pending',
  },
  {
    id: 'a2',
    orderId: 'PO-302',
    partner: 'MultiBrand Store',
    requestedAt: '2026-03-09T14:00:00',
    step: 'manager_approval',
    stepLabel: 'Согласование менеджером',
    status: 'approved',
  },
];

export default function OrderApprovalWorkflowPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <SectionInfoCard
        title="Order Approval Workflow"
        description="Многошаговое согласование B2B заказа: лимит, менеджер, кредит, особые условия. JOOR-style. Связь с заказами и финансами."
        icon={CheckCircle2}
        iconBg="bg-accent-primary/15"
        iconColor="text-accent-primary"
        badges={<B2BOrdersAmendmentsFinanceBadges />}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Link href={ROUTES.brand.b2bOrders}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold uppercase">Order Approval Workflow</h1>
      </div>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="size-5" /> Заказы на согласовании
          </CardTitle>
          <CardDescription>
            Очередь заказов по шагам workflow. При API — правила по партнёру/сумме, делегирование,
            уведомления.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_APPROVALS.map((a) => (
              <li
                key={a.id}
                className="border-border-default bg-bg-surface2 flex items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-mono font-semibold">{a.orderId}</p>
                  <p className="text-text-secondary text-sm">
                    {a.partner} · {a.stepLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={a.status === 'approved' ? 'default' : 'secondary'}
                    className="gap-1 text-[9px]"
                  >
                    {a.status === 'approved' ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <Clock className="size-3" />
                    )}
                    {a.status === 'approved' ? 'Согласован' : 'Ожидает'}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={ROUTES.brand.b2bOrder(a.orderId)}>Открыть</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RelatedModulesBlock
        links={getB2BLinks().filter((l) => l.href !== ROUTES.brand.b2bOrders)}
        title="B2B заказы, заявки на изменение, финансы"
      />
    </CabinetPageContent>
  );
}
