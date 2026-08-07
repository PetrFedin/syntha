import test from 'node:test';
import assert from 'node:assert/strict';
import { createWholesaleRoutes, matchWholesaleRoute } from '../src/http/routes.mjs';

function services(calls) {
  const noop = new Proxy({}, { get: () => async () => ({}) });
  return {
    platform: noop,
    catalog: noop,
    productDevelopment: noop,
    productSpecification: {
      async createMaterial(commandId, actorId, body) { calls.push(['createMaterial', commandId, actorId, body]); return { material: { id: 'material-1' } }; },
      async createMaterialRevision(commandId, actorId, materialId, changes) { calls.push(['createMaterialRevision', commandId, actorId, materialId, changes]); return { id: 'revision-2' }; },
      async approveMaterialRevision(commandId, actorId, revisionId) { calls.push(['approveMaterialRevision', commandId, actorId, revisionId]); return { id: revisionId, status: 'approved' }; },
      async createBom(commandId, actorId, styleId) { calls.push(['createBom', commandId, actorId, styleId]); return { id: 'bom-1' }; },
      async reviseBom(commandId, actorId, bomId) { calls.push(['reviseBom', commandId, actorId, bomId]); return { id: 'bom-2' }; },
      async upsertBomLine(commandId, actorId, bomId, body) { calls.push(['upsertBomLine', commandId, actorId, bomId, body]); return { id: bomId }; },
      async removeBomLine(commandId, actorId, bomId, componentKey) { calls.push(['removeBomLine', commandId, actorId, bomId, componentKey]); return { id: bomId }; },
      async submitBom(commandId, actorId, bomId) { calls.push(['submitBom', commandId, actorId, bomId]); return { id: bomId, status: 'submitted' }; },
      async approveBom(commandId, actorId, bomId) { calls.push(['approveBom', commandId, actorId, bomId]); return { id: bomId, status: 'approved' }; },
    },
    partners: noop,
    collaboration: noop,
    orders: noop,
    notifications: noop,
    workspace: { loadForActor: async () => ({}) },
  };
}

test('material and BOM routes keep path identifiers authoritative', async () => {
  const calls = [];
  const routes = createWholesaleRoutes(services(calls));

  const createMaterial = matchWholesaleRoute(routes, 'POST', '/v2/plm/materials');
  await createMaterial.execute({ commandId: 'cmd-material', actorId: 'product-user', params: [], body: { brandId: 'brand-1', code: 'FAB-1' } });

  const reviseMaterial = matchWholesaleRoute(routes, 'POST', '/v2/plm/materials/material-1/revisions');
  await reviseMaterial.execute({
    commandId: 'cmd-material-revise', actorId: 'product-user', params: reviseMaterial.params,
    body: { materialId: 'material-1', changes: { unitCostMinor: 300 } },
  });
  assert.throws(
    () => reviseMaterial.execute({
      commandId: 'cmd-material-mismatch', actorId: 'product-user', params: reviseMaterial.params,
      body: { materialId: 'material-2', changes: { unitCostMinor: 300 } },
    }),
    (error) => error.code === 'HTTP_IDENTIFIER_MISMATCH',
  );

  const line = matchWholesaleRoute(routes, 'PUT', '/v2/plm/boms/bom-1/lines/shell');
  await line.execute({
    commandId: 'cmd-bom-line', actorId: 'product-user', params: line.params,
    body: { bomId: 'bom-1', componentKey: 'shell', materialRevisionId: 'revision-1', componentRole: 'Shell', consumptionMicrounits: 1_000_000, wasteBasisPoints: 0 },
  });
  assert.equal(calls.at(-1)[4].componentKey, 'shell');

  const remove = matchWholesaleRoute(routes, 'DELETE', '/v2/plm/boms/bom-1/lines/shell');
  await remove.execute({ commandId: 'cmd-bom-remove', actorId: 'product-user', params: remove.params, body: {} });
  assert.deepEqual(calls.map((item) => item[0]), ['createMaterial', 'createMaterialRevision', 'upsertBomLine', 'removeBomLine']);
});
