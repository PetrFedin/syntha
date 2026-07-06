import 'server-only';

import {
  mergeShopMatrixSizeRunValidationResults,
  validateShopMatrixSizeRunDistribution,
  validateShopMatrixSizeRunMoq,
} from '@/lib/b2b/shop-matrix-size-run-validate';
import { parseWorkshop2B2bDraftNumbers } from '@/lib/production/workshop2-auto-showroom-publish';
import { getMoqForProduct } from '@/lib/b2b/joor-constants';
import { loadShopMatrixSizeCurveView } from '@/lib/server/shop-matrix-size-curve';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';

export type ShopMatrixSizeRunValidateResult = {
  ok: boolean;
  violations: string[];
  messageRu: string;
  curveSource?: string;
  moqPerCell?: number;
};

export async function validateShopMatrixSizeRunServer(input: {
  collectionId: string;
  articleId: string;
  qtyBySize: Record<string, number>;
}): Promise<
  | { ok: true; result: ShopMatrixSizeRunValidateResult }
  | { ok: false; messageRu: string; status: 404 }
> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const qtyBySize = input.qtyBySize ?? {};

  const curveRes = await loadShopMatrixSizeCurveView({ collectionId, articleId });
  if (!curveRes.ok) {
    return { ok: false, messageRu: curveRes.messageRu, status: 404 };
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const draftMoq = parseWorkshop2B2bDraftNumbers(record?.dossier?.b2bIntegrationDraft).moq;
  const moqPerCell = Math.max(1, draftMoq ?? getMoqForProduct(articleId));

  const curveCheck = validateShopMatrixSizeRunDistribution({
    qtyBySize,
    expectedCurve: curveRes.view.curve,
  });
  const moqCheck = validateShopMatrixSizeRunMoq({ qtyBySize, moqPerCell });
  const merged = mergeShopMatrixSizeRunValidationResults([curveCheck, moqCheck]);

  return {
    ok: true,
    result: {
      ok: merged.ok,
      violations: merged.violations,
      messageRu: merged.messageRu,
      curveSource: curveRes.view.source,
      moqPerCell,
    },
  };
}
