import 'server-only';

import type { Workshop2B2bCartSession } from '@/lib/production/workshop2-b2b-wave23-parity';
import { collectWorkshop2B2bCartPackViolations } from '@/lib/production/workshop2-b2b-cart-pack-rules';
import {
  collectWorkshop2B2bCartMoqViolations,
  evaluateWorkshop2B2bCartMixedBrandGate,
  evaluateWorkshop2B2bCartSubmitDevelopmentGate,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import { listBrandPackRulesServer } from '@/lib/server/brand-pack-rules-repository';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { validateShopMatrixCartSizeRunsServer } from '@/lib/server/shop-matrix-size-run-cart-validate-server';

export type ShopB2bCartCheckoutPreflight = {
  ready: boolean;
  empty: boolean;
  moqViolations: string[];
  packViolations: string[];
  sizeRunViolations: Array<{ articleId: string; messageRu: string }>;
  developmentBlocks: Array<{ articleId: string; messageRu: string }>;
  brandGateBlocked: boolean;
  messageRu: string;
  firstFailedSizeRunArticleId?: string;
};

async function buildCasePackMap(
  session: Workshop2B2bCartSession
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const collectionIds = [...new Set(session.lines.map((l) => l.collectionId))];
  for (const collectionId of collectionIds) {
    const { rows } = await listBrandPackRulesServer({
      collectionId,
      seedIfEmpty: false,
    });
    for (const row of rows) {
      const pack = row.casePack ?? 0;
      if (pack > 1) {
        map.set(`${collectionId}:${row.sku}`, pack);
      }
    }
  }
  return map;
}

export async function evaluateShopB2bCartCheckoutPreflight(
  session: Workshop2B2bCartSession | null
): Promise<ShopB2bCartCheckoutPreflight> {
  if (!session?.lines.length) {
    return {
      ready: false,
      empty: true,
      moqViolations: [],
      packViolations: [],
      sizeRunViolations: [],
      developmentBlocks: [],
      brandGateBlocked: false,
      messageRu: 'Корзина пуста — добавьте позиции в матрице.',
    };
  }

  const brandGate = evaluateWorkshop2B2bCartMixedBrandGate({ session });
  if (!brandGate.allowed) {
    return {
      ready: false,
      empty: false,
      moqViolations: [],
      packViolations: [],
      sizeRunViolations: [],
      developmentBlocks: [],
      brandGateBlocked: true,
      messageRu: brandGate.messageRu,
    };
  }

  const moqViolations = collectWorkshop2B2bCartMoqViolations(session);
  if (moqViolations.length > 0) {
    return {
      ready: false,
      empty: false,
      moqViolations,
      packViolations: [],
      sizeRunViolations: [],
      developmentBlocks: [],
      brandGateBlocked: false,
      messageRu: `Оформление заблокировано: MOQ — ${moqViolations[0]}`,
    };
  }

  const collectionId = session.lines[0]!.collectionId;
  const sizeRunBatch = await validateShopMatrixCartSizeRunsServer({
    collectionId,
    lines: session.lines.map((l) => ({
      articleId: l.articleId,
      size: l.size,
      qty: l.qty,
    })),
  });
  const sizeRunViolations = sizeRunBatch.results
    .filter((r) => !r.ok)
    .map((r) => ({ articleId: r.articleId, messageRu: r.messageRu }));
  if (sizeRunViolations.length > 0) {
    return {
      ready: false,
      empty: false,
      moqViolations: [],
      packViolations: [],
      sizeRunViolations,
      developmentBlocks: [],
      brandGateBlocked: false,
      firstFailedSizeRunArticleId: sizeRunBatch.firstFailedArticleId,
      messageRu: `Оформление заблокировано: size run — ${sizeRunViolations[0]!.messageRu}`,
    };
  }

  const casePackByArticleKey = await buildCasePackMap(session);
  const packViolations = collectWorkshop2B2bCartPackViolations({
    session,
    casePackByArticleKey,
  });
  if (packViolations.length > 0) {
    return {
      ready: false,
      empty: false,
      moqViolations: [],
      packViolations,
      sizeRunViolations: [],
      developmentBlocks: [],
      brandGateBlocked: false,
      messageRu: `Оформление заблокировано: pack rule — ${packViolations[0]}`,
    };
  }

  const articleIds = [...new Set(session.lines.map((l) => l.articleId))];
  const developmentBlocks: Array<{ articleId: string; messageRu: string }> = [];
  for (const articleId of articleIds) {
    const line0 = session.lines.find((l) => l.articleId === articleId)!;
    const record = await getWorkshop2ServerDossierRecord(line0.collectionId, articleId);
    if (!record?.dossier) {
      developmentBlocks.push({
        articleId,
        messageRu: `Досье ${articleId} не найдено — синхронизируйте W2.`,
      });
      continue;
    }
    const gate = evaluateWorkshop2B2bCartSubmitDevelopmentGate({
      dossier: record.dossier,
      articleId,
      collectionId: line0.collectionId,
    });
    if (!gate.allowed) {
      developmentBlocks.push({ articleId, messageRu: gate.messageRu });
    }
  }

  if (developmentBlocks.length > 0) {
    return {
      ready: false,
      empty: false,
      moqViolations: [],
      packViolations: [],
      sizeRunViolations: [],
      developmentBlocks,
      brandGateBlocked: false,
      messageRu: developmentBlocks[0]!.messageRu,
    };
  }

  return {
    ready: true,
    empty: false,
    moqViolations: [],
    packViolations: [],
    sizeRunViolations: [],
    developmentBlocks: [],
    brandGateBlocked: false,
    messageRu: `Готово к оформлению · ${session.lines.length} строк.`,
  };
}
