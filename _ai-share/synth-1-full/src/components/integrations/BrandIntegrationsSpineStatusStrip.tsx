'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

type Connector = {
  id: string;
  platform: string;
  label: string;
  configured: boolean;
  health: string;
  lifecycle: string;
  description?: string;
};

type HubMeta = {
  inboundShipmentWebhookPath: string;
  webhookSecretConfigured: boolean;
  configuredConnectorCount: number;
  betaConnectorCount: number;
};

type StatusPayload = {
  connectors?: Connector[];
  hub?: HubMeta;
};

/** Столп 3 · brand registry — компактный статус B2B-каналов (без raw JSON). */
export function BrandIntegrationsSpineStatusStrip({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/integrations/v1/status', { cache: 'no-store' });
        const json = (await res.json()) as { data?: StatusPayload };
        if (!cancelled) {
          if (res.ok && json.data) {
            setData(json.data);
            setLoadState('ready');
          } else {
            setLoadState('error');
          }
        }
      } catch {
        if (!cancelled) setLoadState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadState === 'loading') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
        data-testid="brand-spine-status-loading"
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Каналы…
      </span>
    );
  }

  if (loadState === 'error' || !data?.connectors) return null;

  const hub = data.hub;
  const wholesaleChannels = data.connectors.filter((c) =>
    ['joor', 'nuorder', 'zedonk', 'apparel_magic', 'aims360'].includes(c.platform)
  );

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-1.5"
        data-testid="brand-spine-status-strip-compact"
      >
        <Badge variant="outline" className="text-[9px]">
          {hub?.configuredConnectorCount ?? 0}/{wholesaleChannels.length} каналов
        </Badge>
        <Badge
          variant={hub?.webhookSecretConfigured ? 'secondary' : 'outline'}
          className="text-[9px]"
          data-testid="brand-spine-webhook-secret-badge"
        >
          Webhook {hub?.webhookSecretConfigured ? '✓' : '—'}
        </Badge>
        <Link
          href={ROUTES.brand.integrationsWebhooks}
          className="text-accent-primary text-[10px] font-medium hover:underline"
          data-testid="brand-spine-status-webhooks-link"
        >
          Настройки →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="brand-spine-status-strip">
      <div className="flex flex-wrap gap-1.5">
        {data.connectors.map((c) => (
          <Badge
            key={c.id}
            variant={c.configured ? 'secondary' : 'outline'}
            className="text-[9px]"
            data-testid={`brand-spine-connector-${c.id}`}
            title={c.description}
          >
            {c.label}
            {c.configured ? ' · on' : ''}
          </Badge>
        ))}
      </div>
      {hub ? (
        <p className="text-[10px] text-muted-foreground">
          Inbound webhook: <code className="text-[9px]">{hub.inboundShipmentWebhookPath}</code>
          {hub.webhookSecretConfigured ? ' · секрет задан' : ' · секрет не задан'}
        </p>
      ) : null}
    </div>
  );
}
