'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import Link from 'next/link';
import { ArrowUpRight, Map } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { B2B_ORDERS_REGISTRY_LABEL } from '@/lib/ui/b2b-registry-label';
import { HubTodayPanel, type HubAlert } from '@/components/hub/hub-today-panel';
import { hubAlertsForSource } from '@/lib/hub/dashboard-hub-data';
import { useDashboardHubPanel } from '@/lib/hub/use-dashboard-hub-panel';
import { USE_FASTAPI } from '@/lib/syntha-api-mode';
import { Button } from '@/components/ui/button';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getFactoryHubCrossRoleLinks } from '@/lib/data/entity-links';
import { FactoryWorkshop2SampleQueuePanel } from '@/components/factory/FactoryWorkshop2SampleQueuePanel';
import { FactoryWorkshop2ProductionHandoffPanel } from '@/components/factory/FactoryWorkshop2ProductionHandoffPanel';

const FACTORY_MANUFACTURER_ALERTS: HubAlert[] = [
  {
    level: 'info',
    text: 'Контур производства в demo-режиме; смены и QC синхронизируются при подключении BFF.',
  },
  { level: 'warning', text: '2 партии на линии ждут подписи QC (демо-данные).' },
];

const manufacturerSections = [
  {
    title: 'Производство',
    items: [
      { href: ROUTES.brand.production, label: 'Производство', desc: 'Операции и заказы' },
      { href: ROUTES.brand.b2bOrders, label: B2B_ORDERS_REGISTRY_LABEL, desc: 'Заказы от брендов' },
    ],
  },
  {
    title: 'QC и логистика',
    items: [
      { href: ROUTES.brand.compliance, label: 'QC и Compliance', desc: 'Контроль качества' },
      { href: ROUTES.brand.logistics, label: 'Логистика', desc: 'Поставки и склады' },
    ],
  },
];

export function FactoryProductionLegacyPage() {
  const { kpis, source, loading } = useDashboardHubPanel('factory');
  const alerts = hubAlertsForSource(
    USE_FASTAPI,
    loading ? undefined : source,
    FACTORY_MANUFACTURER_ALERTS
  );

  return (
    <div className="space-y-10">
      <>
        <HubTodayPanel
          e2eVariant="factory"
          hubLabel="производственный хаб"
          accentClass="text-emerald-600"
          kpis={kpis}
          actions={[
            { label: 'Производство', href: ROUTES.brand.production, desc: 'Смены и маршруты' },
            { label: B2B_ORDERS_REGISTRY_LABEL, href: ROUTES.brand.b2bOrders, desc: 'От брендов' },
            { label: 'QC и Compliance', href: ROUTES.brand.compliance, desc: 'Контроль качества' },
          ]}
          alerts={alerts}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="text-[10px] font-black uppercase" asChild>
            <Link href={LEGACY_ROUTES.shop.b2bWorkspaceMap}>
              <Map className="mr-2 size-3.5" />
              Карта процессов B2B
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-muted text-[10px] font-black uppercase"
            asChild
          >
            <Link href={ROUTES.shop.home}>Кабинет магазина</Link>
          </Button>
        </div>

        <div>
          <h2 className="text-text-secondary mb-1 text-[11px] font-black uppercase tracking-[0.2em]">
            Все разделы
          </h2>
          <p className="text-text-primary text-sm">
            Производство, заказы и QC — навигация слева и ссылки ниже.
          </p>
        </div>
      </>

      <FactoryWorkshop2SampleQueuePanel factoryId="fact-1" />
      <FactoryWorkshop2ProductionHandoffPanel factoryId="fact-1" />

      <RelatedModulesBlock
        links={getFactoryHubCrossRoleLinks()}
        title="Связь с брендом и ритейлом"
        className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {manufacturerSections.map((section) => (
          <div
            key={section.title}
            className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
          >
            <h3 className="text-text-muted mb-3 text-[10px] font-black uppercase tracking-widest">
              {section.title}
            </h3>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-text-primary hover:bg-bg-surface2 group flex items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <div>
                      <span className="transition-colors group-hover:text-emerald-600">
                        {item.label}
                      </span>
                      <p className="text-text-muted mt-0.5 text-[9px] font-normal normal-case tracking-normal">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="text-text-muted size-3 shrink-0 group-hover:text-emerald-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
