import {
  parseShopMatrixQtyBySize,
  parseShopMatrixQtyBySizeQuery,
} from '@/lib/b2b/shop-matrix-size-run-quantity-input';

describe('B2B size-run quantity input', () => {
  it('preserves valid integer counts, including zero and textual query counts', () => {
    const parsed = parseShopMatrixQtyBySize({ S: 0, M: 6, L: '12' });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.qtyBySize).toEqual({ S: 0, M: 6, L: 12 });
    }
  });

  it.each([
    [{ M: -1 }, 'negative'],
    [{ M: 2.5 }, 'fractional'],
    [{ M: Number.NaN }, 'NaN'],
    [{ M: Number.POSITIVE_INFINITY }, 'Infinity'],
    [{ M: '4.0' }, 'decimal string'],
    [{ M: '1e3' }, 'scientific notation'],
    [{ M: 'three' }, 'text quantity'],
    [{ M: Number.MAX_SAFE_INTEGER + 1 }, 'unsafe integer'],
  ])('rejects %s (%s) rather than rounding or dropping data', (input) => {
    expect(parseShopMatrixQtyBySize(input).ok).toBe(false);
  });

  it('rejects duplicate normalized size keys and unsafe names', () => {
    expect(parseShopMatrixQtyBySize({ M: 1, ' M ': 3 }).ok).toBe(false);
    expect(parseShopMatrixQtyBySize(JSON.parse('{"__proto__":6}')).ok).toBe(false);
    expect(parseShopMatrixQtyBySize({ '': 1 }).ok).toBe(false);
  });

  it('rejects totals outside the safe integer range', () => {
    expect(parseShopMatrixQtyBySize({ S: Number.MAX_SAFE_INTEGER, M: 2 }).ok).toBe(false);
  });

  it('rejects excessive number of size keys and non-objects', () => {
    const excessive: Record<string, number> = {};
    for (let i = 0; i < 129; i += 1) excessive[`S${i}`] = 1;
    expect(parseShopMatrixQtyBySize(excessive).ok).toBe(false);
    expect(parseShopMatrixQtyBySize(null).ok).toBe(false);
    expect(parseShopMatrixQtyBySize([]).ok).toBe(false);
  });

  it('accepts valid GET JSON and legacy size_* query forms', () => {
    const jsonQuery = new URLSearchParams({ qtyBySize: JSON.stringify({ XS: 3, S: 6 }) });
    const jsonParsed = parseShopMatrixQtyBySizeQuery(jsonQuery);
    expect(jsonParsed.ok).toBe(true);
    if (jsonParsed.ok) expect(jsonParsed.qtyBySize).toEqual({ XS: 3, S: 6 });

    const legacyParsed = parseShopMatrixQtyBySizeQuery(
      new URLSearchParams([['size_M', '6'], ['size_L', '12']])
    );
    expect(legacyParsed.ok).toBe(true);
    if (legacyParsed.ok) expect(legacyParsed.qtyBySize).toEqual({ M: 6, L: 12 });
  });

  it('rejects ambiguous, repeated or malformed GET quantity parameters', () => {
    expect(
      parseShopMatrixQtyBySizeQuery(
        new URLSearchParams([['size_M', '4'], ['size_M', '6']])
      ).ok
    ).toBe(false);
    expect(
      parseShopMatrixQtyBySizeQuery(
        new URLSearchParams([['qtyBySize', '{"M":5}'], ['size_M', '4']])
      ).ok
    ).toBe(false);
    expect(
      parseShopMatrixQtyBySizeQuery(new URLSearchParams({ qtyBySize: '{broken' })).ok
    ).toBe(false);
  });
});
