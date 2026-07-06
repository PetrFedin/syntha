/**
 * Lab dip status updates → dossier.colorLabDipStatuses + mirror.
 */
import { buildColorwayRowsFromDossier } from '@/lib/production/workshop2-colorway-palette';
import type { LabDipStatus } from '@/lib/types/material-engineering';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { persistWorkshop2LabDipMirrorToDossier } from '@/lib/production/workshop2-lab-dip-dossier-persist';
import { resolveColorLabDipKeyForColorway } from '@/lib/production/workshop2-colorway-lab-dip-sync';

export function parseWorkshop2LabDipId(id: string): { paletteCode: string; idx: number } | null {
  const m = /^ld-(.+)-(\d+)$/.exec(id.trim());
  if (!m) return null;
  const idx = Number(m[2]);
  if (!Number.isFinite(idx)) return null;
  return { paletteCode: m[1]!, idx };
}

function resolveLabDipPaletteKey(
  dossier: Workshop2DossierPhase1,
  paletteCode: string
): string | null {
  const code = paletteCode.trim();
  if (!code) return null;
  const statuses = dossier.colorLabDipStatuses ?? {};
  if (statuses[code] != null) return code;
  const rows = buildColorwayRowsFromDossier(dossier);
  const byPalette = rows.find((r) => r.paletteCode === code);
  if (byPalette) return resolveColorLabDipKeyForColorway(byPalette);
  const byLabel = rows.find((r) => r.label === code || r.label.slice(0, 3).toUpperCase() === code);
  if (byLabel) return resolveColorLabDipKeyForColorway(byLabel);
  return code;
}

export function applyWorkshop2LabDipStatusUpdate(input: {
  dossier: Workshop2DossierPhase1;
  paletteCode: string;
  status: LabDipStatus;
}): Workshop2DossierPhase1 {
  const key = resolveLabDipPaletteKey(input.dossier, input.paletteCode);
  if (!key) {
    return input.dossier;
  }
  const statuses = { ...(input.dossier.colorLabDipStatuses ?? {}) };
  statuses[key] = input.status;
  return persistWorkshop2LabDipMirrorToDossier({
    ...input.dossier,
    colorLabDipStatuses: statuses,
    colorLabDipSyncedAt: new Date().toISOString(),
  });
}
