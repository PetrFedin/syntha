/**
 * Wave 20 #8 + wave 35: PG activity audit mirror + gates sample/handoff/export.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2ActivityEntry } from '@/lib/production/workshop2-activity-log';
import { summarizeWorkshop2HubActivityStatus } from '@/lib/production/workshop2-hub-activity-status';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2HubActivityMirrorFromEntries(
  entries: Workshop2ActivityEntry[],
  lastEventType?: string
): NonNullable<Workshop2DossierPhase1['hubActivityMirror']> {
  const status = summarizeWorkshop2HubActivityStatus(entries);
  const serverWorkflowEnabled = status.state === 'merged' && status.serverCount > 0;
  const serverAuditMode: 'pg_audit' | 'journal_only' = serverWorkflowEnabled
    ? 'pg_audit'
    : 'journal_only';

  const blockerSampleOrder =
    status.state === 'empty' || (status.state === 'local_only' && status.totalCount > 0);
  const blockerHandoff = status.serverCount === 0 && status.totalCount > 0;

  let hintRu: string | undefined;
  if (status.state === 'empty') {
    hintRu = 'Журнал активности пуст — нет audit trail коллекции в PG.';
  } else if (status.state === 'local_only') {
    hintRu = 'Активность только local — «Activity PG → досье» для server audit.';
  } else if (serverWorkflowEnabled) {
    hintRu = `${status.serverCount} server events в PG audit.`;
  }

  return {
    mirroredAt: new Date().toISOString(),
    totalCount: status.totalCount,
    serverCount: status.serverCount,
    localCount: status.localCount,
    state: status.state,
    serverAuditMode,
    serverWorkflowEnabled,
    lastEventType: lastEventType?.trim() || undefined,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function persistWorkshop2HubActivityMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: { entries: Workshop2ActivityEntry[]; lastEventType?: string }
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    hubActivityMirror: buildWorkshop2HubActivityMirrorFromEntries(
      input.entries,
      input.lastEventType
    ),
  };
}

export function evaluateWorkshop2HubActivitySampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.hubActivityMirror;
  if (!mirror) {
    return {
      id: 'hub.activity.mirror_missing',
      severity: 'warning',
      messageRu: 'Activity mirror не в PG — откройте артикул после загрузки events.',
    };
  }
  if (mirror.blockerSampleOrder === true) {
    return {
      id: 'hub.activity.local_only',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Журнал активности не на сервере — образец без PG audit trail.',
    };
  }
  return null;
}

export function evaluateWorkshop2HubActivityHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.hubActivityMirror;
  if (!mirror) {
    return {
      id: 'hub.activity.mirror_missing_handoff',
      severity: 'warning',
      messageRu: 'Activity mirror не в досье — синхронизируйте PG events.',
    };
  }
  if (mirror.serverWorkflowEnabled !== true) {
    return {
      id: 'hub.activity.no_server_audit',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') || 'Нет PG audit — handoff без server events.',
    };
  }
  if (mirror.blockerHandoff === true) {
    return {
      id: 'hub.activity.no_server_events',
      severity: 'warning',
      messageRu: workshop2PgMirrorStr(mirror, 'hintRu') || 'Нет server events в журнале.',
    };
  }
  return null;
}

/** Wave 35: export-tz требует pg_audit. */
export function evaluateWorkshop2HubActivityExportGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.hubActivityMirror;
  if (mirror?.serverWorkflowEnabled !== true) {
    return {
      id: 'hub.activity.export_no_pg_audit',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'ZIP ТЗ: activity без PG audit — «Activity PG → досье».',
    };
  }
  return null;
}
