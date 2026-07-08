/**
 * Wave 27 #43: зеркало tech pack visual gate + export-tz / handoff-commit.
 */
import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';
import {
  evaluateWorkshop2TechPackVisualGateSummary,
  type Workshop2TechPackVisualGateSummary,
} from '@/lib/production/workshop2-tech-pack-visual-gate-summary';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2TechPackVisualMirror(
  dossier: Workshop2DossierPhase1,
  opts?: {
    categoryLeaf?: HandbookCategoryLeaf | null;
    sessionBlobById?: Record<string, string>;
  }
): NonNullable<Workshop2DossierPhase1['techPackVisualMirror']> {
  const tech = evaluateWorkshop2TechPackVisualGateSummary(dossier, opts) ?? emptyTechPackSummary();
  const blockerExport = tech.state === 'empty' || tech.openVisualGateCount > 0;
  const blockerHandoff = blockerExport;

  return {
    mirroredAt: new Date().toISOString(),
    attachmentCount: tech.attachmentCount,
    attachmentsWithZipBytes: tech.attachmentsWithZipBytes,
    openVisualGateCount: tech.openVisualGateCount,
    state: tech.state,
    blockerExport,
    blockerHandoff,
    hintRu: tech.hintRu,
  };
}

function emptyTechPackSummary(): Workshop2TechPackVisualGateSummary {
  return {
    attachmentCount: 0,
    attachmentsWithZipBytes: 0,
    verifiedCanonicalCount: 0,
    openVisualGateCount: 0,
    state: 'empty',
    hintRu: 'Нет вложений tech pack — загрузите CAD/PDF на конструкции.',
    visualGateMessages: [],
  };
}

export function persistWorkshop2TechPackVisualMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  opts?: {
    categoryLeaf?: HandbookCategoryLeaf | null;
    sessionBlobById?: Record<string, string>;
  }
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    techPackVisualMirror: buildWorkshop2TechPackVisualMirror(dossier, opts),
  };
}

function checkFromMirror(
  mirror: NonNullable<Workshop2DossierPhase1['techPackVisualMirror']>,
  ids: { empty: string; visual: string },
  handoff?: boolean
): Workshop2HandoffReadinessCheck | null {
  const state = workshop2PgMirrorStr(mirror, 'state') || String(mirror.state ?? '');
  const hintRu = workshop2PgMirrorStr(mirror, 'hintRu');
  const openVisualGateCount = workshop2PgMirrorNum(mirror, 'openVisualGateCount');

  if (state === 'empty') {
    return {
      id: ids.empty,
      severity: 'blocker',
      messageRu:
        hintRu ||
        (handoff
          ? 'Нет вложений tech pack — добавьте CAD/PDF на конструкции.'
          : 'ZIP ТЗ: нет вложений tech pack на конструкции.'),
    };
  }
  if (openVisualGateCount > 0) {
    return {
      id: ids.visual,
      severity: 'blocker',
      messageRu: hintRu || `Визуальный gate: ${openVisualGateCount} открытых предупреждений.`,
    };
  }
  return null;
}

export function evaluateWorkshop2TechPackVisualExportGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.techPackVisualMirror;
  if (!mirror) return null;
  return checkFromMirror(mirror, {
    empty: 'export.tech_pack.empty',
    visual: 'export.tech_pack.visual_gate',
  });
}

export function evaluateWorkshop2TechPackVisualHandoffGate(
  dossier: Workshop2DossierPhase1,
  opts?: {
    categoryLeaf?: HandbookCategoryLeaf | null;
    sessionBlobById?: Record<string, string>;
  }
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.techPackVisualMirror;
  if (!mirror) {
    const live = evaluateWorkshop2TechPackVisualGateSummary(dossier, opts);
    if (!live || live.state === 'ready') return null;
    if (live.state === 'empty') {
      return {
        id: 'construction.tech_pack.empty',
        severity: 'blocker',
        messageRu: live.hintRu ?? 'Нет вложений tech pack — добавьте CAD/PDF на конструкции.',
      };
    }
    if (live.openVisualGateCount > 0) {
      return {
        id: 'construction.tech_pack.visual_gate',
        severity: 'blocker',
        messageRu:
          live.hintRu ?? `Визуальный gate: ${live.openVisualGateCount} открытых предупреждений.`,
      };
    }
    return null;
  }
  if (!mirror.blockerHandoff) return null;
  return checkFromMirror(
    mirror,
    { empty: 'construction.tech_pack.empty', visual: 'construction.tech_pack.visual_gate' },
    true
  );
}
