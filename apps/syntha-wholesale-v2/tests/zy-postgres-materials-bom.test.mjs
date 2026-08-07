import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';
import { createProductDevelopmentService } from '../src/application/product-development-service.mjs';
import { createProductSpecificationService } from '../src/application/product-specification-service.mjs';
import { createWorkspaceQueryService } from '../src/application/workspace-query-service.mjs';
import { createPostgresWholesaleStore } from '../src/infrastructure/postgres-store.mjs';
import { createPostgresProductSpecificationStore } from '../src/infrastructure/postgres-product-specification-store.mjs';
import { createPostgresWorkspaceReader } from '../src/infrastructure/postgres-workspace-reader.mjs';
import { migratePostgres } from '../src/infrastructure/postgres-migrator.mjs';

const databaseUrl = process.env.POSTGRES_TEST_URL;

test('PostgreSQL completes material revision to approved BOM with RBAC and immutable cost history', { skip: !databaseUrl }, async () => {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: databaseUrl, max: 6 });
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const migrationsDir = path.join(root, 'db', 'migrations');
  let id = 0;
  let tick = 0;
  const nextId = (prefix) => `${prefix}_pg_${++id}`;
  const baseTime = Date.parse('2026-08-07T11:00:00.000Z');
  const clock = () => new Date(baseTime + tick++ * 1_000).toISOString();
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await migratePostgres({ pool, migrationsDir, clock });
    const sourceStore = createPostgresWholesaleStore({ pool });
    const specificationStore = createPostgresProductSpecificationStore({ pool });
    const platform = createWholesalePlatform({ store: sourceStore, clock, nextId });
    const productDevelopment = createProductDevelopmentService({ store: sourceStore, clock, nextId });
    const specification = createProductSpecificationService({ store: specificationStore, clock, nextId });
    const workspace = createWorkspaceQueryService({ reader: createPostgresWorkspaceReader({ pool }) });

    await platform.registerOrganisation('pg-spec-org-brand', 'system', createOrganisation({ id: 'brand-pg-spec', type: 'brand', name: 'PG Specification Brand' }));
    await platform.registerOrganisation('pg-spec-org-shop', 'system', createOrganisation({ id: 'shop-pg-spec', type: 'shop', name: 'PG Specification Shop' }));
    await platform.grantMembership('pg-spec-owner-membership', 'system', createMembership({
      id: 'membership-pg-spec-owner', organisationId: 'brand-pg-spec', organisationType: 'brand', userId: 'owner-pg-spec', role: 'owner', createdAt: clock(),
    }));
    for (const [userId, role] of [['product-pg-spec', 'product'], ['sales-pg-spec', 'sales'], ['finance-pg-spec', 'finance'], ['viewer-pg-spec', 'viewer']]) {
      await platform.grantMembership(`pg-spec-${role}-membership`, 'owner-pg-spec', createMembership({
        id: `membership-pg-spec-${role}`, organisationId: 'brand-pg-spec', organisationType: 'brand', userId, role, createdAt: clock(),
      }));
    }
    await platform.grantMembership('pg-spec-shop-owner-membership', 'system', createMembership({
      id: 'membership-pg-spec-shop-owner', organisationId: 'shop-pg-spec', organisationType: 'shop', userId: 'owner-shop-pg-spec', role: 'owner', createdAt: clock(),
    }));
    await platform.grantMembership('pg-spec-buyer-membership', 'owner-shop-pg-spec', createMembership({
      id: 'membership-pg-spec-buyer', organisationId: 'shop-pg-spec', organisationType: 'shop', userId: 'buyer-pg-spec', role: 'buyer', createdAt: clock(),
    }));

    const campaign = await platform.createCampaign('pg-spec-campaign', 'owner-pg-spec', {
      brandId: 'brand-pg-spec', name: 'SS31', season: 'SS31',
      startsAt: '2030-07-01T00:00:00.000Z', endsAt: '2031-01-01T00:00:00.000Z',
    });
    await platform.openCampaign('pg-spec-campaign-open', 'owner-pg-spec', campaign.id);
    const collection = await platform.createCollection('pg-spec-collection', 'owner-pg-spec', {
      campaignId: campaign.id, brandId: 'brand-pg-spec', name: 'SS31 Mainline', currency: 'EUR',
    });
    const draftGrid = await productDevelopment.createSizeGrid('pg-spec-grid', 'product-pg-spec', {
      brandId: 'brand-pg-spec', code: 'EU-WOMEN', name: 'EU Women', sizes: ['36', '38', '40'], baseSize: '38',
    });
    const grid = await productDevelopment.publishSizeGrid('pg-spec-grid-publish', 'product-pg-spec', draftGrid.id);
    const draftStyle = await productDevelopment.createStyle('pg-spec-style', 'product-pg-spec', {
      brandId: 'brand-pg-spec', collectionId: collection.id, styleCode: 'DR-3100', name: 'Bias Dress',
      category: 'Dresses', gender: 'women', sizeGridId: grid.id,
    });
    const style = await productDevelopment.approveStyle('pg-spec-style-approve', 'product-pg-spec', draftStyle.id);

    const createdMaterial = await specification.createMaterial('pg-spec-material', 'product-pg-spec', {
      brandId: 'brand-pg-spec', code: 'FAB-SILK-01', name: 'Silk Twill', type: 'fabric',
      specification: {
        uom: 'm', composition: '100% silk', colorCode: 'IVORY', supplierName: 'Silk Mill',
        unitCostMinor: 1200, currency: 'EUR', leadTimeDays: 45,
      },
    });
    const approvedMaterial = await specification.approveMaterialRevision('pg-spec-material-approve', 'product-pg-spec', createdMaterial.revision.id);
    let bom = await specification.createBom('pg-spec-bom', 'product-pg-spec', style.id);
    bom = await specification.upsertBomLine('pg-spec-bom-shell', 'product-pg-spec', bom.id, {
      componentKey: 'shell', componentRole: 'Main shell', materialRevisionId: approvedMaterial.id,
      consumptionMicrounits: 2_250_000, wasteBasisPoints: 500,
    });
    assert.equal(bom.materialCostMinor, 2835);
    bom = await specification.submitBom('pg-spec-bom-submit', 'product-pg-spec', bom.id);
    const approvedBom = await specification.approveBom('pg-spec-bom-approve', 'product-pg-spec', bom.id);

    const nextMaterial = await specification.createMaterialRevision('pg-spec-material-revise', 'product-pg-spec', createdMaterial.material.id, {
      unitCostMinor: 1300,
      leadTimeDays: 40,
    });
    const approvedNextMaterial = await specification.approveMaterialRevision('pg-spec-material-revise-approve', 'product-pg-spec', nextMaterial.id);
    let revisedBom = await specification.reviseBom('pg-spec-bom-revise', 'product-pg-spec', approvedBom.id);
    assert.equal(revisedBom.materialCostMinor, 2835, 'new BOM revision must preserve the old approved material snapshot until explicitly changed');
    revisedBom = await specification.upsertBomLine('pg-spec-bom-shell-revise', 'product-pg-spec', revisedBom.id, {
      componentKey: 'shell', componentRole: 'Main shell', materialRevisionId: approvedNextMaterial.id,
      consumptionMicrounits: 2_250_000, wasteBasisPoints: 500,
    });
    assert.equal(revisedBom.materialCostMinor, 3072);
    revisedBom = await specification.submitBom('pg-spec-bom-revise-submit', 'product-pg-spec', revisedBom.id);
    const approvedRevisedBom = await specification.approveBom('pg-spec-bom-revise-approve', 'product-pg-spec', revisedBom.id);

    for (const actorId of ['sales-pg-spec', 'finance-pg-spec']) {
      const actorWorkspace = await workspace.loadForActor(actorId);
      assert.equal(actorWorkspace.materials.length, 1);
      assert.equal(actorWorkspace.materialRevisions.length, 2);
      assert.equal(actorWorkspace.boms.length, 2);
      await assert.rejects(
        () => specification.createMaterial(`pg-spec-blocked-${actorId}`, actorId, {
          brandId: 'brand-pg-spec', code: `BLOCK-${actorId.toUpperCase()}`, name: 'Blocked Material', type: 'trim',
          specification: { uom: 'pcs', unitCostMinor: 10, currency: 'EUR', leadTimeDays: 5 },
        }),
        (error) => error.code === 'CAPABILITY_DENIED',
      );
    }
    for (const actorId of ['viewer-pg-spec', 'buyer-pg-spec']) {
      const actorWorkspace = await workspace.loadForActor(actorId);
      assert.deepEqual(actorWorkspace.materials, []);
      assert.deepEqual(actorWorkspace.materialRevisions, []);
      assert.deepEqual(actorWorkspace.boms, []);
    }

    const rows = await pool.query(
      `SELECT
        (SELECT count(*)::int FROM product_materials) AS materials,
        (SELECT count(*)::int FROM product_material_revisions WHERE status = 'approved') AS approved_material_revisions,
        (SELECT count(*)::int FROM product_boms WHERE status = 'approved') AS approved_boms,
        (SELECT material_cost_minor FROM product_boms WHERE id = $1) AS approved_cost,
        (SELECT material_cost_minor FROM product_boms WHERE id = $2) AS superseded_cost,
        (SELECT count(*)::int FROM outbox_events WHERE event_type IN ('material.created','material-revision.approved','bom.created','bom.approved')) AS event_count`,
      [approvedRevisedBom.id, approvedBom.id],
    );
    assert.deepEqual(rows.rows[0], {
      materials: 1,
      approved_material_revisions: 1,
      approved_boms: 1,
      approved_cost: '3072',
      superseded_cost: '2835',
      event_count: 6,
    });

    const failedCommands = await pool.query("SELECT count(*)::int AS count FROM commands WHERE id LIKE 'pg-spec-blocked-%'");
    assert.equal(failedCommands.rows[0].count, 0);
  } finally {
    await pool.end();
  }
});
