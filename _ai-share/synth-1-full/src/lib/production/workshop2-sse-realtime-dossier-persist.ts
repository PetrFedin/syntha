/**
 * Wave 29 #20: зеркало SSE/polling realtime в досье + gates sample-order / handoff.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import type {
  Workshop2ConnectionStatus,
  Workshop2RealtimeTransport,
} from '@/lib/production/workshop2-realtime-stub';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2SseRealtimeMirror(input: {
  transport: Workshop2RealtimeTransport;
  connectionStatus: Workshop2ConnectionStatus;
  localVersion: number | null;
  lastServerVersion: number | null;
}): NonNullable<Workshop2DossierPhase1['sseRealtimeMirror']> {
  const offline = input.connectionStatus === 'offline';
  const pollingOnly = input.transport === 'polling' && !offline;
  const blockerSampleOrder = offline;
  const blockerHandoff = offline;

  let hintRu: string | undefined;
  if (offline) {
    hintRu =
      'Realtime офлайн — досье не синхронизируется с сервером; заказ образца и handoff только после online/SSE.';
  } else if (pollingOnly) {
    hintRu = 'SSE недоступен — polling fallback 30 с; merge policy не затирает форму при focus.';
  }

  return {
    mirroredAt: new Date().toISOString(),
    transport: input.transport,
    connectionStatus: input.connectionStatus,
    localVersion: input.localVersion,
    lastServerVersion: input.lastServerVersion,
    mergePolicyRespected: true,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function persistWorkshop2SseRealtimeMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: Parameters<typeof buildWorkshop2SseRealtimeMirror>[0]
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    sseRealtimeMirror: buildWorkshop2SseRealtimeMirror(input),
  };
}

export function evaluateWorkshop2SseRealtimeSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.sseRealtimeMirror;
  if (!mirror) {
    return {
      id: 'sse.realtime.mirror_missing',
      severity: 'warning',
      messageRu: 'Realtime snapshot не в досье — откройте артикул после подключения SSE/polling.',
    };
  }
  const blockerSampleOrder =
    mirror.blockerSampleOrder === true ||
    workshop2PgMirrorStr(mirror, 'blockerSampleOrder') === 'true';
  if (blockerSampleOrder) {
    return {
      id: 'sse.realtime.offline',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Realtime офлайн — заказ образца на сервере заблокирован до восстановления связи.',
    };
  }
  const transport = workshop2PgMirrorStr(mirror, 'transport') || String(mirror.transport ?? '');
  if (transport === 'polling') {
    return {
      id: 'sse.realtime.polling_fallback',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Используется polling fallback — проверьте SSE endpoint.',
    };
  }
  return null;
}

export function evaluateWorkshop2SseRealtimeHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.sseRealtimeMirror;
  if (!mirror) {
    return {
      id: 'sse.realtime.mirror_missing_handoff',
      severity: 'warning',
      messageRu: 'Realtime snapshot не в досье — обновите перед передачей в цех.',
    };
  }
  const blockerHandoff =
    mirror.blockerHandoff === true || workshop2PgMirrorStr(mirror, 'blockerHandoff') === 'true';
  if (blockerHandoff) {
    return {
      id: 'sse.realtime.offline_handoff',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') || 'Realtime офлайн — handoff commit заблокирован.',
    };
  }
  return null;
}
