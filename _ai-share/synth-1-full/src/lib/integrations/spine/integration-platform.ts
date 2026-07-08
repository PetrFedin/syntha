/**
 * ADR-002: платформы интеграции spine + маппинг статусов wholesale.
 */

export const INTEGRATION_PLATFORMS = [
  'centric',
  'lectra',
  'nuorder',
  'joor',
  'apparel_magic',
  'zedonk',
  'aims360',
  'shopify',
  'colect',
  'fashion_cloud',
] as const;

export type IntegrationPlatform = (typeof INTEGRATION_PLATFORMS)[number];

export const ORDER_SOURCE_PLATFORMS = [
  'syntha',
  'centric',
  'nuorder',
  'joor',
  'apparel_magic',
  'zedonk',
  'aims360',
] as const;

export type OrderSourcePlatform = (typeof ORDER_SOURCE_PLATFORMS)[number];

export type SynthaOperationalStatus = 'draft' | 'pending_approval' | 'confirmed' | 'cancelled';

const JOOR_STATUS_MAP: Record<string, SynthaOperationalStatus> = {
  draft: 'draft',
  pending: 'pending_approval',
  review: 'pending_approval',
  awaiting_brand: 'pending_approval',
  approved: 'confirmed',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

const NUORDER_STATUS_MAP: Record<string, SynthaOperationalStatus> = {
  draft: 'draft',
  pending: 'pending_approval',
  review: 'pending_approval',
  submitted: 'pending_approval',
  approved: 'confirmed',
  confirmed: 'confirmed',
  processed: 'confirmed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

const ZEDONK_STATUS_MAP: Record<string, SynthaOperationalStatus> = {
  ...JOOR_STATUS_MAP,
};

export function mapExternalOrderStatus(
  platform: IntegrationPlatform | OrderSourcePlatform,
  externalStatus: string | undefined | null
): SynthaOperationalStatus {
  const key = (externalStatus ?? 'draft').trim().toLowerCase();
  if (platform === 'joor') return JOOR_STATUS_MAP[key] ?? 'pending_approval';
  if (platform === 'nuorder') return NUORDER_STATUS_MAP[key] ?? 'pending_approval';
  if (platform === 'zedonk') return ZEDONK_STATUS_MAP[key] ?? 'pending_approval';
  if (platform === 'apparel_magic' || platform === 'aims360') {
    return JOOR_STATUS_MAP[key] ?? 'pending_approval';
  }
  return JOOR_STATUS_MAP[key] ?? 'draft';
}

export function isWholesaleImportPlatform(
  platform: string
): platform is Extract<IntegrationPlatform, 'joor' | 'nuorder' | 'zedonk' | 'apparel_magic'> {
  return (
    platform === 'joor' ||
    platform === 'nuorder' ||
    platform === 'zedonk' ||
    platform === 'apparel_magic'
  );
}

export function wholesaleOrderIdForExternalImport(
  platform: IntegrationPlatform,
  externalOrderId: string
): string {
  const slug = externalOrderId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
  return `INT-${platform.toUpperCase().replace(/_/g, '-')}-${slug}`;
}
