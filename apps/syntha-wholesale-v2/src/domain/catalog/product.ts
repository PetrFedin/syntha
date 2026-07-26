export const PRODUCT_STATUSES = [
  'draft',
  'active',
  'archived',
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  readonly id: string;
  readonly organizationId: string;
  readonly brandId: string;
  readonly collectionId?: string;
  readonly styleCode: string;
  readonly name: string;
  readonly categoryId: string;
  readonly status: ProductStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductVariant {
  readonly id: string;
  readonly productId: string;
  readonly colorId: string;
  readonly colorName: string;
  readonly colorCode?: string;
}

export interface SizeDefinition {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly scale: string;
  readonly sortOrder: number;
}

export interface Sku {
  readonly id: string;
  readonly variantId: string;
  readonly sizeId: string;
  readonly skuCode: string;
  readonly barcode?: string;
  readonly isActive: boolean;
}

export function normalizeStyleCode(styleCode: string): string {
  const normalized = styleCode.trim().toUpperCase();

  if (!normalized) {
    throw new Error('Style code is required.');
  }

  return normalized;
}

export function normalizeSkuCode(skuCode: string): string {
  const normalized = skuCode.trim().toUpperCase();

  if (!normalized) {
    throw new Error('SKU code is required.');
  }

  return normalized;
}

export function assertUniqueSkuCodes(skus: readonly Pick<Sku, 'skuCode'>[]): void {
  const seen = new Set<string>();

  for (const sku of skus) {
    const normalized = normalizeSkuCode(sku.skuCode);

    if (seen.has(normalized)) {
      throw new Error(`Duplicate SKU code: "${normalized}".`);
    }

    seen.add(normalized);
  }
}

export function assertUniqueBarcodes(skus: readonly Pick<Sku, 'barcode'>[]): void {
  const seen = new Set<string>();

  for (const sku of skus) {
    const normalized = sku.barcode?.trim();

    if (!normalized) {
      continue;
    }

    if (seen.has(normalized)) {
      throw new Error(`Duplicate barcode: "${normalized}".`);
    }

    seen.add(normalized);
  }
}

export function buildSkuCode(
  styleCode: string,
  colorCode: string,
  sizeCode: string,
): string {
  const parts = [styleCode, colorCode, sizeCode].map((part) => part.trim().toUpperCase());

  if (parts.some((part) => !part)) {
    throw new Error('Style, color and size codes are required to build a SKU code.');
  }

  return parts.join('-');
}
