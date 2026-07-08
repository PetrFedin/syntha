import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * Карта интеграционных модулей — Фазы 1–4 (РФ-специфика, коммерция, AI, удобство байеров).
 * Связи между модулями для навигации и RelatedModulesBlock.
 */
import { ROUTES } from '@/lib/routes';

export type IntegrationModule = {
  id: string;
  phase: 1 | 2 | 3 | 4;
  label: string;
  href: string;
  description: string;
  reference: string; // Sellty, NuOrder, JOOR, etc.
  relatedIds: string[];
};

export const INTEGRATION_MODULES: IntegrationModule[] = [
  // Фаза 1 — РФ-специфика
  {
    id: '1c-sync',
    phase: 1,
    label: 'Синхронизация 1С',
    href: ROUTES.brand.integrationsErpPlm,
    description: 'Sellty, Compo: заказы, остатки, справочники',
    reference: 'Sellty, Compo',
    relatedIds: ['net-terms', 'dealer-cabinet'],
  },
  {
    id: 'net-terms',
    phase: 1,
    label: 'Net terms / отсрочка',
    href: ROUTES.brand.financeRf,
    description: '30/60 дней для оптовиков (Faire)',
    reference: 'Faire',
    relatedIds: ['1c-sync', 'first-order-discount'],
  },
  {
    id: 'tenders',
    phase: 1,
    label: 'Тендеры B2B',
    href: LEGACY_ROUTES.shop.b2bTenders,
    description: 'Закупки и аукционы (B2B-Center)',
    reference: 'B2B-Center',
    relatedIds: ['supplier-discovery'],
  },
  {
    id: 'supplier-discovery',
    phase: 1,
    label: 'Поиск поставщиков',
    href: ROUTES.shop.b2bSupplierDiscovery,
    description: 'Реестр по гео и категориям (Supl.biz)',
    reference: 'Supl.biz',
    relatedIds: ['tenders'],
  },
  // Фаза 2 — Коммерция
  {
    id: 'collaborative-order',
    phase: 2,
    label: 'Collaborative Buying',
    href: LEGACY_ROUTES.shop.b2bCollaborativeOrder,
    description: 'Совместное редактирование заказа несколькими байерами',
    reference: 'NuOrder',
    relatedIds: ['margin-calculator', 'trade-show'],
  },
  {
    id: 'margin-calculator',
    phase: 2,
    label: 'Margin Calculator',
    href: LEGACY_ROUTES.shop.b2bMarginCalculator,
    description: 'Расчёт маржи в корзине',
    reference: 'NuOrder',
    relatedIds: ['collaborative-order', 'trade-show'],
  },
  {
    id: 'trade-show',
    phase: 2,
    label: 'Market Week / Trade Show',
    href: LEGACY_ROUTES.brand.tradeShows,
    description: 'CPM, МФН и др. события (JOOR, FashionGo)',
    reference: 'JOOR, FashionGo',
    relatedIds: ['collaborative-order', 'buyer-onboarding'],
  },
  {
    id: 'first-order-discount',
    phase: 2,
    label: 'First order discount',
    href: ROUTES.brand.financeRf,
    description: 'Автоскидка на первый заказ (Faire)',
    reference: 'Faire',
    relatedIds: ['net-terms', 'buyer-onboarding'],
  },
  // Фаза 3 — AI и контент
  {
    id: 'ai-creator-studio',
    phase: 3,
    label: 'AI Creator Studio',
    href: ROUTES.brand.aiTools,
    description: 'Описания, lookbook, контент-планы (Colect)',
    reference: 'Colect',
    relatedIds: ['wiz-studio', 'ai-recommendations'],
  },
  {
    id: 'wiz-studio',
    phase: 3,
    label: 'WizStudio / AI-каталог',
    href: ROUTES.brand.marketingContentFactory,
    description: 'Виртуальные съёмки без фотосессии (WizCommerce)',
    reference: 'WizCommerce',
    relatedIds: ['ai-creator-studio', 'ai-recommendations'],
  },
  {
    id: 'ai-recommendations',
    phase: 3,
    label: 'AI-рекомендации',
    href: ROUTES.shop.b2bAiSearch,
    description: 'Персонализация ассортимента и допродажи',
    reference: 'WizCommerce, Brandboom',
    relatedIds: ['selection-builder', 'ai-creator-studio'],
  },
  {
    id: 'selection-builder',
    phase: 3,
    label: 'Формирование селекции',
    href: LEGACY_ROUTES.shop.b2bSelectionBuilder,
    description: 'Сток, бренд-сезон, кросс-бренд, AI',
    reference: 'Syntha',
    relatedIds: ['ai-recommendations'],
  },
  // Фаза 4 — Удобство байеров
  {
    id: 'sales-app',
    phase: 4,
    label: 'Sales App (мобильное)',
    href: ROUTES.shop.b2bScanner,
    description: 'iPad/телефон для показа и приёма заказов',
    reference: 'Colect, Le New Black',
    relatedIds: ['dealer-cabinet'],
  },
  {
    id: 'dealer-cabinet',
    phase: 4,
    label: 'Личный кабинет дилера',
    href: ROUTES.shop.b2bDealerCabinet,
    description: 'Документы, отчёты, аналитика (Sellty, Compo)',
    reference: 'Sellty, Compo',
    relatedIds: ['1c-sync', 'sales-app'],
  },
  {
    id: 'buyer-onboarding',
    phase: 4,
    label: 'Анкета онбординга',
    href: LEGACY_ROUTES.brand.buyerApplications,
    description: 'Сбор данных о магазине при регистрации (Brandboom)',
    reference: 'Brandboom',
    relatedIds: ['first-order-discount', 'trade-show'],
  },
];

export function getModuleById(id: string): IntegrationModule | undefined {
  return INTEGRATION_MODULES.find((m) => m.id === id);
}

export function getRelatedLinks(moduleId: string): { label: string; href: string }[] {
  const mod = getModuleById(moduleId);
  if (!mod) return [];
  return mod.relatedIds
    .map((id) => getModuleById(id))
    .filter((m): m is IntegrationModule => !!m)
    .map((m) => ({ label: m.label, href: m.href }));
}

export function getModulesByPhase(phase: 1 | 2 | 3 | 4): IntegrationModule[] {
  return INTEGRATION_MODULES.filter((m) => m.phase === phase);
}
