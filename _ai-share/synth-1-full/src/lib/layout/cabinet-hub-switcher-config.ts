import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Конфиг переключателя хабов без lucide — для lazy CabinetHubSwitcherNav.
 */
import type { HubKey } from '@/lib/data/profile-page-features';
import { ROUTES } from '@/lib/routes';

export type CabinetHubSwitcherEntry = {
  href: string;
  label: string;
  hub: HubKey;
};

/** Дистрибьютор: ссылки на другие кабинеты экосистемы. */
export const DISTRIBUTOR_HUB_SWITCHER: readonly CabinetHubSwitcherEntry[] = [
  { href: ROUTES.brand.home, hub: 'brand', label: 'Бренд' },
  { href: ROUTES.shop.home, hub: 'shop', label: 'Магазин' },
  { href: EXTENDED_ROUTES.factory.production, hub: 'factory', label: 'Производство' },
  { href: EXTENDED_ROUTES.factory.supplier, hub: 'supplier', label: 'Поставщик' },
];

/** Производство (MFR): без текущего hub «factory». */
export const FACTORY_PRODUCTION_HUB_SWITCHER: readonly CabinetHubSwitcherEntry[] = [
  { href: ROUTES.brand.home, hub: 'brand', label: 'Бренд' },
  { href: ROUTES.shop.home, hub: 'shop', label: 'Магазин' },
  { href: ROUTES.distributor.home, hub: 'distributor', label: 'Дистрибьютор' },
  { href: EXTENDED_ROUTES.factory.supplier, hub: 'supplier', label: 'Поставщик' },
];

/** Поставщик: без текущего hub «supplier». */
export const FACTORY_SUPPLIER_HUB_SWITCHER: readonly CabinetHubSwitcherEntry[] = [
  { href: ROUTES.brand.home, hub: 'brand', label: 'Бренд' },
  { href: ROUTES.shop.home, hub: 'shop', label: 'Магазин' },
  { href: ROUTES.distributor.home, hub: 'distributor', label: 'Дистрибьютор' },
  { href: EXTENDED_ROUTES.factory.production, hub: 'factory', label: 'Производство' },
];
