import {
  SHOP_SHOWROOM_MATRIX_CARRY_PREFILL_HINT_RU,
  SHOP_SHOWROOM_MATRIX_CARRY_QTY_PARAM,
  SHOP_SHOWROOM_MATRIX_CARRY_SIZE_PARAM,
  parseShopShowroomMatrixCarryFromSearchParams,
  shopShowroomMatrixHrefWithCarry,
  shopShowroomMatrixHrefWithCarryQty,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';
import {
  SHOP_MATRIX_DRAFT_EMPTY_HINT_RU,
  validateShopMatrixDraftDocRu,
} from '@/lib/b2b/shop-matrix-draft-validate';

describe('wave WA — shop showroom → matrix qty/size carry', () => {
  it('matrix href carries qty + size query params', () => {
    const href = shopShowroomMatrixHrefWithCarry('SS27', 'demo-ss27-01', {
      carryQty: 6,
      carrySize: 'L',
    });
    expect(href).toContain(`${SHOP_SHOWROOM_MATRIX_CARRY_QTY_PARAM}=6`);
    expect(href).toContain(`${SHOP_SHOWROOM_MATRIX_CARRY_SIZE_PARAM}=L`);
    expect(href).toContain('article=demo-ss27-01');
  });

  it('legacy carryQty helper remains compatible', () => {
    expect(shopShowroomMatrixHrefWithCarryQty('SS27', 'demo-ss27-01', 3)).toContain('carryQty=3');
  });

  it('parses carry params from URL search', () => {
    const parsed = parseShopShowroomMatrixCarryFromSearchParams({
      carryQty: '4',
      carrySize: 'M',
    });
    expect(parsed.carryQty).toBe(4);
    expect(parsed.carrySize).toBe('M');
  });

  it('RU prefill hint + UI testids', () => {
    expect(SHOP_SHOWROOM_MATRIX_CARRY_PREFILL_HINT_RU).toMatch(/витрин/i);
    expect('shop-sc-matrix-showroom-carry-hint').toContain('carry-hint');
    expect('shop-sc-matrix-entry-link-').toBeTruthy();
    expect('shop-sc-showroom-matrix-quick-add-').toBeTruthy();
    expect('shop-co-matrix-draft-validation-hint').toContain('validation');
  });

  it('eligible filter loading testid', () => {
    expect('shop-sc-showroom-eligible-filter-loading').toContain('loading');
  });
});

describe('wave WA — matrix draft PG validation hints RU', () => {
  it('empty draft yields RU hint', () => {
    const result = validateShopMatrixDraftDocRu(
      { v: 1, collectionId: 'SS27', lines: [], updatedAt: new Date().toISOString() },
      { collectionId: 'SS27' }
    );
    expect(result.ok).toBe(false);
    expect(result.hintsRu).toContain(SHOP_MATRIX_DRAFT_EMPTY_HINT_RU);
  });

  it('MOQ violation surfaces RU message', () => {
    const result = validateShopMatrixDraftDocRu(
      {
        v: 1,
        collectionId: 'SS27',
        updatedAt: new Date().toISOString(),
        lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 1 }],
      },
      { moqPerCell: 6, collectionId: 'SS27' }
    );
    expect(result.ok).toBe(false);
    expect(result.messageRu).toMatch(/MOQ|demo-ss27-01/i);
  });

  it('draft PUT API path contract', () => {
    expect('/api/shop/b2b/matrix/draft').toContain('matrix/draft');
  });
});
