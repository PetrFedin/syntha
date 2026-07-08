import 'server-only';

import type { ShopMatrixArticleInspectorView } from '@/lib/b2b/shop-matrix-article-inspector.types';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  getWorkshop2ShowroomCampaign,
  listWorkshop2PublishedShowroomArticles,
  type Workshop2PublishedShowroomArticle,
} from '@/lib/server/workshop2-showroom-repository';
import { resolveWorkshop2B2bArticleHeroImageUrl } from '@/lib/production/workshop2-b2b-article-hero-image';

function readAssignmentLabel(
  dossier: Workshop2DossierPhase1,
  attributeIds: string[]
): string | undefined {
  for (const attributeId of attributeIds) {
    const hit = dossier.assignments?.find((a) => a.attributeId === attributeId);
    const label = hit?.values?.[0]?.displayLabel?.trim();
    if (label) return label;
  }
  return undefined;
}

function buildCompositionSummary(dossier: Workshop2DossierPhase1): string | undefined {
  const fromAssignment = readAssignmentLabel(dossier, [
    'composition',
    'fiber_composition',
    'main_composition',
    'mat_composition',
  ]);
  if (fromAssignment) return fromAssignment;

  const lines = dossier.productionModel?.materialLines ?? [];
  const parts = lines
    .filter((l) => l.isPrimary !== false)
    .slice(0, 3)
    .map((l) => {
      const pct = l.percentage != null ? `${l.percentage}% ` : '';
      const comp = l.compositionText?.trim();
      if (comp) return `${pct}${comp}`.trim();
      return l.materialName?.trim();
    })
    .filter(Boolean);
  if (parts.length) return parts.join(' · ');

  const extra = dossier.compositionLabelSpec?.extraLegalLines?.trim();
  return extra || undefined;
}

function buildSizeSchemaNote(dossier: Workshop2DossierPhase1): string | undefined {
  const sizeLabel = readAssignmentLabel(dossier, ['size_range', 'size_schema', 'size_chart']);
  if (sizeLabel) return sizeLabel;
  const moqPieces = dossier.passportProductionBrief?.moqTargetMaxPieces;
  if (moqPieces != null) return `MOQ target: до ${moqPieces} размеров`;
  return undefined;
}

export function extractShopMatrixArticleInspectorView(input: {
  collectionId: string;
  articleId: string;
  dossier: Workshop2DossierPhase1;
  published?: Workshop2PublishedShowroomArticle | null;
  campaignPublished?: boolean;
}): ShopMatrixArticleInspectorView {
  const { collectionId, articleId, dossier } = input;
  const brief = dossier.passportProductionBrief;
  const published = input.published;
  const fabricLines =
    dossier.productionModel?.materialLines?.slice(0, 5).map((line) => ({
      materialName: line.materialName,
      compositionText: line.compositionText,
      supplier: line.supplier,
      role: line.role,
      isPrimary: line.isPrimary,
    })) ?? [];

  const supplierNotes = [
    brief?.sewingEnterprisesCustomNote?.trim(),
    brief?.sewingRegionPlanNote?.trim(),
  ].filter(Boolean);

  return {
    collectionId,
    articleId,
    name: published?.name?.trim() || brief?.articleCardOwnerName?.trim() || articleId,
    sku: published?.sku?.trim() || articleId,
    heroImageUrl:
      published?.heroImageUrl || resolveWorkshop2B2bArticleHeroImageUrl(dossier) || undefined,
    wholesalePriceRub: published?.wholesalePriceRub ?? brief?.targetFob ?? 0,
    msrpRub: published?.msrpRub ?? brief?.targetRetailPrice,
    moq: published?.moq ?? brief?.moqTargetMaxPieces,
    campaignName: published?.campaignName,
    supplierModelNote: supplierNotes.join(' · ') || undefined,
    sewingRegionNote: brief?.sewingRegionPlanNote?.trim() || undefined,
    compositionSummary: buildCompositionSummary(dossier),
    sizeSchemaNote: buildSizeSchemaNote(dossier),
    fabricLines,
    lifecycleLabel: dossier.lifecycleState || undefined,
    published: input.campaignPublished ?? Boolean(published),
  };
}

/** Shop-safe BFF: только опубликованные артикулы коллекции. */
export async function loadShopMatrixArticleInspectorView(input: {
  collectionId: string;
  articleId: string;
}): Promise<{ ok: true; view: ShopMatrixArticleInspectorView } | { ok: false; messageRu: string }> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  if (!collectionId || !articleId) {
    return { ok: false, messageRu: 'Укажите collectionId и articleId.' };
  }

  const publishedList = await listWorkshop2PublishedShowroomArticles(collectionId);
  const published = publishedList.find((a) => a.articleId === articleId) ?? null;
  const campaign = await getWorkshop2ShowroomCampaign({ collectionId, articleId });
  const isPublished = Boolean(campaign?.published) || Boolean(published);

  if (!isPublished) {
    return {
      ok: false,
      messageRu: 'Артикул не опубликован в B2B витрине — inspector только read-only после release.',
    };
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record?.dossier) {
    return {
      ok: false,
      messageRu: 'Досье не найдено — supplier model недоступен для магазина.',
    };
  }

  const { assessShopMatrixInspectorFactoryPackGate } =
    await import('@/lib/production/shop-matrix-inspector-release-gate');
  const releaseGate = assessShopMatrixInspectorFactoryPackGate({
    dossier: record.dossier,
    collectionId,
    articleId,
    articleSku: published?.sku,
  });
  if (!releaseGate.ready) {
    return {
      ok: false,
      code: 'factory_pack_gate_blocked',
      messageRu: `Factory pack не готов (${releaseGate.sheetsReady}/${releaseGate.sheetsTotal} листов). Inspector заблокирован до release gate бренда.`,
      releaseGate: {
        sheetsReady: releaseGate.sheetsReady,
        sheetsTotal: releaseGate.sheetsTotal,
        qtyBridged: releaseGate.qtyBridged,
        blockersRu: releaseGate.blockersRu,
        brandFactoryPackHref: releaseGate.brandFactoryPackHref,
        brandReleaseGateHref: releaseGate.brandReleaseGateHref,
      },
    };
  }

  return {
    ok: true,
    view: extractShopMatrixArticleInspectorView({
      collectionId,
      articleId,
      dossier: record.dossier,
      published,
      campaignPublished: campaign?.published,
    }),
  };
}
