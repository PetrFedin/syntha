/**
 * Wave 27 #26: зеркало operational↔ТЗ focus % + gates sample-order / handoff-commit.
 */
import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';
import { calculateDossierReadiness } from '@/lib/production/dossier-readiness-engine';
import {
  TAB_SOURCE_SECTIONS,
  WORKSHOP2_OPERATIONAL_PIPELINE_TABS,
  type Workshop2OperationalPipelineTab,
} from '@/lib/production/workshop2-article-operational-tz-bridge';
import { WORKSHOP2_OPERATIONAL_TZ_SYNC_MIN_FOCUS_PCT } from '@/lib/production/workshop2-operational-tz-sync-gate';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

function tabFocusPct(
  tab: Workshop2OperationalPipelineTab,
  dossier: Workshop2DossierPhase1,
  leaf: HandbookCategoryLeaf | null | undefined
): number {
  const r = calculateDossierReadiness(dossier, leaf ?? null);
  const secs = TAB_SOURCE_SECTIONS[tab];
  if (secs.length === 0) return 0;
  const sum = secs.reduce((a, s) => a + (r.sections[s]?.pct ?? 0), 0);
  return Math.round(sum / secs.length);
}

export function buildWorkshop2OperationalTzMirror(
  dossier: Workshop2DossierPhase1,
  leaf: HandbookCategoryLeaf | null | undefined
): NonNullable<Workshop2DossierPhase1['operationalTzMirror']> {
  const tabFocusPctMap: Record<string, number> = {};
  for (const tab of WORKSHOP2_OPERATIONAL_PIPELINE_TABS) {
    tabFocusPctMap[tab] = tabFocusPct(tab, dossier, leaf);
  }
  const values = Object.values(tabFocusPctMap);
  const minFocusPct = values.length > 0 ? Math.min(...values) : 0;
  const supplyFocus = tabFocusPctMap.supply ?? 0;
  const blockerSampleOrder = supplyFocus < WORKSHOP2_OPERATIONAL_TZ_SYNC_MIN_FOCUS_PCT;
  const blockerHandoff = minFocusPct < WORKSHOP2_OPERATIONAL_TZ_SYNC_MIN_FOCUS_PCT;

  let hintRu: string | undefined;
  if (blockerSampleOrder) {
    hintRu = `Снабжение: ТЗ заполнено на ${supplyFocus}% — минимум ${WORKSHOP2_OPERATIONAL_TZ_SYNC_MIN_FOCUS_PCT}% для sync и образца.`;
  } else if (blockerHandoff) {
    hintRu = `Операционные вкладки: минимум ${minFocusPct}% focus — дозаполните ТЗ перед handoff.`;
  }

  return {
    mirroredAt: new Date().toISOString(),
    tabFocusPct: tabFocusPctMap,
    minFocusPct,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function persistWorkshop2OperationalTzMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  leaf: HandbookCategoryLeaf | null | undefined
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    operationalTzMirror: buildWorkshop2OperationalTzMirror(dossier, leaf),
  };
}

export function evaluateWorkshop2OperationalTzSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.operationalTzMirror;
  if (!mirror) {
    return {
      id: 'operational.tz.mirror_missing',
      severity: 'warning',
      messageRu: 'Operational↔ТЗ не в PG — «TZ bridge → PG» на операционной вкладке.',
    };
  }
  const blockerSampleOrder =
    mirror.blockerSampleOrder === true ||
    workshop2PgMirrorStr(mirror, 'blockerSampleOrder') === 'true';
  const hintRu = workshop2PgMirrorStr(mirror, 'hintRu');
  const tabFocusPctRaw = mirror.tabFocusPct;
  const supplyFocus =
    typeof tabFocusPctRaw === 'object' &&
    tabFocusPctRaw != null &&
    !Array.isArray(tabFocusPctRaw) &&
    'supply' in tabFocusPctRaw
      ? Number((tabFocusPctRaw as Record<string, unknown>).supply) || 0
      : workshop2PgMirrorNum(mirror, 'supplyFocusPct');

  if (blockerSampleOrder) {
    return {
      id: 'operational.tz.supply_focus_low',
      severity: 'warning',
      messageRu:
        hintRu || `Снабжение: focus ТЗ ${supplyFocus}% — синхронизация и образец рискованы.`,
    };
  }
  return null;
}

export function evaluateWorkshop2OperationalTzHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.operationalTzMirror;
  if (!mirror) return null;
  const blockerHandoff =
    mirror.blockerHandoff === true || workshop2PgMirrorStr(mirror, 'blockerHandoff') === 'true';
  if (!blockerHandoff) return null;
  const minFocusPct = workshop2PgMirrorNum(mirror, 'minFocusPct');
  return {
    id: 'operational.tz.min_focus_low',
    severity: 'warning',
    messageRu:
      workshop2PgMirrorStr(mirror, 'hintRu') ||
      `Операционный мост: минимум ${minFocusPct}% focus по вкладкам — проверьте ТЗ перед commit.`,
  };
}
