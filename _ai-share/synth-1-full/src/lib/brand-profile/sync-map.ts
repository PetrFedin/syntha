import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * Карта синхронизации профиля бренда.
 * Связи: Profile Tab ↔ Legal, B2B, entity-links, ROUTES.
 */

import { ROUTES } from '@/lib/routes';

/** Поле профиля → куда синхронизируется */
export const PROFILE_SYNC_MAP = {
  brandName: ['header', 'legal.legalName', 'export CSV'],
  logo: ['header', 'Press Kit', 'DAM'],
  foundedYear: ['header (Est.)', 'legal.foundingDate'],
  country: ['header', 'legal', 'compliance'],
  showroom: [ROUTES.brand.showroom, 'trade-shows', 'B2B events'],
  storeAddresses: ['availability by store', 'map', 'try-on flow'],
  onlineStores: [ROUTES.brand.pricingPriceComparison, 'parsing service'],
  contacts: ['legal (b2b@)', 'messages', 'support'],
} as const;

/** Связанные разделы при редактировании профиля */
export const PROFILE_RELATED_ROUTES = {
  legal: ROUTES.brand.profile + '?tab=legal',
  showroom: ROUTES.brand.showroom,
  stores: ROUTES.brand.retailers,
  pricing: ROUTES.brand.pricing,
  priceComparison: ROUTES.brand.pricingPriceComparison,
  customerGroups: LEGACY_ROUTES.brand.customerGroups,
} as const;
