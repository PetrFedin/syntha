import {
  parseShopMatrixQtyBySize,
  parseShopMatrixQtyBySizeQuery,
} from '@/lib/b2b/shop-matrix-size-run-quantity-input';

describe('B2B size-run quantity input', () => {
  it('preserves valid integer counts, including zero and textual query counts', () => {
    const parsed = parseShopMatrixQtyBySize({ S: 0, M: 6, L: '12' });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.qtyBySize).toEqual({ S: 0, M: 6, L: 12 });
  });

  it('rejects fractional, negative and unrepresentable quantities', () => {
    const invalidValues = [
      -1,
      2.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      '4.0',
      '1e3',
      'three',
      Number.MAX_SAFE_INTEGER + 1,
    ];
    for (const value of invalidValues) {
      expect(parseShopMatrixQtyBySize({ M: value }).ok).toBe(false);
    }
  });

  it('rejects duplicate normalized sizes and unsafe names', () => {
    expect(parseShopMatrixQtyBySize({ M: 1, ' M ': 3 }).ok).toBe(false);
    expect(parseShopMatrixQtyBySize(JSON.parse('{"__proto__":6}')).ok).toBe(false);
    expect(parseShopMatrixQtyBySize({ '': 1 }).ok).toBe(false);
  });

  it('rejects overflowed totals, excessive size keys and non-objects', () => {
    expect(parseShopMatrixQtyBySize({ S: Number.MAX_SAFE_INTEGER, M: 2 }).ok).toBe(false);
    const excessive: Record<string, number> = {};
    for (let index = 0; index < 129; index += 1) excessive[`S${index}`] = 1;
    expect(parseShopMatrixQtyBySize(excessive).ok).toBe(false);
    expect(parseShopMatrixQtyBySize(null).ok).toBe(false);
    expect(parseShopMatrixQtyBySize([]).ok).toBe(false);
  });

  it('accepts valid GET JSON and legacy size_* queries', () => {
    const jsonQuery = new URLSearchParams({ qtyBySize: JSON.stringify({ XS: 3, S: 6 }) });
    const jsonParsed = parseShopMatrixQtyBySizeQuery(jsonQuery);
    expect(jsonParsed.ok).toBe(true);
    if (jsonParsed.ok) expect(jsonParsed.qtyBySize).toEqual({ XS: 3, S: 6 });

    const legacyQuery = new URLSearchParams();
    legacyQuery.append('size_M', '6');
    legacyQuery.append('size_L', '12');
    const legacyParsed = parseShopMatrixQtyBySizeQuery(legacyQuery);
    expect(legacyParsed.ok).toBe(true);
    if (legacyParsed.ok) expect(legacyParsed.qtyBySize).toEqual({ M: 6, L: 12 });
  });

  it('rejects repeated, ambiguous or malformed GET quantity parameters', () => {
    const repeatedSize = new URLSearchParams();
    repeatedSize.append('size_M', '4');
    repeatedSize.append('size_M', '6');
    expect(parseShopMatrixQtyBySizeQuery(repeatedSize).ok).toBe(false);

    const mixedModes = new URLSearchParams({ qtyBySize: '{"M":5}' });
    mixedModes.append('size_M', '4');
    expect(parseShopMatrixQtyBySizeQuery(mixedModes).ok).toBe(false);

    const repeatedJson = new URLSearchParams();
    repeatedJson.append('qtyBySize', '{"M":5}');
    repeatedJson.append('qtyBySize', '{"L":4}');
    expect(parseShopMatrixQtyBySizeQuery(repeatedJson).ok).toBe(false);

    const malformedJson = new URLSearchParams({ qtyBySize: '{broken' });
    expect(parseShopMatrixQtyBySizeQuery(malformedJson).ok).toBe(false);
  });
});
