import {
  collectWorkshop2B2bCartMoqViolations,
  type Workshop2B2bCartSession,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import { evaluateShopB2bCartCheckoutPreflight } from '@/lib/server/shop-b2b-cart-preflight-server';

jest.mock('@/lib/server/workshop2-phase1-dossier-server-store', () => ({
  getWorkshop2ServerDossierRecord: jest.fn(),
}));

jest.mock('@/lib/server/brand-pack-rules-repository', () => ({
  listBrandPackRulesServer: jest.fn().mockResolvedValue({ rows: [] }),
}));

jest.mock('@/lib/server/shop-matrix-size-run-cart-validate-server', () => ({
  validateShopMatrixCartSizeRunsServer: jest.fn().mockResolvedValue({
    ok: true,
    results: [],
    messageRu: 'ok',
  }),
}));

import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';

describe('shop-b2b-cart-preflight-server', () => {
  it('blocks checkout on MOQ violation', async () => {
    const session = {
      sessionId: 's1',
      tier: 'standard' as const,
      lines: [
        {
          collectionId: 'SS27',
          articleId: 'demo-ss27-01',
          colorCode: 'default',
          size: 'M',
          qty: 1,
          wholesalePriceRub: 1000,
          moq: 6,
        },
      ],
      updatedAt: new Date().toISOString(),
    } satisfies Workshop2B2bCartSession;

    expect(collectWorkshop2B2bCartMoqViolations(session)).toHaveLength(1);
    const result = await evaluateShopB2bCartCheckoutPreflight(session);
    expect(result.ready).toBe(false);
    expect(result.moqViolations.length).toBeGreaterThan(0);
  });

  it('blocks checkout when development gate fails', async () => {
    (getWorkshop2ServerDossierRecord as jest.Mock).mockResolvedValue({
      dossier: { showroomPublish: { published: false } },
    });
    const session = {
      sessionId: 's1',
      tier: 'standard' as const,
      lines: [
        {
          collectionId: 'SS27',
          articleId: 'demo-ss27-01',
          colorCode: 'default',
          size: 'M',
          qty: 12,
          wholesalePriceRub: 1000,
          moq: 6,
        },
      ],
      updatedAt: new Date().toISOString(),
    } satisfies Workshop2B2bCartSession;

    const result = await evaluateShopB2bCartCheckoutPreflight(session);
    expect(result.ready).toBe(false);
    expect(result.developmentBlocks.length).toBeGreaterThan(0);
  });
});
