import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';
import { createPartnerAccessService } from '../src/application/partner-access-service.mjs';
import { createProductDevelopmentService } from '../src/application/product-development-service.mjs';
import { createWorkspaceQueryService } from '../src/application/workspace-query-service.mjs';
import { createPostgresWholesaleStore } from '../src/infrastructure/postgres-store.mjs';
import { createPostgresWorkspaceReader } from '../src/infrastructure/postgres-workspace-reader.mjs';
import { migratePostgres } from '../src/infrastructure/postgres-migrator.mjs';

const databaseUrl = process.env.POSTGRES_TEST_URL;

test('PostgreSQL persists Style development and exposes only approved product data to the shop', { skip: !databaseUrl }, async () => {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: databaseUrl, max: 4 });
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const migrationsDir = path.join(root, 'db', 'migrations');
  const now = '2026-08-06T16:00:00.000Z';
  let id = 0;
  const clock = () => now;
  const nextId = (prefix) => `${prefix}_pg_${++id}`;
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await migratePostgres({ pool, migrationsDir, clock });
    const store = createPostgresWholesaleStore({ pool });
    const options = { store, clock, nextId };
    const platform = createWholesalePlatform(options);
    const partners = createPartnerAccessService(options);
    const productDevelopment = createProductDevelopmentService(options);
    const workspace = createWorkspaceQueryService({ reader: createPostgresWorkspaceReader({ pool }) });

    await platform.registerOrganisation('pg-pd-org-brand', 'system', createOrganisation({ id: 'brand-pg-pd', type: 'brand', name: 'PG Product Brand' }));
    await platform.registerOrganisation('pg-pd-org-shop', 'system', createOrganisation({ id: 'shop-pg-pd', type: 'shop', name: 'PG Product Shop' }));
    await platform.grantMembership('pg-pd-owner', 'system', createMembership({
      id: 'membership-pg-pd-owner', organisationId: 'brand-pg-pd', organisationType: 'brand', userId: 'owner-pg-pd', role: 'owner', createdAt: now,
    }));
    await platform.grantMembership('pg-pd-product', 'owner-pg-pd', createMembership({
      id: 'membership-pg-pd-product', organisationId: 'brand-pg-pd', organisationType: 'brand', userId: 'developer-pg-pd', role: 'product', createdAt: now,
    }));
    await platform.grantMembership('pg-pd-buyer', 'system', createMembership({
      id: 'membership-pg-pd-buyer', organisationId: 'shop-pg-pd', organisationType: 'shop', userId: 'buyer-pg-pd', role: 'buyer', createdAt: now,
    }));
    const relationship = await partners.requestRelationship('pg-pd-relationship', 'owner-pg-pd', { brandId: 'brand-pg-pd', shopId: 'shop-pg-pd' });
    await partners.acceptRelationship('pg-pd-relationship-accept', 'buyer-pg-pd', relationship.id);
    const campaign = await platform.createCampaign('pg-pd-campaign', 'owner-pg-pd', {
      brandId: 'brand-pg-pd', name: 'SS29 Product Development', season: 'SS29',
      startsAt: '2028-07-01T00:00:00.000Z', endsAt: '2029-01-01T00:00:00.000Z',
    });
    await platform.openCampaign('pg-pd-campaign-open', 'owner-pg-pd', campaign.id);
    const collection = await platform.createCollection('pg-pd-collection', 'owner-pg-pd', {
      campaignId: campaign.id, brandId: 'brand-pg-pd', name: 'SS29 Mainline', currency: 'EUR',
    });
    await platform.startCycle('pg-pd-cycle', 'buyer-pg-pd', {
      brandId: 'brand-pg-pd', shopId: 'shop-pg-pd', campaignId: campaign.id, collectionId: collection.id,
    });

    const draftGrid = await productDevelopment.createSizeGrid('pg-pd-grid-create', 'developer-pg-pd', {
      brandId: 'brand-pg-pd', code: 'eu-women', name: 'EU Women', sizes: ['36', '38', '40', '42'], baseSize: '38',
    });
    const grid = await productDevelopment.publishSizeGrid('pg-pd-grid-publish', 'developer-pg-pd', draftGrid.id);
    const draftStyle = await productDevelopment.createStyle('pg-pd-style-create', 'developer-pg-pd', {
      brandId: 'brand-pg-pd', collectionId: collection.id, styleCode: 'DR-2901', name: 'Draped Dress',
      category: 'Dresses', gender: 'women', sizeGridId: grid.id,
    });

    const buyerBeforeApproval = await workspace.loadForActor('buyer-pg-pd');
    assert.equal(buyerBeforeApproval.styles.length, 0);
    assert.equal(buyerBeforeApproval.sizeGrids.length, 0);

    const approved = await productDevelopment.approveStyle('pg-pd-style-approve', 'developer-pg-pd', draftStyle.id);
    const buyerAfterApproval = await workspace.loadForActor('buyer-pg-pd');
    assert.deepEqual(buyerAfterApproval.styles.map((item) => item.id), [approved.id]);
    assert.deepEqual(buyerAfterApproval.sizeGrids.map((item) => item.id), [grid.id]);
    assert.equal(buyerAfterApproval.styles[0].sizeGrid.version, 2);

    const brandWorkspace = await workspace.loadForActor('developer-pg-pd');
    assert.equal(brandWorkspace.styles.length, 1);
    assert.equal(brandWorkspace.sizeGrids.length, 1);

    const rows = await pool.query(
      `SELECT
         (SELECT status FROM product_size_grids WHERE id = $1) AS grid_status,
         (SELECT status FROM product_styles WHERE id = $2) AS style_status,
         (SELECT count(*)::int FROM commands WHERE id LIKE 'pg-pd-%') AS command_count,
         (SELECT count(*)::int FROM outbox_events WHERE event_type IN ('size-grid.created','size-grid.published','style.created','style.approved')) AS event_count`,
      [grid.id, approved.id],
    );
    assert.equal(rows.rows[0].grid_status, 'published');
    assert.equal(rows.rows[0].style_status, 'approved');
    assert.equal(rows.rows[0].event_count, 4);
    assert.ok(rows.rows[0].command_count >= 4);
  } finally {
    await pool.end();
  }
});
