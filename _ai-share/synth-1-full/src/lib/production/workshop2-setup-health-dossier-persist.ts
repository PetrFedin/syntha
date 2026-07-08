/**
 * Wave 20 #5: зеркало setup health в досье + gate sample-order при PG down.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import {
  buildWorkshop2SetupHealthRows,
  type Workshop2SetupHealthInput,
} from '@/lib/production/workshop2-setup-health-summary';

export function buildWorkshop2SetupHealthMirrorFromHealthApi(
  input: Workshop2SetupHealthInput
): NonNullable<Workshop2DossierPhase1['setupHealthMirror']> {
  const postgres =
    input.postgres === 'ok' ? 'ok' : input.postgres === 'disabled' ? 'disabled' : 'down';
  const blockerSampleOrder = postgres !== 'ok';
  let hintRu: string | undefined;
  if (postgres === 'disabled') {
    hintRu = 'WORKSHOP2_DATABASE_URL не задан — sample-order только local.';
  } else if (postgres === 'down') {
    hintRu = 'PostgreSQL недоступен — проверьте setup health перед заказом образца.';
  }

  return {
    mirroredAt: new Date().toISOString(),
    postgres,
    healthOk: Boolean(input.healthOk),
    storeMode: input.storeMode,
    blockerSampleOrder,
    blockerHandoff: blockerSampleOrder,
    hintRu,
  };
}

export function evaluateWorkshop2SetupHealthHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.setupHealthMirror;
  if (!mirror) {
    return {
      id: 'setup.health.mirror_missing_handoff',
      severity: 'warning',
      messageRu: 'Health setup не зафиксирован в досье — обновите зеркало перед handoff commit.',
    };
  }
  if (mirror.blockerHandoff === true || workshop2PgMirrorStr(mirror, 'blockerHandoff') === 'true') {
    return {
      id: 'setup.health.pg_down_handoff',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'PostgreSQL недоступен — передача в цех заблокирована до восстановления PG.',
    };
  }
  return null;
}

export function persistWorkshop2SetupHealthMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  health: Workshop2SetupHealthInput
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    setupHealthMirror: buildWorkshop2SetupHealthMirrorFromHealthApi(health),
  };
}

export function evaluateWorkshop2SetupHealthSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.setupHealthMirror;
  if (!mirror) {
    return {
      id: 'setup.health.mirror_missing',
      severity: 'warning',
      messageRu:
        'Health setup не зафиксирован в досье — откройте артикул после проверки /setup или обновите зеркало.',
    };
  }
  if (
    mirror.blockerSampleOrder === true ||
    workshop2PgMirrorStr(mirror, 'blockerSampleOrder') === 'true'
  ) {
    return {
      id: 'setup.health.pg_down',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'PostgreSQL недоступен — заказ образца на сервере заблокирован до восстановления PG.',
    };
  }
  return null;
}

/** Удобная обёртка: health JSON + pg counts → mirror. */
export function buildWorkshop2SetupHealthMirrorFromRows(
  input: Workshop2SetupHealthInput
): NonNullable<Workshop2DossierPhase1['setupHealthMirror']> {
  void buildWorkshop2SetupHealthRows(input);
  return buildWorkshop2SetupHealthMirrorFromHealthApi(input);
}
