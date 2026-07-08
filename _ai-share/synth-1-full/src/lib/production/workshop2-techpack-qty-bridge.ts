/**
 * Qty bridge: Working Order / matrix → factory pack sheet 6 (color × size).
 * SoT для PO — B2B; досье даёт fallback по sample grid × colorways.
 */
import type { WorkingOrderRow } from '@/lib/b2b/working-order-version.types';
import { partitionHandbookAndFree } from '@/lib/production/workshop2-phase1-attribute-partition';
import { resolvedHandbookDisplayLabel } from '@/lib/production/workshop2-resolved-handbook-display-label';
import { buildColorwayRowsFromDossier } from '@/lib/production/workshop2-colorway-palette';
import type { Workshop2TechPackQtyBridgeRow } from '@/lib/production/workshop2-techpack-export-sheets';

import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

/** Minimal cart line shape (shop matrix session / API). */
export type TechPackMatrixCartLine = {
  collectionId: string;
  articleId: string;
  colorCode: string;
  size: string;
  qty: number;
};

export type Workshop2TechPackQtyBridgeSource =
  | 'working_order'
  | 'cart_matrix'
  | 'dossier_color_size'
  | 'dossier_size_only'
  | 'none';

export type Workshop2TechPackQtyBridgeResult = {
  rows: Workshop2TechPackQtyBridgeRow[];
  source: Workshop2TechPackQtyBridgeSource;
  noteRu: string;
};

const WORKING_ORDER_QTY_COLUMNS = [
  'Qty XXS',
  'Qty XS',
  'Qty S',
  'Qty M',
  'Qty L',
  'Qty XL',
  'Qty XXL',
] as const;

function parseQtyCell(raw: string | undefined): number | null {
  const n = parseInt(String(raw ?? '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function sizeLabelFromQtyColumn(col: string): string {
  return col.replace(/^Qty\s+/i, '').trim();
}

/** Working Order CSV rows → color × size qty (filter by SKU/style if given). */
export function parseWorkingOrderRowsToTechPackQty(
  rows: WorkingOrderRow[],
  filter?: { articleSku?: string; articleId?: string }
): Workshop2TechPackQtyBridgeRow[] {
  const skuNeedle = filter?.articleSku?.trim().toLowerCase();
  const idNeedle = filter?.articleId?.trim().toLowerCase();
  const out: Workshop2TechPackQtyBridgeRow[] = [];

  for (const row of rows) {
    const sku = (row.SKU ?? row.Style ?? '').trim();
    const skuLower = sku.toLowerCase();
    if (skuNeedle || idNeedle) {
      const match =
        (skuNeedle && (skuLower === skuNeedle || skuLower.includes(skuNeedle))) ||
        (idNeedle && (skuLower === idNeedle || skuLower.includes(idNeedle)));
      if (sku && !match) continue;
    }
    const colorLabel = (row.Color ?? 'Core').trim() || 'Core';
    for (const col of WORKING_ORDER_QTY_COLUMNS) {
      const qty = parseQtyCell(row[col]);
      if (qty == null) continue;
      out.push({ colorLabel, sizeLabel: sizeLabelFromQtyColumn(col), qty });
    }
  }
  return out;
}

/** Shop matrix cart session → color × size qty. */
export function parseCartLinesToTechPackQty(
  lines: TechPackMatrixCartLine[],
  filter?: { articleId?: string; collectionId?: string }
): Workshop2TechPackQtyBridgeRow[] {
  const articleNeedle = filter?.articleId?.trim().toLowerCase();
  const collectionNeedle = filter?.collectionId?.trim().toUpperCase();
  const out: Workshop2TechPackQtyBridgeRow[] = [];
  for (const line of lines) {
    if (collectionNeedle && line.collectionId.trim().toUpperCase() !== collectionNeedle) continue;
    if (articleNeedle && line.articleId.trim().toLowerCase() !== articleNeedle) continue;
    if (line.qty <= 0) continue;
    const colorLabel =
      line.colorCode.trim() && line.colorCode.trim().toLowerCase() !== 'default'
        ? line.colorCode.trim()
        : 'Core';
    out.push({
      colorLabel,
      sizeLabel: line.size.trim() || 'M',
      qty: Math.floor(line.qty),
    });
  }
  return out;
}

function dossierSizeQtyRows(dossier: Workshop2DossierPhase1): { sizeLabel: string; qty: number }[] {
  const assign = dossier.assignments?.find(
    (a) => a.kind === 'canonical' && a.attributeId === 'sampleBaseSize'
  );
  const { hbs } = partitionHandbookAndFree(assign);
  const out: { sizeLabel: string; qty: number }[] = [];
  for (const hb of hbs) {
    if (!hb.parameterId) continue;
    const qtyRaw = dossier.sampleBasePerSizePieceQty?.[hb.parameterId];
    if (typeof qtyRaw !== 'number' || !Number.isFinite(qtyRaw) || qtyRaw <= 0) continue;
    out.push({
      sizeLabel: resolvedHandbookDisplayLabel('sampleBaseSize', hb.parameterId, hb.displayLabel),
      qty: Math.floor(qtyRaw),
    });
  }
  return out;
}

/** Fallback: colorways × dossier per-size qty. */
export function buildTechPackQtyFromDossier(
  dossier: Workshop2DossierPhase1
): Workshop2TechPackQtyBridgeResult {
  const sizeRows = dossierSizeQtyRows(dossier);
  if (!sizeRows.length) {
    return {
      rows: [],
      source: 'none',
      noteRu: 'Qty color×size: заполните working order / shop matrix или qty по размерам в досье.',
    };
  }
  const colorways = buildColorwayRowsFromDossier(dossier);
  const colors = colorways.length ? colorways.map((c) => c.label) : ['Core'];
  if (colors.length > 1) {
    const rows: Workshop2TechPackQtyBridgeRow[] = [];
    for (const colorLabel of colors) {
      for (const s of sizeRows) {
        rows.push({ colorLabel, sizeLabel: s.sizeLabel, qty: s.qty });
      }
    }
    return {
      rows,
      source: 'dossier_color_size',
      noteRu: 'Qty: досье (размеры) × colorways — для PO сверьте с shop matrix.',
    };
  }
  return {
    rows: sizeRows.map((s) => ({
      colorLabel: colors[0]!,
      sizeLabel: s.sizeLabel,
      qty: s.qty,
    })),
    source: 'dossier_size_only',
    noteRu: 'Qty по размерам из досье; color×size — из working order / matrix.',
  };
}

export function buildWorkshop2TechPackQtyBridge(input: {
  dossier: Workshop2DossierPhase1;
  workingOrderRows?: WorkingOrderRow[];
  cartLines?: TechPackMatrixCartLine[];
  articleSku?: string;
  articleId?: string;
  collectionId?: string;
  matrixHref?: string;
}): Workshop2TechPackQtyBridgeResult {
  const fromWo = input.workingOrderRows?.length
    ? parseWorkingOrderRowsToTechPackQty(input.workingOrderRows, {
        articleSku: input.articleSku,
        articleId: input.articleId,
      })
    : [];
  if (fromWo.length) {
    return {
      rows: fromWo,
      source: 'working_order',
      noteRu: input.matrixHref
        ? `Qty color×size из Working Order · сверка: ${input.matrixHref}`
        : 'Qty color×size из Working Order (последняя версия).',
    };
  }
  const fromCart = input.cartLines?.length
    ? parseCartLinesToTechPackQty(input.cartLines, {
        articleId: input.articleId,
        collectionId: input.collectionId,
      })
    : [];
  if (fromCart.length) {
    return {
      rows: fromCart,
      source: 'cart_matrix',
      noteRu: input.matrixHref
        ? `Qty color×size из shop matrix cart · ${input.matrixHref}`
        : 'Qty color×size из shop matrix cart session.',
    };
  }
  return buildTechPackQtyFromDossier(input.dossier);
}
