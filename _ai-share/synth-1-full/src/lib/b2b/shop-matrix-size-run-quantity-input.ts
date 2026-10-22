/**
 * Строгий контракт количества по размерам для B2B matrix → checkout.
 * Не округлять и не отбрасывать пользовательские значения до server-side проверки.
 */
export type ShopMatrixQtyParseResult =
  | { ok: true; qtyBySize: Record<string, number> }
  | { ok: false; messageRu: string };

const MAX_SIZES = 128;
const MAX_SIZE_LENGTH = 64;

function isValidSizeLabel(size: string): boolean {
  return (
    size.length > 0 &&
    size.length <= MAX_SIZE_LENGTH &&
    !['__proto__', 'prototype', 'constructor'].includes(size.toLowerCase())
  );
}

function parseQuantity(raw: unknown): number | null {
  if (typeof raw === 'number') {
    return Number.isSafeInteger(raw) && raw >= 0 ? raw : null;
  }
  if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
    const n = Number(raw.trim());
    return Number.isSafeInteger(n) && n >= 0 ? n : null;
  }
  return null;
}

/** JSON body / JSON query: zero is valid, fractional/negative/NaN/overflow is not. */
export function parseShopMatrixQtyBySize(value: unknown): ShopMatrixQtyParseResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, messageRu: 'qtyBySize должен быть объектом «размер → количество».' };
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > MAX_SIZES) {
    return { ok: false, messageRu: 'Слишком много размеров в одной строке заказа.' };
  }

  const qtyBySize: Record<string, number> = Object.create(null);
  let total = 0;
  for (const [rawSize, rawQty] of entries) {
    const size = rawSize.trim();
    if (!isValidSizeLabel(size)) {
      return { ok: false, messageRu: 'Недопустимое название размера в qtyBySize.' };
    }
    if (Object.prototype.hasOwnProperty.call(qtyBySize, size)) {
      return { ok: false, messageRu: `Размер «${size}» указан повторно.` };
    }
    const qty = parseQuantity(rawQty);
    if (qty === null) {
      return {
        ok: false,
        messageRu: `Размер «${size}»: количество должно быть целым неотрицательным числом.`,
      };
    }
    total += qty;
    if (!Number.isSafeInteger(total)) {
      return { ok: false, messageRu: 'Суммарное количество превышает допустимый диапазон.' };
    }
    qtyBySize[size] = qty;
  }
  return { ok: true, qtyBySize };
}

/** Query supports JSON qtyBySize or repeated size_M=6 keys (not both). */
export function parseShopMatrixQtyBySizeQuery(
  params: URLSearchParams
): ShopMatrixQtyParseResult {
  const jsonRaw = params.get('qtyBySize');
  if (jsonRaw !== null) {
    if (params.getAll('qtyBySize').length !== 1) {
      return { ok: false, messageRu: 'qtyBySize указан повторно.' };
    }
    if ([...params.keys()].some((key) => key.startsWith('size_'))) {
      return { ok: false, messageRu: 'Передайте размеры одним способом: qtyBySize или size_*.' };
    }
    try {
      return parseShopMatrixQtyBySize(JSON.parse(jsonRaw));
    } catch {
      return { ok: false, messageRu: 'Некорректный JSON в qtyBySize.' };
    }
  }

  const input: Record<string, unknown> = Object.create(null);
  for (const [key, rawQty] of params.entries()) {
    if (!key.startsWith('size_')) continue;
    const rawSize = key.slice('size_'.length);
    if (Object.prototype.hasOwnProperty.call(input, rawSize)) {
      return { ok: false, messageRu: `Размер «${rawSize}» указан повторно.` };
    }
    input[rawSize] = rawQty;
  }
  return parseShopMatrixQtyBySize(input);
}
