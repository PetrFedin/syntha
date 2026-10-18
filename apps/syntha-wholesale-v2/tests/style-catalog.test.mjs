import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogSku } from '../src/modules/catalog/public.mjs';

const collection = Object.freeze({ id: 'collection-1', brandId: 'brand-1', currency: 'EUR', status: 'published' });
const style = Object.freeze({
  id: 'style-1',
  brandId: 'brand-1',
  collectionId: 'collection-1',
  styleCode: 'JK-100',
  version: 2,
  status: 'approved',
  sizeGrid: Object.freeze({
    id: 'grid-1', code: 'WOMEN-ALPHA', version: 2, status: 'published',
    sizes: Object.freeze(['XS', 'S', 'M', 'L']), baseSize: 'M',
  }),
});

test('Style-linked catalog SKU snapshots immutable Style, size grid, color and size identity', () => {
  const sku = createCatalogSku({
    sku: 'JK-100-BLK-M',
    collection,
    brandId: 'brand-1',
    name: 'Tailored Jacket Black M',
    wholesalePrice: 180,
    currency: 'EUR',
    minimumOrderQuantity: 2,
    availableQuantity: 20,
    style,
    sizeLabel: 'm',
    colorCode: 'blk',
    createdAt: '2026-08-06T17:00:00.000Z',
  });
  assert.deepEqual(sku.productIdentity, {
    styleId: 'style-1',
    styleCode: 'JK-100',
    styleVersion: 2,
    sizeGridId: 'grid-1',
    sizeGridCode: 'WOMEN-ALPHA',
    sizeGridVersion: 2,
    sizeLabel: 'M',
    colorCode: 'BLK',
  });
});

test('Style-linked catalog SKU rejects draft Styles and sizes outside the approved grid', () => {
  assert.throws(
    () => createCatalogSku({
      sku: 'JK-100-BLK-M', collection, brandId: 'brand-1', name: 'Draft Jacket', wholesalePrice: 180,
      currency: 'EUR', minimumOrderQuantity: 2, availableQuantity: 20,
      style: { ...style, status: 'draft' }, sizeLabel: 'M', colorCode: 'BLK', createdAt: 'now',
    }),
    (error) => error.code === 'CATALOG_STYLE_NOT_APPROVED',
  );
  assert.throws(
    () => createCatalogSku({
      sku: 'JK-100-BLK-XXL', collection, brandId: 'brand-1', name: 'Wrong Size Jacket', wholesalePrice: 180,
      currency: 'EUR', minimumOrderQuantity: 2, availableQuantity: 20,
      style, sizeLabel: 'XXL', colorCode: 'BLK', createdAt: 'now',
    }),
    (error) => error.code === 'CATALOG_STYLE_SIZE_INVALID',
  );
});
