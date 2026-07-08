/**
 * Wave 26 #41: зеркало sketch coverage + gates export-tz / handoff-commit.
 */
import {
  evaluateWorkshop2SketchCoverage,
  type Workshop2SketchCoverageSummary,
} from '@/lib/production/workshop2-sketch-coverage';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2SketchCoverageMirror(
  dossier: Workshop2DossierPhase1,
  categoryLeafId: string
): NonNullable<Workshop2DossierPhase1['sketchCoverageMirror']> {
  const coverage =
    evaluateWorkshop2SketchCoverage(dossier, categoryLeafId) ?? emptySketchCoverage();
  const blockerExport = coverage.state === 'empty' || coverage.state === 'partial';
  const blockerHandoff = blockerExport;

  return {
    mirroredAt: new Date().toISOString(),
    categoryLeafId,
    sheetCount: coverage.sheetCount,
    sheetsWithImage: coverage.sheetsWithImage,
    sketchPinTotal: coverage.sketchPinTotal,
    bomRefCount: coverage.bomRefCount,
    hasRevisionSnapshot: coverage.hasRevisionSnapshot,
    state: coverage.state,
    blockerExport,
    blockerHandoff,
    hintRu: coverage.hintRu,
  };
}

function emptySketchCoverage(): Workshop2SketchCoverageSummary {
  return {
    hasCanonImage: false,
    sheetCount: 0,
    sheetsWithImage: 0,
    sketchPinTotal: 0,
    bomRefCount: 0,
    hasRevisionSnapshot: false,
    bomStripState: 'na',
    state: 'empty',
    hintRu: 'Нет изображения скетча — загрузите канон или лист с подложкой.',
  };
}

export function persistWorkshop2SketchCoverageMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  categoryLeafId: string
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    sketchCoverageMirror: buildWorkshop2SketchCoverageMirror(dossier, categoryLeafId),
  };
}

function checkFromMirror(
  mirror: NonNullable<Workshop2DossierPhase1['sketchCoverageMirror']>,
  ids: { empty: string; partial: string },
  messageHandoff?: boolean
): Workshop2HandoffReadinessCheck | null {
  const state = workshop2PgMirrorStr(mirror, 'state') || String(mirror.state ?? '');
  const hintRu = workshop2PgMirrorStr(mirror, 'hintRu');
  if (state === 'empty') {
    return {
      id: ids.empty,
      severity: 'blocker',
      messageRu:
        hintRu ||
        (messageHandoff
          ? 'Скетч не готов — загрузите канон или лист с подложкой перед передачей в цех.'
          : 'ZIP ТЗ: нет скетча — загрузите канон или лист с подложкой.'),
    };
  }
  if (state === 'partial') {
    return {
      id: ids.partial,
      severity: 'blocker',
      messageRu:
        hintRu ||
        (messageHandoff
          ? 'Скетч частично готов — расставьте метки BOM и зафиксируйте ревизию.'
          : 'ZIP ТЗ: скетч неполный — метки BOM и ревизия обязательны.'),
    };
  }
  return null;
}

export function evaluateWorkshop2SketchCoverageExportGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.sketchCoverageMirror;
  if (!mirror) return null;
  return checkFromMirror(mirror, {
    empty: 'export.sketch.empty',
    partial: 'export.sketch.partial',
  });
}

export function evaluateWorkshop2SketchCoverageHandoffGate(
  dossier: Workshop2DossierPhase1,
  categoryLeafId?: string | null
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.sketchCoverageMirror;
  if (!mirror) {
    const live = evaluateWorkshop2SketchCoverage(dossier, categoryLeafId);
    if (!live || live.state === 'ready') return null;
    if (live.state === 'empty') {
      return {
        id: 'construction.sketch.empty',
        severity: 'blocker',
        messageRu:
          live.hintRu ??
          'Скетч не готов — загрузите канон или лист с подложкой перед передачей в цех.',
      };
    }
    return {
      id: 'construction.sketch.partial',
      severity: 'blocker',
      messageRu:
        live.hintRu ?? 'Скетч частично готов — расставьте метки BOM и зафиксируйте ревизию.',
    };
  }
  if (mirror.blockerHandoff !== true && workshop2PgMirrorStr(mirror, 'blockerHandoff') !== 'true') {
    return null;
  }
  return checkFromMirror(
    mirror,
    {
      empty: 'construction.sketch.empty',
      partial: 'construction.sketch.partial',
    },
    true
  );
}
