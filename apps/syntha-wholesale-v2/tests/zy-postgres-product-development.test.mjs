import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';
import { createCatalogService } from '../src/application/catalog-service.mjs';
import { createPartnerAccessService } from '../src/application/partner-access-service.mjs';
import { createProductDevelopmentService } from '../src/application/product-development-service.mjs';
import { createShowroomSelectionService } from '../src/application/showroom-selection-service.mjs';
import { createOrderBuilderService } from '../src/application/order-builder-service.mjs';
import { createWorkspaceQueryService } from '../src/application/workspace-query-service.mjs';
import { createPostgresWholesaleStore } from '../src/infrastructure/postgres-store.mjs';
import { createPostgresCatalogStore } from '../src/infrastructure/postgres-catalog-store.mjs';
import { createPostgresWorkspaceReader } from '../src/infrastructure/postgres-workspace-reader.mjs';
import { migratePostgres } from '../src/infrastructure/postgres-migrator.mjs';

const databaseUrl = process.env.POSTGRES_TEST_URL;

test('PostgreSQL completes approved Style to SKU, Selection, reserved Order and DealSpace', { skip: !databaseUrl }, async () => {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: databaseUrl, max: 4 });
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const migrationsDir = path.join(root, 'db', 'migrations');
  let tick = 0;
  let id = 0;
  const clock = () => `2026-08-06T16:${String(Math.floor(tick / 60)).padStart(2, '0')}:${String(tick++ % 60).padStart(2, '0')}.000Z`;
  const nextId = (prefix) => `${prefix}_pg_${++id}`;
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await migratePostgres({ pool, migrationsDir, clock });
    const store = createPostgresWholesaleStore({ pool });
    const catalogStore = createPostgresCatalogStore({ pool });
    const options = { store, clock, nextId };
    const platform = createWholesalePlatform(options);
    const partners = createPartnerAccessService(options);
    const productDevelopment = createProductDevelopmentService(options);
    const catalog = createCatalogService({ wholesaleStore: store, catalogStore, clock, nextId });
    const collaboration = createShowroomSelectionService({ ...options, catalogReader: catalog });
    const orders = createOrderBuilderService(options);
    const workspace = createWorkspaceQueryService({ reader: createPostgresWorkspaceReader({ pool }) });

    await platform.registerOrganisation('pg-pd-org-brand', 'system', createOrganisation({ id: 'brand-pg-pd', type: 'brand', name: 'PG Product Brand' }));
    await platform.registerOrganisation('pg-pd-org-shop', 'system', createOrganisation({ id: 'shop-pg-pd', type: 'shop', name: 'PG Product Shop' }));
    await platform.grantMembership('pg-pd-owner', 'system', createMembership({
      id: 'membership-pg-pd-owner', organisationId: 'brand-pg-pd', organisationType: 'brand', userId: 'owner-pg-pd', role: 'owner', createdAt: clock(),
    }));
    await platform.grantMembership('pg-pd-product', 'owner-pg-pd', createMembership({
      id: 'membership-pg-pd-product', organisationId: 'brand-pg-pd', organisationType: 'brand', userId: 'developer-pg-pd', role: 'product', createdAt: clock(),
    }));
    await platform.grantMembership('pg-pd-buyer', 'system', createMembership({
      id: 'membership-pg-pd-buyer', organisationId: 'shop-pg-pd', organisationType: 'shop', userId: 'buyer-pg-pd', role: 'buyer', createdAt: clock(),
    }));
    const relationship = await partners.requestRelationship('pg-pd-relationship', 'owner-pg-pd', { brandId: 'brand-pg-pd', shopId: 'shop-pg-pd' });
    await partners.acceptRelationship('pg-pd-relationship-accept', 'buyer-pg-pd', relationship.id);
    const campaign = await platform.createCampaign('pg-pd-campaign', 'owner-pg-pd', {
      brandId: 'brand-pg-pd', name: 'SS29 Product Development', season: 'SS29',
      startsAt: '2028-07-01T00:00:00.000Z', endsAt: '2029-01-01T00:00:00.000Z',
    });
    await platform.openCampaign('pg-pd-campaign-open', 'owner-pg-pd', campaign.id);
    const draftCollection = await platform.createCollection('pg-pd-collection', 'owner-pg-pd', {
      campaignId: campaign.id, brandId: 'brand-pg-pd', name: 'SS29 Mainline', currency: 'EUR',
    });
    const collection = await platform.publishCollection('pg-pd-collection-publish', 'owner-pg-pd', draftCollection.id);
    const showroom = await collaboration.createShowroom('pg-pd-showroom', 'owner-pg-pd', {
      collectionId: collection.id, brandId: 'brand-pg-pd', name: 'SS29 Buyer Preview',
      opensAt: '2028-08-01T00:00:00.000Z', closesAt: '2028-09-01T00:00:00.000Z',
    });
    await collaboration.openShowroom('pg-pd-showroom-open', 'owner-pg-pd', showroom.id);
    const invitation = await partners.inviteShopToShowroom('pg-pd-invitation', 'owner-pg-pd', {
      showroomId: showroom.id, shopId: 'shop-pg-pd', expiresAt: '2028-08-20T00:00:00.000Z',
    });
    await partners.acceptShowroomInvitation('pg-pd-invitation-accept', 'buyer-pg-pd', invitation.id);

    const draftGrid = await productDevelopment.createSizeGrid('pg-pd-grid-create', 'developer-pg-pd', {
      brandId: 'brand-pg-pd', code: 'eu-women', name: 'EU Women', sizes: ['36', '38', '40', '42'], baseSize: '38',
    });
    const grid = await productDevelopment.publishSizeGrid('pg-pd-grid-publish', 'developer-pg-pd', draftGrid.id);
    const draftStyle = await productDevelopment.createStyle('pg-pd-style-create', 'developer-pg-pd', {
      brandId: 'brand-pg-pd', collectionId: collection.id, styleCode: 'DR-2901', name: 'Draped Dress',
      category: 'Dresses', gender: 'women', sizeGridId: grid.id,
    });

    const buyerBeforeApproval = await workspace.loadForActor('buyer-pg-pd');
    assert.deepEqual(buyerBeforeApproval.collections.map((item) => item.id), [collection.id]);
    assert.deepEqual(buyerBeforeApproval.showrooms.map((item) => item.id), [showroom.id]);
    assert.equal(buyerBeforeApproval.styles.length, 0);
    assert.equal(buyerBeforeApproval.sizeGrids.length, 0);

    const approved = await productDevelopment.approveStyle('pg-pd-style-approve', 'developer-pg-pd', draftStyle.id);
    const draftSku = await catalog.createSku('pg-pd-style-sku-create', 'developer-pg-pd', {
      sku: 'DR-2901-BLK-38',
      collectionId: collection.id,
      brandId: 'brand-pg-pd',
      styleId: approved.id,
      sizeLabel: '38',
      colorCode: 'BLK',
      name: 'Draped Dress Black 38',
      wholesalePrice: 150,
      currency: 'EUR',
      minimumOrderQuantity: 2,
      availableQuantity: 10,
    });
    assert.deepEqual(draftSku.productIdentity, {
      styleId: approved.id,
      styleCode: 'DR-2901',
      styleVersion: 2,
      sizeGridId: grid.id,
      sizeGridCode: 'EU-WOMEN',
      sizeGridVersion: 2,
      sizeLabel: '38',
      colorCode: 'BLK',
    });
    const publishedSku = await catalog.publishSku('pg-pd-style-sku-publish', 'developer-pg-pd', draftSku.sku);

    const buyerAfterPublication = await workspace.loadForActor('buyer-pg-pd');
    assert.deepEqual(buyerAfterPublication.styles.map((item) => item.id), [approved.id]);
    assert.deepEqual(buyerAfterPublication.sizeGrids.map((item) => item.id), [grid.id]);
    assert.deepEqual(buyerAfterPublication.catalogSkus.map((item) => item.sku), [publishedSku.sku]);
    assert.equal(buyerAfterPublication.catalogSkus[0].productIdentity.styleId, approved.id);

    let cycle = await platform.startCycle('pg-pd-cycle', 'buyer-pg-pd', {
      brandId: 'brand-pg-pd', shopId: 'shop-pg-pd', campaignId: campaign.id, collectionId: collection.id,
    });
    cycle = await platform.advanceCycle('pg-pd-cycle-collection', 'buyer-pg-pd', cycle.id, 'collection');
    cycle = await platform.advanceCycle('pg-pd-cycle-showroom', 'buyer-pg-pd', cycle.id, 'showroom');
    const created = await collaboration.createSelection('pg-pd-selection', 'buyer-pg-pd', { cycleId: cycle.id, showroomId: showroom.id });
    const edited = await collaboration.upsertSelectionLine('pg-pd-selection-line', 'buyer-pg-pd', created.selection.id, {
      sku: publishedSku.sku,
      quantity: 4,
    });
    assert.equal(edited.lines[0].unitPrice, 150);
    assert.equal(edited.lines[0].catalogVersion, 2);
    const submitted = await collaboration.submitSelection('pg-pd-selection-submit', 'buyer-pg-pd', edited.id);
    let order = await orders.createOrderDraft('pg-pd-order', 'buyer-pg-pd', {
      selectionId: submitted.selection.id,
      terms: {
        incoterm: 'DAP', paymentDays: 30, prepaymentPercent: 20,
        deliveryStart: '2028-10-01', deliveryEnd: '2028-10-31',
      },
    });
    order = await orders.acceptTerms('pg-pd-order-shop-accept', 'buyer-pg-pd', { orderId: order.id, organisationId: 'shop-pg-pd' });
    order = await orders.acceptTerms('pg-pd-order-brand-accept', 'owner-pg-pd', { orderId: order.id, organisationId: 'brand-pg-pd' });
    const attached = await orders.attachOrderToCycle('pg-pd-order-attach', 'buyer-pg-pd', order.id);
    const opened = await platform.confirmAndOpenDeal('pg-pd-deal', 'buyer-pg-pd', attached.cycle.id);
    assert.equal(opened.cycle.stage, 'deal-space');
    assert.equal(opened.deal.totalAmount, 600);

    const catalogRow = await pool.query(
      `SELECT style_id, style_version, size_grid_id, size_grid_version, size_label, color_code,
              available_quantity, reserved_quantity, payload
         FROM catalog_skus WHERE sku = $1`,
      [publishedSku.sku],
    );
    assert.equal(catalogRow.rows[0].style_id, approved.id);
    assert.equal(catalogRow.rows[0].style_version, 2);
    assert.equal(catalogRow.rows[0].size_grid_id, grid.id);
    assert.equal(catalogRow.rows[0].size_grid_version, 2);
    assert.equal(catalogRow.rows[0].size_label, '38');
    assert.equal(catalogRow.rows[0].color_code, 'BLK');
    assert.equal(catalogRow.rows[0].reserved_quantity, 4);
    assert.equal(catalogRow.rows[0].payload.availableToSell, 6);

    await assert.rejects(
      () => catalog.createSku('pg-pd-duplicate-variant', 'developer-pg-pd', {
        sku: 'DR-2901-BLK-38-ALT', collectionId: collection.id, brandId: 'brand-pg-pd', styleId: approved.id,
        sizeLabel: '38', colorCode: 'BLK', name: 'Duplicate Dress Variant', wholesalePrice: 155,
        currency: 'EUR', minimumOrderQuantity: 2, availableQuantity: 5,
      }),
      (error) => error.code === 'CATALOG_STYLE_VARIANT_EXISTS',
    );
    const failedCommand = await pool.query("SELECT count(*)::int AS count FROM catalog_commands WHERE id = 'pg-pd-duplicate-variant'");
    assert.equal(failedCommand.rows[0].count, 0);
  } finally {
    await pool.end();
  }
});
