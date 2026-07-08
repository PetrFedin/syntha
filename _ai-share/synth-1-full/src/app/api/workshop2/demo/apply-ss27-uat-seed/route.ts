import { NextResponse } from 'next/server';

import { isWorkshop2InvestorDemoMode } from '@/lib/production/workshop2-investor-demo-mode';
import { buildWorkshop2FileStoreDemoDossier } from '@/lib/production/workshop2-file-store-demo-bootstrap';
import { putWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';

const SS27_DEMO_ARTICLE_IDS = [
  'demo-ss27-01',
  'demo-ss27-02',
  'demo-ss27-03',
  'demo-ss27-04',
] as const;

/**
 * POST — принудительный re-seed SS27 demo dossiers для investor UAT / publish gate.
 * Только в WORKSHOP2_INVESTOR_DEMO_MODE (fail-closed в prod без demo flag).
 */
export async function POST() {
  if (!isWorkshop2InvestorDemoMode()) {
    return jsonWorkshop2ErrorRu(403, 'investor_demo_mode_required');
  }

  const collectionId = 'SS27';
  const seeded: string[] = [];
  const skipped: string[] = [];

  for (const articleId of SS27_DEMO_ARTICLE_IDS) {
    const dossier = buildWorkshop2FileStoreDemoDossier({
      collectionId,
      articleId,
      updatedBy: 'apply-ss27-uat-seed',
    });
    if (!dossier) {
      skipped.push(articleId);
      continue;
    }
    await putWorkshop2ServerDossierRecord({
      collectionId,
      articleId,
      dossier,
    });
    seeded.push(articleId);
  }

  return NextResponse.json({
    ok: true,
    collectionId,
    seededArticleIds: seeded,
    skippedArticleIds: skipped,
    messageRu:
      seeded.length > 0
        ? `SS27 UAT seed применён для ${seeded.length} артикул(ов) — publish gate и hub UAT готовы.`
        : 'Нет demo-артикулов для seed — проверьте file-store bootstrap.',
  });
}
