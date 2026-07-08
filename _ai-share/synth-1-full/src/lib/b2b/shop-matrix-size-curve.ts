/**
 * Size curve SoT для shop pre-pack: W2 POM grid → weights, fallback demo curve.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { ensureWorkshop2ProductionModel } from '@/lib/production/workshop2-production-model-from-dossier';
import {
  DEFAULT_SHOP_MATRIX_SIZE_CURVE,
  SHOP_MATRIX_SIZE_CURVE_SIZES,
  type ShopMatrixSizeCurve,
} from '@/lib/b2b/shop-matrix-prepack-curve';

export type ShopMatrixSizeCurveSource = 'w2_sample_grid' | 'w2_pom' | 'default';

export type ShopMatrixSizeCurveView = {
  collectionId: string;
  articleId: string;
  source: ShopMatrixSizeCurveSource;
  sizes: string[];
  curve: Record<string, number>;
  packSize: number;
};

const SIZE_ALIASES: Record<string, string> = {
  XXS: 'XS',
  XXL: 'XXL',
  '2XL': 'XL',
  '3XL': 'XXL',
};

export function normalizeShopMatrixSizeLabel(raw: string): string {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if ((SHOP_MATRIX_SIZE_CURVE_SIZES as readonly string[]).includes(upper)) return upper;
  if (SIZE_ALIASES[upper]) return SIZE_ALIASES[upper];
  return trimmed;
}

function curveFromSizeKeys(sizeKeys: string[]): Record<string, number> | null {
  if (sizeKeys.length < 2) return null;
  const curve: Record<string, number> = {};
  for (const key of sizeKeys) {
    const label = normalizeShopMatrixSizeLabel(key);
    curve[label] = (curve[label] ?? 0) + 1;
  }
  return Object.keys(curve).length >= 2 ? curve : null;
}

/** Extract weights from W2 dossier (sample grid / POM), else default Aptos curve. */
export function extractShopMatrixSizeCurveFromDossier(dossier: Workshop2DossierPhase1): {
  curve: Record<string, number>;
  sizes: string[];
  source: ShopMatrixSizeCurveSource;
} {
  const gridKeys = Object.keys(dossier.sampleBasePerSizeDimensions ?? {});
  const fromGrid = curveFromSizeKeys(gridKeys);
  if (fromGrid) {
    return {
      curve: fromGrid,
      sizes: Object.keys(fromGrid),
      source: 'w2_sample_grid',
    };
  }

  const model = ensureWorkshop2ProductionModel(dossier);
  const pomSizes = [
    ...new Set(
      (model.measurements ?? []).map((m) => normalizeShopMatrixSizeLabel(m.size)).filter(Boolean)
    ),
  ];
  const fromPom = curveFromSizeKeys(pomSizes);
  if (fromPom) {
    return { curve: fromPom, sizes: Object.keys(fromPom), source: 'w2_pom' };
  }

  return {
    curve: { ...DEFAULT_SHOP_MATRIX_SIZE_CURVE },
    sizes: [...SHOP_MATRIX_SIZE_CURVE_SIZES],
    source: 'default',
  };
}

export function packSizeFromCurve(curve: Record<string, number>): number {
  return Object.values(curve).reduce((s, n) => s + (n > 0 ? n : 0), 0) || 12;
}

export function toShopMatrixSizeCurveView(input: {
  collectionId: string;
  articleId: string;
  dossier: Workshop2DossierPhase1;
}): ShopMatrixSizeCurveView {
  const extracted = extractShopMatrixSizeCurveFromDossier(input.dossier);
  return {
    collectionId: input.collectionId,
    articleId: input.articleId,
    source: extracted.source,
    sizes: extracted.sizes,
    curve: extracted.curve,
    packSize: packSizeFromCurve(extracted.curve),
  };
}

export function mergeCurveIntoStandardGrid(curve: Record<string, number>): ShopMatrixSizeCurve {
  const out = { ...DEFAULT_SHOP_MATRIX_SIZE_CURVE };
  for (const size of SHOP_MATRIX_SIZE_CURVE_SIZES) {
    out[size] = curve[size] ?? 0;
  }
  for (const [size, weight] of Object.entries(curve)) {
    if (!(size in out) && weight > 0) {
      (out as Record<string, number>)[size] = weight;
    }
  }
  return out;
}
