import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';
import { createCatalogService } from '../src/application/catalog-service.mjs';
import { createProductDevelopmentService } from '../src/application/product-development-service.mjs';
import { createMemoryWholesaleStore } from '../src/infrastructure/memory-store.mjs';
import { createMemoryCatalogStore } from '../src/infrastructure/memory-catalog-store.mjs';

test('memory and PostgreSQL adapters share Style variant uniqueness semantics', async () => {
  let id = 0;
  const clock = () => '2026-08-06T18:00:00.000Z';
  const nextId = (prefix) => `${prefix}_${++id}`;
  const store = createMemoryWholesaleStore();
  const catalogStore = createMemoryCatalogStore();
  const options = { store, clock, nextId };
  const platform = createWholesalePlatform(options);
  const productDevelopment = createProductDevelopmentService(options);
  const catalog = createCatalogService({ wholesaleStore: store, catalogStore, clock, nextId });

  await platform.registerOrganisation('variant-org', 'system', createOrganisation({ id: 'variant-brand', type: 'brand', name: 'Variant Brand' }));
  await platform.grantMembership('variant-owner-member', 'system', createMembership({
    id: 'variant-owner-membership', organisationId: 'variant-brand', organisationType: 'brand', userId: 'variant-owner', role: 'owner', createdAt: clock(),
  }));
  await platform.grantMembership('variant-product-member', 'variant-owner', createMembership({
    id: 'variant-product-membership', organisationId: 'variant-brand', organisationType: 'brand', userId: 'variant-product', role: 'product', createdAt: clock(),
  }));
  const campaign = await platform.createCampaign('variant-campaign', 'variant-owner', {
    brandId: 'variant-brand', name: 'Variant Campaign', season: 'AW29',
    startsAt: '2029-01-01T00:00:00.000Z', endsAt: '2029-06-01T00:00:00.000Z',
  });
  await platform.openCampaign('variant-campaign-open', 'variant-owner', campaign.id);
  const draftCollection = await platform.createCollection('variant-collection', 'variant-owner', {
    campaignId: campaign.id, brandId: 'variant-brand', name: 'Variant Collection', currency: 'EUR',
  });
  const collection = await platform.publishCollection('variant-collection-publish', 'variant-owner', draftCollection.id);
  const draftGrid = await productDevelopment.createSizeGrid('variant-grid', 'variant-product', {
    brandId: 'variant-brand', code: 'ALPHA', name: 'Alpha', sizes: ['S', 'M', 'L'], baseSize: 'M',
  });
  const grid = await productDevelopment.publishSizeGrid('variant-grid-publish', 'variant-product', draftGrid.id);
  const draftStyle = await productDevelopment.createStyle('variant-style', 'variant-product', {
    brandId: 'variant-brand', collectionId: collection.id, styleCode: 'COAT-1', name: 'Coat', category: 'Outerwear', gender: 'unisex', sizeGridId: grid.id,
  });
  const style = await productDevelopment.approveStyle('variant-style-approve', 'variant-product', draftStyle.id);

  const first = await catalog.createSku('variant-sku-first', 'variant-product', {
    sku: 'COAT-1-BLK-M', collectionId: collection.id, brandId: 'variant-brand', styleId: style.id,
    sizeLabel: 'M', colorCode: 'BLK', name: 'Coat Black M', wholesalePrice: 200, currency: 'EUR',
    minimumOrderQuantity: 1, availableQuantity: 10,
  });
  assert.equal(first.productIdentity.styleId, style.id);

  await assert.rejects(
    () => catalog.createSku('variant-sku-duplicate', 'variant-product', {
      sku: 'COAT-1-BLK-M-ALT', collectionId: collection.id, brandId: 'variant-brand', styleId: style.id,
      sizeLabel: 'm', colorCode: 'blk', name: 'Duplicate Coat Black M', wholesalePrice: 210, currency: 'EUR',
      minimumOrderQuantity: 1, availableQuantity: 5,
    }),
    (error) => error.code === 'CATALOG_STYLE_VARIANT_EXISTS' && error.details.existingSku === first.sku,
  );
  const snapshot = catalogStore.snapshot();
  assert.equal(snapshot.skus.length, 1);
  assert.equal(snapshot.commands.some((command) => command.id === 'variant-sku-duplicate'), false);
  assert.equal(snapshot.outbox.length, 1);
});
