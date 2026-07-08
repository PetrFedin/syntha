'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowUpRight, Map } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { SHOP_B2B_ORDERS_HUB_LABEL } from '@/lib/ui/b2b-registry-label';
import { HubTodayPanel, type HubAlert } from '@/components/hub/hub-today-panel';
import { hubAlertsForSource } from '@/lib/hub/dashboard-hub-data';
import { useDashboardHubPanel } from '@/lib/hub/use-dashboard-hub-panel';
import { USE_FASTAPI } from '@/lib/syntha-api-mode';
import { useUserContext } from '@/hooks/useUserContext';
import { useRbac } from '@/hooks/useRbac';
import {
  B2BWorkspaceModuleGrid,
  resolveB2bWorkspaceRole,
} from '@/components/b2b/B2BWorkspaceModuleGrid';
import {
  QuickReorderBar,
  OrganizationSwitcher,
  AIAssistantChat,
  SmartRecommendationsWidget,
} from '@/components/dashboard';
import { ReplenishmentRecommendationsBlock } from '@/components/b2b/ReplenishmentRecommendationsBlock';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2bDashboardCrossRoleLinks } from '@/lib/data/entity-links';
import { RETAILER_B2B_QUICK_LINK_SECTIONS } from '@/lib/data/retailer-b2b-dashboard';
import { tid } from '@/lib/ui/test-ids';
import { Button } from '@/components/ui/button';
import { ShopCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  getShopCoreHubTodayActions,
  getShopCoreOverviewSections,
  getShopCoreRetailerB2bQuickSections,
} from '@/lib/platform-core-nav-augment';
import { PlatformCorePlaceholderSurfaceDisclaimer } from '@/components/platform/PlatformCorePlaceholderSurfaceDisclaimer';

const SHOP_PANEL_ALERTS: HubAlert[] = [
  { level: 'info', text: 'Внешние интеграции в demo-режиме до задания ключей в .env.' },
  { level: 'warning', text: '3 позиции B2B ждут подтверждения оплаты (демо-данные).' },
];

type OverviewItem = {
  href: string;
  label: string;
  desc: string;
  testId?: string;
};

const overviewSections: { title: string; items: OverviewItem[] }[] = [
  {
    title: 'Розничные продажи',
    items: [
      {
        href: ROUTES.shop.orders,
        label: 'Заказы клиентов',
        desc: 'Управление розничными заказами',
        testId: 'shop-dashboard-retail-orders-link',
      },
      {
        href: ROUTES.shop.inventory,
        label: 'Склад и остатки',
        desc: 'Инвентарь и архив',
        testId: 'shop-dashboard-inventory-link',
      },
      {
        href: ROUTES.shop.promotions,
        label: 'Акции и скидки',
        desc: 'Промо-акции',
        testId: 'shop-dashboard-promotions-link',
      },
    ],
  },
  {
    title: 'B2B — ключевые экраны',
    items: [
      {
        href: ROUTES.shop.b2bOrders,
        label: SHOP_B2B_ORDERS_HUB_LABEL,
        desc: 'Оптовые заказы и отгрузки',
        testId: 'shop-dashboard-b2b-orders-link',
      },
      {
        href: LEGACY_ROUTES.shop.b2bDiscover,
        label: 'Discover',
        desc: 'Поиск и доступ к брендам',
        testId: 'shop-dashboard-b2b-discover-link',
      },
      {
        href: ROUTES.shop.b2bPartners,
        label: 'Партнёры',
        desc: 'Бренды и контракты',
        testId: 'shop-dashboard-b2b-partners-link',
      },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      {
        href: ROUTES.shop.analytics,
        label: 'Розница',
        desc: 'Дашборд магазина и спрос',
        testId: 'shop-dashboard-analytics-retail-link',
      },
      {
        href: ROUTES.shop.analyticsFootfall,
        label: 'Трафик по зонам',
        desc: 'Footfall и зоны торгового зала',
        testId: 'shop-dashboard-analytics-footfall-link',
      },
      {
        href: LEGACY_ROUTES.shop.b2bAnalytics,
        label: 'Опт',
        desc: 'Закупка, партнёры, KPI',
        testId: 'shop-dashboard-analytics-b2b-link',
      },
      {
        href: LEGACY_ROUTES.shop.b2bMarginAnalysis,
        label: 'Маржа',
        desc: 'Хаб маржи, калькулятор, отчёты',
        testId: 'shop-dashboard-analytics-margin-link',
      },
    ],
  },
];

export default function ShopHubPage() {
  const coreMode = isPlatformCoreMode();
  const { kpis, source, loading } = useDashboardHubPanel('shop');
  const alerts = hubAlertsForSource(USE_FASTAPI, loading ? undefined : source, SHOP_PANEL_ALERTS);
  const { currentOrg, canSwitchOrg, isRetailer, isBrand, isBuyer } = useUserContext();
  const { role } = useRbac();
  const workspaceRole = useMemo(
    () => resolveB2bWorkspaceRole(role, { isRetailer, isBrand, isBuyer }),
    [role, isRetailer, isBrand, isBuyer]
  );
  const hubTodayActions = coreMode
    ? getShopCoreHubTodayActions()
    : [
        { label: 'Открыть B2B заказы', href: ROUTES.shop.b2bOrders, desc: 'Статусы и отгрузки' },
        { label: 'Discover брендов', href: LEGACY_ROUTES.shop.b2bDiscover, desc: 'Поиск и доступ' },
        { label: 'Создать заказ', href: ROUTES.shop.b2bCreateOrder, desc: 'По коллекции' },
      ];
  const sectionsForOverview = coreMode ? getShopCoreOverviewSections() : overviewSections;
  const retailerQuickSections = coreMode
    ? getShopCoreRetailerB2bQuickSections()
    : RETAILER_B2B_QUICK_LINK_SECTIONS;

  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="space-y-10 px-4 py-6 pb-24 sm:px-6"
      data-testid={tid.page('shop-retail-dashboard')}
    >
      {!coreMode ? <ShopCabinetSectionHeader showBack={false} /> : null}
      {coreMode ? (
        <PlatformCorePlaceholderSurfaceDisclaimer route="/shop" className="mb-2" />
      ) : null}
      <HubTodayPanel
        e2eVariant="shop"
        hubLabel="ритейл-центр"
        accentClass="text-rose-600"
        kpis={kpis}
        actions={hubTodayActions}
        alerts={alerts}
      />

      {!coreMode ? (
        <div className="space-y-2">
          <p className="text-text-muted text-[9px] font-black uppercase tracking-widest">
            Аналитика
          </p>
          <ShopAnalyticsSegmentErpStrip showErpBanner={false} />
        </div>
      ) : null}

      {!coreMode ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-[10px] font-black uppercase" asChild>
            <Link href={LEGACY_ROUTES.shop.b2bWorkspaceMap}>
              <Map className="mr-2 size-3.5" />
              Карта процессов B2B
            </Link>
          </Button>
        </div>
      ) : null}

      <QuickReorderBar />

      {canSwitchOrg ? (
        <div className="border-border-default rounded-xl border bg-white p-4 shadow-sm">
          <OrganizationSwitcher />
        </div>
      ) : currentOrg?.name ? (
        <div className="border-border-default text-text-secondary rounded-lg border bg-white px-4 py-3 text-sm shadow-sm">
          <span className="text-text-primary font-medium">{currentOrg.name}</span>
          <span className="text-text-secondary"> · контекст организации</span>
        </div>
      ) : null}

      <div>
        <h2 className="text-text-secondary mb-1 text-[11px] font-black uppercase tracking-[0.2em]">
          Все разделы
        </h2>
        <p className="text-text-primary text-sm">
          Розница и опт — навигация слева (включая B2B и связанные кабинеты). Дашборд — эта
          страница.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sectionsForOverview.map((section) => (
          <div
            key={section.title}
            className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
          >
            <h3 className="text-text-muted mb-3 text-xs font-black uppercase tracking-widest">
              {section.title}
            </h3>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-testid={item.testId}
                    className="text-text-primary hover:bg-bg-surface2 group flex items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <div>
                      <span className="transition-colors group-hover:text-rose-600">
                        {item.label}
                      </span>
                      <p className="text-text-muted mt-0.5 text-[9px] font-normal normal-case tracking-normal">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="text-text-muted size-3 shrink-0 group-hover:text-rose-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-text-secondary mb-1 text-[11px] font-black uppercase tracking-[0.2em]">
          Оптовые закупки — задачи
        </h2>
        <p className="text-text-primary mb-4 text-sm">
          Заказы, партнёры, финансы и поставки в одном месте кабинета магазина (каталог опта — в
          меню «Новый заказ»).
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {retailerQuickSections.map((section) => (
            <div
              key={section.title}
              className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
            >
              <h3 className="text-text-muted mb-3 text-xs font-black uppercase tracking-widest">
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
                        <span className="transition-colors group-hover:text-rose-600">
                          {item.label}
                        </span>
                        <p className="text-text-muted mt-0.5 text-[9px] font-normal normal-case tracking-normal">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowUpRight className="text-text-muted size-3 shrink-0 group-hover:text-rose-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {!coreMode ? (
        <B2BWorkspaceModuleGrid
          primaryRole={workspaceRole}
          className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
          lead="Те же модули, что на матрице B2B: вкладка фильтрует карточки, роль — из вашего контекста (организация / RBAC)."
        />
      ) : null}

      {!coreMode ? (
        <RelatedModulesBlock
          links={getShopB2bDashboardCrossRoleLinks()}
          title="Связь с брендом, каталогом и производством"
          className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
        />
      ) : null}

      <div className="space-y-4">
        <h2 className="text-text-secondary text-[11px] font-black uppercase tracking-[0.2em]">
          Рекомендации и пополнение
        </h2>
        <SmartRecommendationsWidget />
        <ReplenishmentRecommendationsBlock maxItems={5} />
      </div>

      <AIAssistantChat />
    </CabinetPageContent>
  );
}
