'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Webhook } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { BrandIntegrationsSpineStatusStrip } from '@/components/integrations/BrandIntegrationsSpineStatusStrip';

type HubMeta = {
  inboundShipmentWebhookPath: string;
  webhookSecretHeader: string;
  webhookSecretConfigured: boolean;
  webhookFailClosedInProduction: boolean;
  operationalOrdersSource: string;
  operationalOverlaysSource?: string;
  operationalPillarStoresSource?: string;
};

/** Brand integrations · inbound shipment webhook + статус B2B-каналов. */
export function BrandIntegrationsSpineInboundPanel() {
  const [hub, setHub] = useState<HubMeta | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/integrations/v1/status', { cache: 'no-store' });
        const json = (await res.json()) as { data?: { hub?: HubMeta } };
        if (!cancelled) {
          if (res.ok && json.data?.hub) {
            setHub(json.data.hub);
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

  return (
    <Card data-testid="brand-spine-inbound-webhook-panel" className="border-sky-200/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Webhook className="h-4 w-4 text-sky-700" aria-hidden />
          Внешние B2B-каналы · inbound
        </CardTitle>
        <CardDescription>
          Импорт заказов и синхронизация отгрузок в оптовый реестр и столпы 3–4.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BrandIntegrationsSpineStatusStrip />
        {loadState === 'loading' ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Загрузка конфигурации…
          </p>
        ) : hub ? (
          <div className="border-border-subtle bg-bg-surface2/50 space-y-2 rounded-md border p-3 text-xs">
            <p>
              <span className="text-text-muted">POST </span>
              <code className="font-mono text-[11px]">{hub.inboundShipmentWebhookPath}</code>
            </p>
            <p className="text-text-secondary">
              Заголовок: <code className="font-mono">{hub.webhookSecretHeader}</code>
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={hub.webhookSecretConfigured ? 'secondary' : 'outline'}
                className="text-[9px]"
                data-testid="brand-spine-webhook-secret-configured-badge"
              >
                {hub.webhookSecretConfigured ? 'Секрет webhook задан' : 'Секрет webhook не задан'}
              </Badge>
              {hub.webhookFailClosedInProduction && !hub.webhookSecretConfigured ? (
                <Badge variant="destructive" className="text-[9px]">
                  Production: fail-closed без секрета
                </Badge>
              ) : null}
              <Badge variant="outline" className="text-[9px]">
                Заказы: {hub.operationalOrdersSource}
              </Badge>
              {hub.operationalOverlaysSource ? (
                <Badge variant="outline" className="text-[9px]">
                  Оверлеи: {hub.operationalOverlaysSource}
                </Badge>
              ) : null}
              {hub.operationalPillarStoresSource ? (
                <Badge variant="outline" className="text-[9px]">
                  Столпы 3–4: {hub.operationalPillarStoresSource}
                </Badge>
              ) : null}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Env: <code>INTEGRATIONS_SPINE_WEBHOOK_SECRET</code>, credentials каналов — в
              deployment config.
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 text-xs">
          <Link
            href={ROUTES.brand.b2bOrders}
            className="text-accent-primary font-medium hover:underline"
            data-testid="brand-spine-inbound-b2b-registry-link"
          >
            Реестр оптовых заказов →
          </Link>
          <Link
            href={ROUTES.brand.integrationsCentric}
            className="text-accent-primary font-medium hover:underline"
            data-testid="brand-spine-inbound-plm-link"
          >
            PLM · мастер-данные →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
