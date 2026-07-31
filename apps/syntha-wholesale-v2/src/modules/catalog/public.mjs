import { invariant } from '../../core/errors.mjs';

const SKU_PATTERN = /^[A-Z0-9][A-Z0-9._-]{1,63}$/;

export function createCatalogSku({ sku, collection, brandId, name, wholesalePrice, currency, createdAt }) {
  invariant(SKU_PATTERN.test(sku ?? ''), 'CATALOG_SKU_INVALID', 'SKU must contain 2-64 uppercase letters, numbers, dots, underscores or dashes');
  invariant(collection?.id, 'CATALOG_COLLECTION_REQUIRED', 'Catalog SKU collection is required');
  invariant(collection.brandId === brandId, 'CATALOG_BRAND_MISMATCH', 'Catalog SKU brand must match collection brand');
  invariant(typeof name === 'string' && name.trim().length > 1, 'CATALOG_NAME_REQUIRED', 'Catalog SKU name is required');
  invariant(Number.isFinite(wholesalePrice) && wholesalePrice > 0, 'CATALOG_PRICE_INVALID', 'Wholesale price must be positive');
  invariant(currency === collection.currency, 'CATALOG_CURRENCY_MISMATCH', 'Catalog currency must match collection currency');
  return Object.freeze({
    id: sku,
    sku,
    collectionId: collection.id,
    brandId,
    name: name.trim(),
    wholesalePrice,
    currency,
    status: 'draft',
    version: 1,
    publishedAt: null,
    createdAt,
    updatedAt: createdAt,
  });
}

export function publishCatalogSku(catalogSku, collection, publishedAt) {
  invariant(catalogSku.status === 'draft', 'CATALOG_SKU_NOT_DRAFT', 'Only a draft SKU can be published');
  invariant(collection.id === catalogSku.collectionId, 'CATALOG_COLLECTION_MISMATCH', 'SKU does not belong to collection');
  invariant(collection.status === 'published', 'COLLECTION_NOT_PUBLISHED', 'Collection must be published before SKU publication');
  invariant(collection.currency === catalogSku.currency, 'CATALOG_CURRENCY_MISMATCH', 'Catalog currency must match collection currency');
  return Object.freeze({ ...catalogSku, status: 'published', version: catalogSku.version + 1, publishedAt, updatedAt: publishedAt });
}

export function assertPublishedCatalogSku(catalogSku, { collectionId, brandId } = {}) {
  invariant(catalogSku, 'CATALOG_SKU_NOT_FOUND', 'Catalog SKU not found');
  invariant(catalogSku.status === 'published', 'CATALOG_SKU_NOT_PUBLISHED', 'Selection requires a published catalog SKU', { sku: catalogSku.sku });
  invariant(!collectionId || catalogSku.collectionId === collectionId, 'CATALOG_SKU_COLLECTION_MISMATCH', 'SKU belongs to another collection', { sku: catalogSku.sku, collectionId });
  invariant(!brandId || catalogSku.brandId === brandId, 'CATALOG_SKU_BRAND_MISMATCH', 'SKU belongs to another brand', { sku: catalogSku.sku, brandId });
  return catalogSku;
}
