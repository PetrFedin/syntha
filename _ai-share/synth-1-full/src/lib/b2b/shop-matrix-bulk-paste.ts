/** Parse bulk paste lines: `articleId, size, qty` or tab-separated. */
export type ShopMatrixBulkPasteLine = {
  articleId: string;
  size: string;
  qty: number;
  colorCode: string;
};

const SIZE_RE = /^(XXS|XS|S|M|L|XL|XXL|2XL|3XL|\d{2})$/i;

export function parseShopMatrixBulkPaste(raw: string): {
  lines: ShopMatrixBulkPasteLine[];
  errors: string[];
} {
  const lines: ShopMatrixBulkPasteLine[] = [];
  const errors: string[] = [];
  const rows = raw
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const lineNo = i + 1;
    if (/^(артикул|article|sku|size|размер)/i.test(row)) continue;

    const parts = row.includes('\t')
      ? row.split('\t').map((p) => p.trim())
      : row.split(/[,;]/).map((p) => p.trim());

    if (parts.length < 2) {
      errors.push(`Строка ${lineNo}: ожидается «артикул, размер, qty».`);
      continue;
    }

    const articleId = parts[0]?.trim() ?? '';
    const sizeRaw = parts[1]?.trim() ?? '';
    const qtyRaw = parts[2]?.trim() ?? parts[1]?.trim() ?? '';

    let size = sizeRaw.toUpperCase();
    let qtyStr = qtyRaw;

    if (SIZE_RE.test(sizeRaw) && parts.length >= 3) {
      qtyStr = parts[2]?.trim() ?? '';
    } else if (!SIZE_RE.test(sizeRaw) && /^\d+$/.test(sizeRaw) && parts.length === 2) {
      size = 'M';
      qtyStr = sizeRaw;
    }

    const qty = Math.max(0, Math.floor(Number(qtyStr.replace(/\s/g, ''))));
    if (!articleId) {
      errors.push(`Строка ${lineNo}: пустой артикул.`);
      continue;
    }
    if (!SIZE_RE.test(size)) {
      errors.push(`Строка ${lineNo}: неизвестный размер «${sizeRaw}».`);
      continue;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.push(`Строка ${lineNo}: qty должно быть > 0.`);
      continue;
    }

    lines.push({
      articleId,
      size,
      qty,
      colorCode: 'default',
    });
  }

  return { lines, errors };
}

/** Group paste lines by articleId for POST /api/shop/b2b/cart/matrix. */
export function groupShopMatrixBulkPasteByArticle(
  lines: ShopMatrixBulkPasteLine[]
): Map<string, ShopMatrixBulkPasteLine[]> {
  const grouped = new Map<string, ShopMatrixBulkPasteLine[]>();
  for (const line of lines) {
    const key = line.articleId.trim();
    const bucket = grouped.get(key) ?? [];
    bucket.push(line);
    grouped.set(key, bucket);
  }
  return grouped;
}
