import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { buildWorkshop2FinalTzExportContextFromDossier } from '@/lib/production/workshop2-final-tz-spec-export';
import { parseMatRowsFromDossier } from '@/lib/production/workshop2-material-mat-rows';
import { getWorkshop2B2bChainStatus } from '@/lib/server/workshop2-b2b-production-handoff';

export type ShopFloorBundleInput = {
  collectionId: string;
  articleId: string;
  b2bOrderId?: string;
  dossier: Workshop2DossierPhase1;
};

/** Plain-text bundle for shop-floor (download alongside print). */
export async function buildPlatformCoreShopFloorBundleText(
  input: ShopFloorBundleInput
): Promise<string> {
  const { collectionId, articleId, dossier } = input;
  const exportCtx = buildWorkshop2FinalTzExportContextFromDossier(dossier, {
    articleId,
    exportLanguage: 'ru_en',
  });

  const lines: string[] = [
    '=== SHOP FLOOR BUNDLE ===',
    `Generated: ${new Date().toISOString()}`,
    `Collection: ${collectionId}`,
    `Article: ${articleId}`,
    `SKU: ${exportCtx.articleSku ?? '—'}`,
    '',
  ];

  const orderId = input.b2bOrderId?.trim();
  if (orderId) {
    lines.push(`B2B order: ${orderId}`);
    const chain = await getWorkshop2B2bChainStatus(orderId);
    if (chain) {
      lines.push(`Order status: ${chain.status}`);
      if (chain.productionOrderId) lines.push(`Production PO: ${chain.productionOrderId}`);
      if (chain.factoryId) lines.push(`Factory: ${chain.factoryId}`);
      if (chain.poStatusLabelRu) lines.push(`ERP: ${chain.poStatusLabelRu}`);
      if (chain.dossierDiff?.dossierVersionAtHandoff != null) {
        lines.push(`Dossier at handoff: v${chain.dossierDiff.dossierVersionAtHandoff}`);
      }
    }
    lines.push('');
  }

  const productName = exportCtx.articleSku || articleId;
  lines.push(`Product: ${productName}`);
  lines.push('');

  const matRows = parseMatRowsFromDossier(dossier, new Map());
  if (matRows.length > 0) {
    lines.push('--- MATERIALS (BOM) ---');
    for (const row of matRows) {
      lines.push(`- ${row.label} ${row.pct > 0 ? `${row.pct}%` : ''}`.trim());
    }
    lines.push('');
  }

  lines.push('--- NOTES ---');
  lines.push('Use browser Print for full TZ layout; this bundle is for floor / ERP handoff.');
  return lines.join('\n');
}
