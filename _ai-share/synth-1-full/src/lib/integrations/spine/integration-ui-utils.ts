import type { OperationalOrderIntegration } from '@/lib/integrations/spine/integration-external-ref.schema';

/** Заказ создан через внешний оптовый канал (internal id prefix). */
export function isIntegrationImportedWholesaleOrderId(wholesaleOrderId: string): boolean {
  return /^INT-(JOOR|NUORDER|ZEDONK|APPAREL-MAGIC|AIMS360)-/i.test(wholesaleOrderId.trim());
}

/** Продуктовые подписи каналов — без внешних торговых марок в UI. */
const CHANNEL_LABEL_RU: Record<string, string> = {
  syntha: 'Syntha',
  centric: 'PLM · мастер-данные',
  nuorder: 'B2B-каталог',
  joor: 'Партнёрская сеть',
  apparel_magic: 'ERP · закупки',
  zedonk: 'Агентская консолидация',
  aims360: 'Склад · allocation',
};

const IMPORT_TOOLBAR_LABEL: Record<string, string> = {
  joor: 'Партнёрская сеть',
  nuorder: 'B2B-каталог',
  zedonk: 'Агентская консолидация',
  apparel_magic: 'ERP · закупки',
};

export function integrationPlatformLabelRu(
  platform: OperationalOrderIntegration['sourcePlatform'] | string | undefined
): string {
  if (!platform) return 'Внешний канал';
  const key = platform.trim().toLowerCase();
  return CHANNEL_LABEL_RU[key] ?? 'Внешний канал';
}

/** Кнопки импорта в реестре — короткие продуктовые названия. */
export function wholesaleImportChannelLabelRu(platform: string): string {
  const key = platform.trim().toLowerCase();
  return IMPORT_TOOLBAR_LABEL[key] ?? 'Внешний канал';
}

/** Человекочитаемый тип заказа для badge (без INT-* префикса). */
export function wholesaleOrderKindLabelRu(wholesaleOrderId: string): string {
  return isIntegrationImportedWholesaleOrderId(wholesaleOrderId)
    ? 'Внешний оптовый заказ'
    : 'Оптовый заказ';
}

/** Компактный id для UI — без шумного префикса канала. */
export function formatWholesaleOrderDisplayId(wholesaleOrderId: string): string {
  const id = wholesaleOrderId.trim();
  const m = id.match(/^INT-[A-Z0-9-]+-(.+)$/i);
  if (m?.[1]) return m[1];
  return id;
}

export function mapOperationalStatusLabelRu(status: string): string {
  const key = status.trim().toLowerCase();
  if (key === 'pending_approval' || key === 'awaiting_brand') return 'На согласовании';
  if (key === 'confirmed' || key === 'approved') return 'Подтверждён';
  if (key === 'cancelled' || key === 'canceled') return 'Отменён';
  if (key === 'draft') return 'Черновик';
  if (key === 'allocated') return 'Резерв на складе оформлен';
  if (key === 'shipped') return 'Отгружен';
  return status;
}

/** Короткая метка канала для компактных badge (матрица, витрина). */
export function integrationPlatformShortLabelRu(
  platform: OperationalOrderIntegration['sourcePlatform'] | string | undefined
): string {
  if (!platform) return 'Канал';
  const key = platform.trim().toLowerCase();
  const SHORT: Record<string, string> = {
    syntha: 'Syntha',
    centric: 'PLM',
    nuorder: 'B2B',
    joor: 'Партн',
    apparel_magic: 'ERP',
    zedonk: 'Агент',
    aims360: 'Склад',
  };
  return SHORT[key] ?? 'Канал';
}

export function operationalStatusToBrandBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const key = status.trim().toLowerCase();
  if (key === 'draft') return 'secondary';
  if (key === 'pending_approval' || key === 'awaiting_brand') return 'destructive';
  if (key === 'confirmed' || key === 'approved') return 'default';
  return 'outline';
}

export type WholesaleSourcePlatform = 'joor' | 'nuorder' | 'zedonk' | 'apparel_magic' | 'aims360';

/** Канал по internal id заказа (INT-*). */
export function resolveWholesaleOrderSourcePlatform(
  wholesaleOrderId: string
): WholesaleSourcePlatform | null {
  const id = wholesaleOrderId.trim();
  const m = id.match(/^INT-(JOOR|NUORDER|ZEDONK|APPAREL-MAGIC|AIMS360)-/i);
  if (!m?.[1]) return null;
  const raw = m[1].toLowerCase();
  if (raw === 'apparel-magic') return 'apparel_magic';
  return raw as WholesaleSourcePlatform;
}

/** Каналы с inbound/outbound tracking sync (столп 4). */
export function wholesaleOrderSupportsInboundTracking(wholesaleOrderId: string): boolean {
  const platform = resolveWholesaleOrderSourcePlatform(wholesaleOrderId);
  return platform === 'joor' || platform === 'nuorder';
}

const TRACKING_SYNC_PATH: Partial<Record<WholesaleSourcePlatform, string>> = {
  joor: '/api/integrations/v1/joor/tracking',
  nuorder: '/api/integrations/v1/nuorder/tracking',
};

export function wholesaleTrackingApiBase(
  wholesaleOrderId: string,
  sourcePlatform?: string
): string | null {
  const fromId = resolveWholesaleOrderSourcePlatform(wholesaleOrderId);
  const platform = (sourcePlatform?.trim().toLowerCase() ??
    fromId) as WholesaleSourcePlatform | null;
  if (!platform) return null;
  return TRACKING_SYNC_PATH[platform] ?? null;
}
