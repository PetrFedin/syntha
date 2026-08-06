import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';
import { createProductDevelopmentService } from '../src/application/product-development-service.mjs';
import { createMemoryWholesaleStore } from '../src/infrastructure/memory-store.mjs';

async function fixture() {
  let id = 0;
  const store = createMemoryWholesaleStore();
  const clock = () => '2026-08-06T15:00:00.000Z';
  const nextId = (prefix) => `${prefix}_${++id}`;
  const options = { store, clock, nextId };
  const platform = createWholesalePlatform(options);
  const productDevelopment = createProductDevelopmentService(options);
  await platform.registerOrganisation('pd-org-brand', 'system', createOrganisation({ id: 'brand-pd', type: 'brand', name: 'Product Brand' }));
  await platform.registerOrganisation('pd-org-shop', 'system', createOrganisation({ id: 'shop-pd', type: 'shop', name: 'Product Shop' }));
  await platform.grantMembership('pd-owner', 'system', createMembership({
    id: 'membership-pd-owner', organisationId: 'brand-pd', organisationType: 'brand', userId: 'owner-pd', role: 'owner', createdAt: clock(),
  }));
  await platform.grantMembership('pd-product', 'owner-pd', createMembership({
    id: 'membership-pd-product', organisationId: 'brand-pd', organisationType: 'brand', userId: 'developer-pd', role: 'product', createdAt: clock(),
  }));
  await platform.grantMembership('pd-buyer', 'system', createMembership({
    id: 'membership-pd-buyer', organisationId: 'shop-pd', organisationType: 'shop', userId: 'buyer-pd', role: 'buyer', createdAt: clock(),
  }));
  const campaign = await platform.createCampaign('pd-campaign', 'owner-pd', {
    brandId: 'brand-pd', name: 'AW28 Development', season: 'AW28',
    startsAt: '2028-01-01T00:00:00.000Z', endsAt: '2028-06-01T00:00:00.000Z',
  });
  await platform.openCampaign('pd-campaign-open', 'owner-pd', campaign.id);
  const collection = await platform.createCollection('pd-collection', 'owner-pd', {
    campaignId: campaign.id, brandId: 'brand-pd', name: 'AW28 Mainline', currency: 'EUR',
  });
  return { store, platform, productDevelopment, collection };
}

test('published size grid drives an immutable approved Style snapshot', async () => {
  const context = await fixture();
  const draftGrid = await context.productDevelopment.createSizeGrid('pd-grid-create', 'developer-pd', {
    brandId: 'brand-pd', code: 'women-alpha', name: 'Women Alpha', sizes: ['xs', 's', 'm', 'l'], baseSize: 'm',
  });
  assert.equal(draftGrid.code, 'WOMEN-ALPHA');
  assert.deepEqual(draftGrid.sizes, ['XS', 'S', 'M', 'L']);
  const grid = await context.productDevelopment.publishSizeGrid('pd-grid-publish', 'developer-pd', draftGrid.id);
  assert.equal(grid.status, 'published');
  assert.equal(grid.version, 2);

  const draftStyle = await context.productDevelopment.createStyle('pd-style-create', 'developer-pd', {
    brandId: 'brand-pd', collectionId: context.collection.id, styleCode: 'jk-100', name: 'Tailored Jacket',
    category: 'Outerwear', gender: 'women', sizeGridId: grid.id,
  });
  assert.equal(draftStyle.styleCode, 'JK-100');
  assert.equal(draftStyle.sizeGrid.version, 2);
  const approved = await context.productDevelopment.approveStyle('pd-style-approve', 'developer-pd', draftStyle.id);
  assert.equal(approved.status, 'approved');
  assert.equal(approved.version, 2);
  assert.deepEqual(approved.sizeGrid.sizes, ['XS', 'S', 'M', 'L']);

  const snapshot = context.store.snapshot();
  assert.equal(snapshot.sizeGrids.length, 1);
  assert.equal(snapshot.styles.length, 1);
  assert.deepEqual(snapshot.events.slice(-4).map((event) => event.type), [
    'size-grid.created', 'size-grid.published', 'style.created', 'style.approved',
  ]);
  const replay = await context.productDevelopment.approveStyle('pd-style-approve', 'developer-pd', draftStyle.id);
  assert.deepEqual(replay, approved);
});

test('Style creation rejects an unpublished size grid and rolls back the command', async () => {
  const context = await fixture();
  const grid = await context.productDevelopment.createSizeGrid('pd-grid-draft', 'developer-pd', {
    brandId: 'brand-pd', code: 'numeric', name: 'Numeric', sizes: ['42', '44', '46'], baseSize: '44',
  });
  const before = context.store.snapshot();
  await assert.rejects(
    () => context.productDevelopment.createStyle('pd-style-invalid', 'developer-pd', {
      brandId: 'brand-pd', collectionId: context.collection.id, styleCode: 'TR-100', name: 'Trouser',
      category: 'Bottoms', gender: 'women', sizeGridId: grid.id,
    }),
    (error) => error.code === 'STYLE_SIZE_GRID_NOT_PUBLISHED',
  );
  const after = context.store.snapshot();
  assert.equal(after.styles.length, 0);
  assert.equal(after.commands.some((command) => command.id === 'pd-style-invalid'), false);
  assert.equal(after.outbox.length, before.outbox.length);
});

test('shop buyer cannot mutate brand product development', async () => {
  const context = await fixture();
  await assert.rejects(
    () => context.productDevelopment.createSizeGrid('pd-grid-buyer', 'buyer-pd', {
      brandId: 'brand-pd', code: 'buyer-grid', name: 'Buyer Grid', sizes: ['S', 'M'], baseSize: 'M',
    }),
    (error) => error.code === 'ACTIVE_MEMBERSHIP_REQUIRED',
  );
});
