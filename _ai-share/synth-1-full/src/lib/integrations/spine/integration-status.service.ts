/**
 * GET /api/integrations/v1/status — connector cards for brand integrations UI.
 */
import 'server-only';

import { getJoorConfigFromEnv } from '@/lib/b2b/integrations/archive/joor-api';
import type { IntegrationConnectorStatus } from './integration-external-ref.schema';
import { integrationPlatformLabelRu } from './integration-ui-utils';
import { isSpineOperationalPgEnabled } from './spine-operational-persistence.pg';
import { isSpineOperationalPgPrimary } from './spine-pg-hydrate-guards';

const now = () => new Date().toISOString();

export type IntegrationsSpineHubMeta = {
  inboundShipmentWebhookPath: string;
  webhookSecretHeader: string;
  webhookSecretConfigured: boolean;
  webhookFailClosedInProduction: boolean;
  operationalOrdersSource: 'file+json' | 'postgres+file' | 'postgres-primary';
  operationalOverlaysSource: 'file+json' | 'postgres+file' | 'postgres-primary';
  operationalPillarStoresSource: 'file+json' | 'postgres+file' | 'postgres-primary';
  configuredConnectorCount: number;
  betaConnectorCount: number;
};

export function getIntegrationsSpineHubMeta(
  connectors: IntegrationConnectorStatus[] = getIntegrationsV1ConnectorStatus()
): IntegrationsSpineHubMeta {
  const secret = Boolean(process.env.INTEGRATIONS_SPINE_WEBHOOK_SECRET?.trim());
  const pgPrimary = isSpineOperationalPgPrimary();
  const pgEnabled = isSpineOperationalPgEnabled();
  const ordersSource = pgPrimary ? 'postgres-primary' : pgEnabled ? 'postgres+file' : 'file+json';
  return {
    inboundShipmentWebhookPath: '/api/integrations/v1/webhooks/shipment',
    webhookSecretHeader: 'x-integrations-spine-secret',
    webhookSecretConfigured: secret,
    webhookFailClosedInProduction: process.env.NODE_ENV === 'production',
    operationalOrdersSource: ordersSource,
    operationalOverlaysSource: ordersSource,
    operationalPillarStoresSource: ordersSource,
    configuredConnectorCount: connectors.filter((c) => c.configured).length,
    betaConnectorCount: connectors.filter((c) => c.lifecycle === 'beta').length,
  };
}

export function getIntegrationsV1StatusPayload() {
  const connectors = getIntegrationsV1ConnectorStatus();
  return { connectors, hub: getIntegrationsSpineHubMeta(connectors) };
}

function envConfigured(keys: string[]): boolean {
  return keys.every((k) => Boolean(process.env[k]?.trim()));
}

export function getIntegrationsV1ConnectorStatus(): IntegrationConnectorStatus[] {
  const joorOk = Boolean(getJoorConfigFromEnv()?.accessToken);
  const nuorderOk = envConfigured(['NUORDER_API_BASE', 'NUORDER_CONSUMER_KEY']);
  const centricOk = envConfigured(['CENTRIC_API_BASE', 'CENTRIC_API_TOKEN']);

  return [
    {
      id: 'centric-plm',
      platform: 'centric',
      label: integrationPlatformLabelRu('centric'),
      configured: centricOk,
      health: centricOk ? 'ok' : 'unknown',
      lifecycle: centricOk ? 'beta' : 'stub',
      description: 'Импорт стиля/BOM, eligible gate, RFQ в закупку.',
    },
    {
      id: 'nuorder',
      platform: 'nuorder',
      label: integrationPlatformLabelRu('nuorder'),
      configured: nuorderOk,
      health: nuorderOk ? 'degraded' : 'unknown',
      lifecycle: nuorderOk ? 'beta' : 'stub',
      description: 'ATS/prebook, импорт/экспорт заказов, отгрузки.',
    },
    {
      id: 'joor',
      platform: 'joor',
      label: integrationPlatformLabelRu('joor'),
      configured: joorOk,
      health: joorOk ? 'ok' : 'unknown',
      lastSync: joorOk ? now() : undefined,
      lifecycle: joorOk ? 'beta' : 'stub',
      description: 'Импорт заказов, наличие, окна поставки.',
    },
    {
      id: 'apparel-magic',
      platform: 'apparel_magic',
      label: integrationPlatformLabelRu('apparel_magic'),
      configured: envConfigured(['APPAREL_MAGIC_API_BASE', 'APPAREL_MAGIC_API_TOKEN']),
      health: 'unknown',
      lifecycle: 'stub',
      description: 'ATP, портал заказов, vendor PO.',
    },
    {
      id: 'zedonk',
      platform: 'zedonk',
      label: integrationPlatformLabelRu('zedonk'),
      configured: envConfigured(['ZEDONK_API_BASE', 'ZEDONK_ACCESS_TOKEN']),
      health: 'unknown',
      lifecycle: 'stub',
      description: 'Агентская консолидация, costing hints.',
    },
    {
      id: 'aims360',
      platform: 'aims360',
      label: integrationPlatformLabelRu('aims360'),
      configured: false,
      health: 'unknown',
      lifecycle: 'stub',
      description: 'OTS, WIP-стадии, allocation.',
    },
  ];
}
