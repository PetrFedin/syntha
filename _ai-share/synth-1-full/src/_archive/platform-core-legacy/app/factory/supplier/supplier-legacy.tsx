'use client';

import Link from 'next/link';
import { ArrowUpRight, Map } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { HubTodayPanel, type HubAlert } from '@/components/hub/hub-today-panel';
import { hubAlertsForSource } from '@/lib/hub/dashboard-hub-data';
import { useDashboardHubPanel } from '@/lib/hub/use-dashboard-hub-panel';
import { USE_FASTAPI } from '@/lib/syntha-api-mode';
import { Button } from '@/components/ui/button';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getFactoryHubCrossRoleLinks } from '@/lib/data/entity-links';

const FACTORY_SUPPLIER_ALERTS: HubAlert[] = [
  {
    level: 'info',
    text: 'Каталог материалов и RFQ — демо; котировки и SLA подставятся из интеграций.',
  },
];

const supplierSections = [
  {
    title: 'Материалы и поставки',
    items: [
      { href: ROUTES.brand.materials, label: 'Каталог материалов', desc: 'Материалы для брендов' },
      { href: ROUTES.brand.suppliersRfq, label: 'RFQ и заявки', desc: 'Запросы котировок' },
    ],
  },
  {
    title: 'Заказы и логистика',
    items: [
      { href: ROUTES.brand.b2bOrders, label: 'Заказы', desc: 'Заказы на материалы' },
      { href: ROUTES.brand.logistics, label: 'Логистика', desc: 'Доставка материалов' },
    ],
  },
];

export function FactorySupplierLegacyPage() {
  const hubRole = 'factory-supplier';
  const { kpis, source, loading } = useDashboardHubPanel(hubRole);
  const alerts = hubAlertsForSource(
    USE_FASTAPI,
    loading ? undefined : source,
    FACTORY_SUPPLIER_ALERTS
  );

  return (
    <div className="space-y-10">
      <>
        <HubTodayPanel
          e2eVariant="factory-supplier"
          hubLabel="поставщик материалов"
          accentClass="text-emerald-600"
          kpis={kpis}
          actions={[
            { label: 'Каталог материалов', href: ROUTES.brand.materials, desc: 'Номенклатура' },
            { label: 'RFQ и заявки', href: ROUTES.brand.suppliersRfq, desc: 'Котировки' },
            { label: 'Заказы', href: ROUTES.brand.b2bOrders, desc: 'К исполнению' },
          ]}
          alerts={alerts}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="text-[10px] font-black uppercase" asChild>
            <Link href={ROUTES.shop.b2bWorkspaceMap}>
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
            Материалы, RFQ и логистика — навигация слева и ссылки ниже.
          </p>
        </div>

        <RelatedModulesBlock
          links={getFactoryHubCrossRoleLinks()}
          title="Связь с брендом и ритейлом"
          className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
        />
      </>

      <div className="grid gap-6 md:grid-cols-2">
        {supplierSections.map((section) => (
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
