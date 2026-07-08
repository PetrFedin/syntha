'use client';

import { Badge } from '@/components/ui/badge';
import type { OperationalOrderIntegration } from '@/lib/integrations/spine/integration-external-ref.schema';
import {
  integrationPlatformLabelRu,
  isIntegrationImportedWholesaleOrderId,
} from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  wholesaleOrderId: string;
  integration?: OperationalOrderIntegration | null;
  className?: string;
};

/** Столп 3 · brand/shop registry — badge источника wholesale (Wave A-UI). */
export function B2bOrderIntegrationBadge({ wholesaleOrderId, integration, className }: Props) {
  if (!integration?.sourcePlatform && !isIntegrationImportedWholesaleOrderId(wholesaleOrderId)) {
    return null;
  }

  const platform = integration?.sourcePlatform ?? inferPlatformFromOrderId(wholesaleOrderId);
  const health = integration?.syncHealth;
  const healthVariant =
    health === 'error' ? 'destructive' : health === 'degraded' ? 'outline' : 'secondary';

  return (
    <div className={className ?? 'mt-0.5 flex flex-wrap items-center gap-1'}>
      <Badge
        variant={healthVariant}
        className="text-[9px] font-bold uppercase tracking-wide"
        data-testid={`b2b-order-integration-badge-${wholesaleOrderId}`}
      >
        {integrationPlatformLabelRu(platform)}
      </Badge>
      {integration?.externalOrderId ? (
        <span
          className="text-text-muted text-[9px] tabular-nums"
          data-testid={`b2b-order-integration-ext-${wholesaleOrderId}`}
          title="externalOrderId"
        >
          ext:{integration.externalOrderId.slice(0, 18)}
          {integration.externalOrderId.length > 18 ? '…' : ''}
        </span>
      ) : null}
    </div>
  );
}

function inferPlatformFromOrderId(orderId: string): OperationalOrderIntegration['sourcePlatform'] {
  if (orderId.includes('-JOOR-')) return 'joor';
  if (orderId.includes('-NUORDER-')) return 'nuorder';
  if (orderId.includes('-ZEDONK-')) return 'zedonk';
  if (orderId.includes('-APPAREL-MAGIC-')) return 'apparel_magic';
  if (orderId.includes('-AIMS360-')) return 'aims360';
  return 'syntha';
}
