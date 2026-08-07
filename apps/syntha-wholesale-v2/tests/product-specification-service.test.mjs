import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';
import { createProductDevelopmentService } from '../src/application/product-development-service.mjs';
import { createProductSpecificationService } from '../src/application/product-specification-service.mjs';
import { createMemoryWholesaleStore } from '../src/infrastructure/memory-store.mjs';
import { createMemoryProductSpecificationStore } from '../src/infrastructure/memory-product-specification-store.mjs';

async function fixture() {
  let id = 0;
  let tick = 0;
  const clock = () => `2026-08-07T10:00:${String(tick++).padStart(2, '0')}.000Z`;
  const nextId = (prefix) => `${prefix}_${++id}`;
  const sourceStore = createMemoryWholesaleStore();
  const platform = createWholesalePlatform({ store: sourceStore, clock, nextId });
  const productDevelopment = createProductDevelopmentService({ store: sourceStore, clock, nextId });
  const specificationStore = createMemoryProductSpecificationStore({ sourceStore });
  const specification = createProductSpecificationService({ store: specificationStore, clock, nextId });

  await platform.registerOrganisation('spec-org', 'system', createOrganisation({ id: 'brand-spec', type: 'brand', name: 'Specification Brand' }));
  await platform.grantMembership('spec-owner-membership', 'system', createMembership({
    id: 'membership-spec-owner', organisationId: 'brand-spec', organisationType: 'brand', userId: 'owner-spec', role: 'owner', createdAt: clock(),
  }));
  for (const [userId, role] of [['product-spec', 'product'], ['sales-spec', 'sales'], ['finance-spec', 'finance'], ['viewer-spec', 'viewer']]) {
    await platform.grantMembership(`spec-${role}-membership`, 'owner-spec', createMembership({
      id: `membership-spec-${role}`, organisationId: 'brand-spec', organisationType: 'brand', userId, role, createdAt: clock(),
    }));
  }
  const campaign = await platform.createCampaign('spec-campaign', 'owner-spec', {
    brandId: 'brand-spec', name: 'AW30', season: 'AW30',
    startsAt: '2030-01-01T00:00:00.000Z', endsAt: '2030-06-01T00:00:00.000Z',
  });
  await platform.openCampaign('spec-campaign-open', 'owner-spec', campaign.id);
  const collection = await platform.createCollection('spec-collection', 'owner-spec', {
    campaignId: campaign.id, brandId: 'brand-spec', name: 'AW30 Mainline', currency: 'EUR',
  });
  const draftGrid = await productDevelopment.createSizeGrid('spec-grid', 'product-spec', {
    brandId: 'brand-spec', code: 'WOMEN', name: 'Women', sizes: ['S', 'M', 'L'], baseSize: 'M',
  });
  const grid = await productDevelopment.publishSizeGrid('spec-grid-publish', 'product-spec', draftGrid.id);
  const draftStyle = await productDevelopment.createStyle('spec-style', 'product-spec', {
    brandId: 'brand-spec', collectionId: collection.id, styleCode: 'JK-300', name: 'Field Jacket',
    category: 'Outerwear', gender: 'women', sizeGridId: grid.id,
  });
  const style = await productDevelopment.approveStyle('spec-style-approve', 'product-spec', draftStyle.id);
  return { specification, specificationStore, style };
}

test('material and BOM revisions preserve immutable costing snapshots', async () => {
  const context = await fixture();
  const created = await context.specification.createMaterial('spec-material', 'product-spec', {
    brandId: 'brand-spec', code: 'FAB-300', name: 'Cotton Twill', type: 'fabric',
    specification: {
      uom: 'm', composition: '100% cotton', colorCode: 'OLIVE', supplierName: 'Mill One',
      unitCostMinor: 250, currency: 'EUR', leadTimeDays: 30,
    },
  });
  const approvedMaterial = await context.specification.approveMaterialRevision('spec-material-approve', 'product-spec', created.revision.id);
  let bom = await context.specification.createBom('spec-bom', 'product-spec', context.style.id);
  bom = await context.specification.upsertBomLine('spec-bom-line', 'product-spec', bom.id, {
    componentKey: 'shell', componentRole: 'Main shell', materialRevisionId: approvedMaterial.id,
    consumptionMicrounits: 1_500_000, wasteBasisPoints: 1_000,
  });
  bom = await context.specification.submitBom('spec-bom-submit', 'product-spec', bom.id);
  const approvedBom = await context.specification.approveBom('spec-bom-approve', 'product-spec', bom.id);
  assert.equal(approvedBom.materialCostMinor, 413);
  assert.equal(approvedBom.lines[0].material.revisionId, approvedMaterial.id);

  const nextMaterial = await context.specification.createMaterialRevision('spec-material-revise', 'product-spec', created.material.id, {
    unitCostMinor: 275,
    leadTimeDays: 25,
  });
  const approvedNextMaterial = await context.specification.approveMaterialRevision('spec-material-revise-approve', 'product-spec', nextMaterial.id);
  let revisedBom = await context.specification.reviseBom('spec-bom-revise', 'product-spec', approvedBom.id);
  assert.equal(revisedBom.revisionNumber, 2);
  assert.equal(revisedBom.materialCostMinor, 413);
  revisedBom = await context.specification.upsertBomLine('spec-bom-line-revise', 'product-spec', revisedBom.id, {
    componentKey: 'shell', componentRole: 'Main shell', materialRevisionId: approvedNextMaterial.id,
    consumptionMicrounits: 1_500_000, wasteBasisPoints: 1_000,
  });
  assert.equal(revisedBom.materialCostMinor, 454);
  revisedBom = await context.specification.submitBom('spec-bom-revise-submit', 'product-spec', revisedBom.id);
  const approvedRevisedBom = await context.specification.approveBom('spec-bom-revise-approve', 'product-spec', revisedBom.id);

  const snapshot = context.specificationStore.snapshot();
  assert.equal(snapshot.materials.length, 1);
  assert.deepEqual(snapshot.materialRevisions.map((item) => item.status), ['superseded', 'approved']);
  assert.deepEqual(snapshot.boms.map((item) => item.status), ['superseded', 'approved']);
  assert.equal(snapshot.boms[0].materialCostMinor, 413);
  assert.equal(snapshot.boms[1].materialCostMinor, 454);
  assert.equal(snapshot.events.some((event) => event.type === 'bom.approved'), true);

  const replay = await context.specification.approveBom('spec-bom-revise-approve', 'product-spec', revisedBom.id);
  assert.deepEqual(replay, approvedRevisedBom);
});

test('commercial and viewer roles cannot mutate internal product specification', async () => {
  const context = await fixture();
  for (const actorId of ['sales-spec', 'finance-spec', 'viewer-spec']) {
    await assert.rejects(
      () => context.specification.createMaterial(`blocked-${actorId}`, actorId, {
        brandId: 'brand-spec', code: `FAB-${actorId.toUpperCase()}`, name: 'Blocked Fabric', type: 'fabric',
        specification: { uom: 'm', composition: '100% cotton', unitCostMinor: 100, currency: 'EUR', leadTimeDays: 10 },
      }),
      (error) => error.code === 'CAPABILITY_DENIED',
    );
  }
  assert.equal(context.specificationStore.snapshot().materials.length, 0);
});

test('failed BOM mutation rolls back entity, command and outbox', async () => {
  const context = await fixture();
  const created = await context.specification.createMaterial('spec-material-fail', 'product-spec', {
    brandId: 'brand-spec', code: 'FAB-FAIL', name: 'Wrong Currency Fabric', type: 'fabric',
    specification: { uom: 'm', composition: '100% cotton', unitCostMinor: 200, currency: 'USD', leadTimeDays: 20 },
  });
  const approved = await context.specification.approveMaterialRevision('spec-material-fail-approve', 'product-spec', created.revision.id);
  const bom = await context.specification.createBom('spec-bom-fail', 'product-spec', context.style.id);
  const before = context.specificationStore.snapshot();
  await assert.rejects(
    () => context.specification.upsertBomLine('spec-bom-line-fail', 'product-spec', bom.id, {
      componentKey: 'shell', componentRole: 'Shell', materialRevisionId: approved.id,
      consumptionMicrounits: 1_000_000, wasteBasisPoints: 0,
    }),
    (error) => error.code === 'BOM_MATERIAL_CURRENCY_MISMATCH',
  );
  const after = context.specificationStore.snapshot();
  assert.equal(after.boms[0].version, before.boms[0].version);
  assert.equal(after.commands.some((command) => command.id === 'spec-bom-line-fail'), false);
  assert.equal(after.outbox.length, before.outbox.length);
});
