import test from 'node:test';
import assert from 'node:assert/strict';
import { createWholesaleRoutes, matchWholesaleRoute } from '../src/http/routes.mjs';

function services(calls) {
  const noop = new Proxy({}, { get: () => async () => ({}) });
  return {
    platform: noop,
    catalog: {
      async createSku(commandId, actorId, body) { calls.push(['createSku', commandId, actorId, body]); return { sku: body.sku }; },
      async publishSku() { return {}; },
    },
    partners: noop,
    collaboration: noop,
    orders: noop,
    notifications: noop,
    workspace: { loadForActor: async () => ({}) },
    productDevelopment: {
      async createSizeGrid(commandId, actorId, body) { calls.push(['createSizeGrid', commandId, actorId, body]); return { id: 'grid-1' }; },
      async publishSizeGrid(commandId, actorId, id) { calls.push(['publishSizeGrid', commandId, actorId, id]); return { id, status: 'published' }; },
      async createStyle(commandId, actorId, body) { calls.push(['createStyle', commandId, actorId, body]); return { id: 'style-1' }; },
      async approveStyle(commandId, actorId, id) { calls.push(['approveStyle', commandId, actorId, id]); return { id, status: 'approved' }; },
    },
  };
}

test('product development HTTP routes preserve server route identifiers', async () => {
  const calls = [];
  const routes = createWholesaleRoutes(services(calls));
  const createGrid = matchWholesaleRoute(routes, 'POST', '/v2/plm/size-grids');
  const created = await createGrid.execute({ commandId: 'cmd-grid', actorId: 'product-user', body: { brandId: 'brand-1', code: 'WOMEN' }, params: [] });
  assert.equal(created.id, 'grid-1');

  const publishGrid = matchWholesaleRoute(routes, 'POST', '/v2/plm/size-grids/grid-1/publish');
  await publishGrid.execute({ commandId: 'cmd-grid-publish', actorId: 'product-user', body: { sizeGridId: 'grid-1' }, params: publishGrid.params });
  await assert.rejects(
    () => publishGrid.execute({ commandId: 'cmd-grid-mismatch', actorId: 'product-user', body: { sizeGridId: 'grid-2' }, params: publishGrid.params }),
    (error) => error.code === 'HTTP_IDENTIFIER_MISMATCH',
  );

  const createStyle = matchWholesaleRoute(routes, 'POST', '/v2/plm/styles');
  await createStyle.execute({ commandId: 'cmd-style', actorId: 'product-user', body: { brandId: 'brand-1', styleCode: 'JK-1' }, params: [] });
  const approveStyle = matchWholesaleRoute(routes, 'POST', '/v2/plm/styles/style-1/approve');
  await approveStyle.execute({ commandId: 'cmd-style-approve', actorId: 'product-user', body: {}, params: approveStyle.params });

  const createVariant = matchWholesaleRoute(routes, 'POST', '/v2/plm/styles/style-1/skus');
  const variant = await createVariant.execute({
    commandId: 'cmd-style-sku',
    actorId: 'product-user',
    body: { sku: 'JK-1-BLK-M', styleId: 'style-1', sizeLabel: 'M', colorCode: 'BLK' },
    params: createVariant.params,
  });
  assert.equal(variant.sku, 'JK-1-BLK-M');
  await assert.rejects(
    () => createVariant.execute({
      commandId: 'cmd-style-sku-mismatch', actorId: 'product-user',
      body: { sku: 'JK-1-BLK-L', styleId: 'style-2', sizeLabel: 'L', colorCode: 'BLK' }, params: createVariant.params,
    }),
    (error) => error.code === 'HTTP_IDENTIFIER_MISMATCH',
  );

  assert.deepEqual(calls.map((call) => call[0]), ['createSizeGrid', 'publishSizeGrid', 'createStyle', 'approveStyle', 'createSku']);
  assert.equal(calls.at(-1)[3].styleId, 'style-1');
});
