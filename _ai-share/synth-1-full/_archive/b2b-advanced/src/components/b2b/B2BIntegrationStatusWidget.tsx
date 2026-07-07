'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

interface B2BIntegrationStatusWidgetProps {
  /** Ссылка на hub webhooks / каналов. */
  settingsHref?: string;
}

/** Статус подключённых B2B-каналов (из spine status API). */
export function B2BIntegrationStatusWidget({
  settingsHref = ROUTES.brand.integrationsWebhooks,
}: B2BIntegrationStatusWidgetProps = {}) {
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/integrations/v1/status', { cache: 'no-store' });
        const json = (await res.json()) as {
          data?: { connectors?: Array<{ label: string; configured: boolean; platform: string }> };
        };
        if (res.ok && json.data?.connectors) {
          const wholesale = json.data.connectors.filter(
            (c) =>
              c.configured &&
              ['joor', 'nuorder', 'zedonk', 'apparel_magic', 'aims360'].includes(c.platform)
          );
          setLabels(wholesale.map((c) => c.label));
        }
      } catch {
        setLabels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  return (
    <Card className="border-dashed" data-testid="b2b-integration-status-widget">
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <Zap className="h-4 w-4 text-amber-500" /> B2B-каналы
        </CardTitle>
        <CardDescription>
          {labels.length > 0
            ? 'Подключённые каналы оптовых заказов и синхронизации.'
            : 'Настройте credentials каналов — метрики вовлечённости появятся после синхронизации.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 pt-0">
        {labels.map((label) => (
          <Badge key={label} variant="secondary" className="text-xs font-medium">
            {label}
          </Badge>
        ))}
        <Link
          href={settingsHref}
          className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
          data-testid="b2b-integration-status-settings-link"
        >
          Настройки <ExternalLink className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
