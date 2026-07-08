'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { B2B_ORDERS_REGISTRY_LABEL } from '@/lib/ui/b2b-registry-label';

const BADGE_CLASS = 'text-[9px] h-7';

export { B2B_ORDERS_REGISTRY_LABEL };

/** Одна CTA-кнопка в блоках SectionInfoCard. Единый стиль для всех разделов бренда. */
export function SectionBadgeLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="outline" size="sm" className={BADGE_CLASS} asChild>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

/** Реестр B2B-заказов, Партнёры, Дистрибьюторы — для Territory и общих B2B-разделов */
export function B2BOrdersPartnersDistributorsBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.retailers}>Партнёры</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.distributors}>Дистрибьюторы</SectionBadgeLink>
    </>
  );
}

/** Партнёры, Финансы, Дистрибьюторы — для комиссий и финансового контекста */
export function PartnersFinanceDistributorsBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.retailers}>Партнёры</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.finance}>Финансы</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.distributors}>Дистрибьюторы</SectionBadgeLink>
    </>
  );
}

/** Production, GANTT — для страниц цеха (nesting, worker-skills, daily-output) */
export function ProductionGanttBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.production}>Производство</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.productionGantt}>GANTT</SectionBadgeLink>
    </>
  );
}

/** Шоурум, реестр B2B-заказов, Партнёры, Заявки байеров — для выставок и онбординга */
export function B2BShowroomPartnersBuyersBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.showroom}>Шоурум</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.retailers}>Партнёры</SectionBadgeLink>
      <SectionBadgeLink href={LEGACY_ROUTES.brand.buyerApplications}>Заявки байеров</SectionBadgeLink>
    </>
  );
}

/** Финансы, Production, реестр B2B-заказов, План vs Факт — для аналитики Phase 2 */
export function FinanceProductionB2BBudgetBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.finance}>Финансы</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.production}>Производство</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.budgetActual}>План vs Факт</SectionBadgeLink>
    </>
  );
}

/** BI Hub, Финансы — для План vs Факт и аналитики */
export function FinanceBiHubBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.analyticsBi}>Аналитика BI</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.finance}>Финансы</SectionBadgeLink>
    </>
  );
}

/** Реестр B2B-заказов, Заявки на изменение, Финансы — для согласования заказов */
export function B2BOrdersAmendmentsFinanceBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</SectionBadgeLink>
      <SectionBadgeLink href={LEGACY_ROUTES.brand.orderAmendments}>Заявки на изменение</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.finance}>Финансы</SectionBadgeLink>
    </>
  );
}

/** Реестр B2B-заказов, Согласование заказов — для заявок на изменение */
export function B2BOrdersApprovalBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</SectionBadgeLink>
      <SectionBadgeLink href={LEGACY_ROUTES.brand.orderApprovalWorkflow}>
        Согласование заказов
      </SectionBadgeLink>
    </>
  );
}

/** Поставщики, Финансы — для субподряда и закупок */
export function ProductionSuppliersFinanceBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.suppliers}>Поставщики</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.finance}>Финансы</SectionBadgeLink>
    </>
  );
}

/** Production, реестр B2B-заказов, Отчёты смен — для GANTT-страницы */
export function ProductionGanttDailyBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.production}>Производство</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.productionDailyOutput}>Отчёты смен</SectionBadgeLink>
    </>
  );
}

/** Materials, Поставщики — для Supplier RFQ */
export function MaterialsSuppliersBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.materials}>Материалы</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.suppliers}>Поставщики</SectionBadgeLink>
    </>
  );
}

/** Pre-order, реестр B2B-заказов, Планирование — для Pre-Order Quota */
export function PreOrderQuotaBadges() {
  return (
    <>
      <SectionBadgeLink href={LEGACY_ROUTES.shop.b2bPreOrder}>Предзаказ</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.planning}>Планирование</SectionBadgeLink>
    </>
  );
}

/** BOPIS в магазине, Склад, Возвраты — для BOPIS-хаба */
export function BopisBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.shop.bopis}>BOPIS в магазине</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.warehouse}>Склад</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.returnsClaims}>Возвраты</SectionBadgeLink>
    </>
  );
}

/** CRM, Заказы, Контент — для Style-Me Upsell */
export function StyleMeUpsellBadges() {
  return (
    <>
      <SectionBadgeLink href={ROUTES.brand.customerIntelligence}>CRM</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.preOrders}>Заказы</SectionBadgeLink>
      <SectionBadgeLink href={ROUTES.brand.contentHub}>Контент</SectionBadgeLink>
    </>
  );
}
