'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { SupplierPriceDeltaAlert } from '@/lib/fashion/supplier-price-delta-alerts';
import {
  SUP_DEV_PRICE_DELTA_ALERT_CATALOG_LINK_TESTID,
  SUP_DEV_PRICE_DELTA_ALERT_EMPTY_TESTID,
  SUP_DEV_PRICE_DELTA_ALERT_LOADING_TESTID,
  SUP_DEV_PRICE_DELTA_ALERT_STRIP_TESTID,
  supDevPriceDeltaAlertBadgeRu,
  supDevPriceDeltaAlertCatalogLinkRu,
  supDevPriceDeltaAlertCatalogLinkShortRu,
  supDevPriceDeltaAlertDeltaBadgeRu,
  supDevPriceDeltaAlertEmptyHonestRu,
  supDevPriceDeltaAlertEmptyThresholdRu,
  supDevPriceDeltaAlertErrorRu,
  supDevPriceDeltaAlertLoadingRu,
} from '@/lib/fashion/supplier-dev-wave-wk';
import { factoryMaterialsCatalogHrefForDemo } from '@/lib/platform-core-hub-matrix';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Алерты расхождения цен журнал vs BOM (GET price-delta-alerts). */
export function SupplierPriceDeltaAlertStrip({ collectionId, articleId }: Props) {
  const [alerts, setAlerts] = useState<SupplierPriceDeltaAlert[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [honestEmpty, setHonestEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void (async () => {
      try {
        const params = new URLSearchParams({ collectionId, articleId });
        const res = await fetch(`/api/workshop2/supplier/price-delta-alerts?${params.toString()}`, {
          headers: buildWorkshop2ApiRequestHeaders(),
          cache: 'no-store',
        });
        const json = (await res.json()) as {
          ok?: boolean;
          alerts?: SupplierPriceDeltaAlert[];
          honestEmpty?: boolean;
        };
        if (cancelled) return;
        if (json.ok && Array.isArray(json.alerts)) {
          setAlerts(json.alerts);
          setHonestEmpty(Boolean(json.honestEmpty));
          setState('ready');
        } else {
          setAlerts([]);
          setState('error');
        }
      } catch {
        if (!cancelled) {
          setAlerts([]);
          setState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [articleId, collectionId]);

  const catalogHref = factoryMaterialsCatalogHrefForDemo({
    collectionId,
    demoArticleId: articleId,
    demoOrderId: '',
    factoryId: '',
  });

  if (state === 'loading') {
    return (
      <p className="text-text-muted text-[10px]" data-testid={SUP_DEV_PRICE_DELTA_ALERT_LOADING_TESTID}>
        {supDevPriceDeltaAlertLoadingRu()}
      </p>
    );
  }

  if (state === 'error') {
    return (
      <div
        className="border-border-subtle rounded-md border px-3 py-2 text-xs text-text-muted"
        data-testid="sup-dev-price-delta-alert-error"
      >
        {supDevPriceDeltaAlertErrorRu()}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div
        className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/40 px-3 py-2 text-xs text-text-secondary"
        data-testid={SUP_DEV_PRICE_DELTA_ALERT_EMPTY_TESTID}
      >
        <Badge variant="outline" className="text-[9px]">
          {supDevPriceDeltaAlertDeltaBadgeRu()}
        </Badge>
        <span>
          {honestEmpty
            ? supDevPriceDeltaAlertEmptyHonestRu()
            : supDevPriceDeltaAlertEmptyThresholdRu()}
        </span>
        <Link
          href={catalogHref}
          className="text-accent-primary font-medium hover:underline"
          data-testid={SUP_DEV_PRICE_DELTA_ALERT_CATALOG_LINK_TESTID}
        >
          {supDevPriceDeltaAlertCatalogLinkShortRu()}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="space-y-2 rounded-md border border-amber-300/70 bg-amber-50/40 px-3 py-2 text-xs"
      data-testid={SUP_DEV_PRICE_DELTA_ALERT_STRIP_TESTID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-800" aria-hidden />
        <Badge variant="secondary" className="text-[9px]">
          {supDevPriceDeltaAlertBadgeRu(alerts.length)}
        </Badge>
        <Link
          href={catalogHref}
          className="text-accent-primary text-[10px] font-medium hover:underline"
          data-testid={SUP_DEV_PRICE_DELTA_ALERT_CATALOG_LINK_TESTID}
        >
          {supDevPriceDeltaAlertCatalogLinkRu()}
        </Link>
      </div>
      <ul className="space-y-1" data-testid="sup-dev-price-delta-alert-list">
        {alerts.slice(0, 5).map((alert) => (
          <li
            key={alert.materialName}
            className="text-[11px] text-amber-950"
            data-testid={`sup-dev-price-delta-alert-${alert.severity}`}
          >
            · {alert.messageRu}
          </li>
        ))}
      </ul>
    </div>
  );
}
