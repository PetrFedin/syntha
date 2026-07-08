'use client';

import Link from 'next/link';
import { Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { summarizeWorkshop2LogisticsPanelTrackingUi } from '@/lib/production/workshop2-logistics-dossier-persist';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { Workshop2ReleaseIntegrationProbeRow } from '@/components/brand/production/workshop2-release-integration-probe-row';
import { isWorkshop2LiveTmsConfigured } from '@/lib/production/workshop2-live-integration-probes-env';

type Props = {
  dossier: Workshop2DossierPhase1 | null;
  collectionId: string;
  articleUrlSegment: string;
};

/** Read-only сводка logisticsShipmentMirror + deep link на supply/logistics. */
export function Workshop2ReleaseLogisticsPanel({
  dossier,
  collectionId,
  articleUrlSegment,
}: Props) {
  const mirror = dossier?.logisticsShipmentMirror;
  const shipmentCount = workshop2PgMirrorNum(mirror, 'shipmentCount');
  const currentStepLabel = workshop2PgMirrorStr(mirror, 'currentStep') || undefined;
  const trackingUi = summarizeWorkshop2LogisticsPanelTrackingUi({
    dossier,
    hasActiveShipment: shipmentCount > 0,
    currentStepLabel,
  });

  const logisticsHref = workshop2ArticleHref(collectionId, articleUrlSegment, {
    w2pane: 'supply',
  });
  const tmsLive = isWorkshop2LiveTmsConfigured();
  const logisticsMode =
    workshop2PgMirrorStr(mirror, 'logisticsMode') || (tmsLive ? 'tms_live' : 'journal_only');
  const mirroredAt = workshop2PgMirrorStr(mirror, 'mirroredAt');
  const hintRu = workshop2PgMirrorStr(mirror, 'hintRu');
  const journalStep =
    workshop2PgMirrorStr(mirror, 'currentStep') || workshop2PgMirrorStr(mirror, 'status') || '—';

  return (
    <div
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
      data-testid="workshop2-release-logistics-panel"
    >
      <p className="text-text-primary flex items-center gap-1.5 text-sm font-semibold">
        <Truck className="h-4 w-4 text-indigo-500" />
        Логистика · read-only
      </p>
      <p className="text-text-secondary text-[10px]">
        Данные из <code className="text-[9px]">logisticsShipmentMirror</code> — редактирование в
        разделе снабжения / logistics panel.
      </p>

      <Workshop2ReleaseIntegrationProbeRow
        kinds={['tms']}
        testId="workshop2-release-logistics-probes"
      />

      <Badge
        variant={tmsLive ? 'default' : 'outline'}
        className={
          tmsLive ? 'text-[10px]' : 'border-amber-200 bg-amber-50 text-[10px] text-amber-900'
        }
        data-testid="workshop2-release-logistics-tms-chip"
      >
        {logisticsMode === 'tms_live' ? 'TMS live' : 'TMS journal_only'}
      </Badge>

      <dl className="grid gap-2 text-[11px] sm:grid-cols-2">
        <div>
          <dt className="text-text-muted">Трекинг</dt>
          <dd>{trackingUi.statusLabelRu}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Отгрузок в mirror</dt>
          <dd>{shipmentCount}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Шаг journal</dt>
          <dd>{journalStep}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Режим</dt>
          <dd>{logisticsMode || '—'}</dd>
        </div>
      </dl>

      {hintRu ? (
        <p className="rounded-md bg-slate-50 px-2 py-1.5 text-[10px] text-slate-700">{hintRu}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {mirroredAt ? (
          <Badge
            variant="outline"
            className="text-[10px]"
            data-testid="workshop2-release-logistics-pg-chip"
          >
            PG mirror · {new Date(mirroredAt).toLocaleString('ru-RU')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] text-amber-900">
            Mirror не в PG
          </Badge>
        )}
        <Button type="button" size="sm" variant="outline" className="h-8 text-[11px]" asChild>
          <Link href={logisticsHref} data-testid="workshop2-release-logistics-deep-link">
            Открыть логистику →
          </Link>
        </Button>
      </div>
    </div>
  );
}
