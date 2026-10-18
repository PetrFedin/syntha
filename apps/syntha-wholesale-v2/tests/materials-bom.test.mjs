import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approveMaterialRevision,
  createMaterial,
  createMaterialRevision,
  createNextMaterialRevision,
  supersedeMaterialRevision,
} from '../src/modules/materials/public.mjs';
import { approveBom, createBom, submitBom, upsertBomLine } from '../src/modules/bom/public.mjs';

const material = createMaterial({
  id: 'material-1', brandId: 'brand-1', code: 'fab-001', name: 'Cotton Twill', type: 'fabric', createdAt: '2026-08-07T09:00:00.000Z',
});
const collection = Object.freeze({ id: 'collection-1', brandId: 'brand-1', currency: 'EUR' });
const style = Object.freeze({ id: 'style-1', brandId: 'brand-1', collectionId: 'collection-1', styleCode: 'JK-100', status: 'approved', version: 2 });

function draftRevision(unitCostMinor = 250, currency = 'EUR') {
  return createMaterialRevision({
    id: `material-revision-${currency}-${unitCostMinor}`,
    material,
    revisionNumber: 1,
    specification: {
      uom: 'm', composition: '100% cotton', colorCode: 'NATURAL', supplierName: 'Mill One',
      unitCostMinor, currency, leadTimeDays: 30,
    },
    createdAt: '2026-08-07T09:00:00.000Z',
  });
}

test('material revision lifecycle preserves approved history and sequential changes', () => {
  const first = approveMaterialRevision(draftRevision(), '2026-08-07T09:01:00.000Z');
  const secondDraft = createNextMaterialRevision({
    id: 'material-revision-2', material, approvedRevision: first,
    changes: { unitCostMinor: 275, leadTimeDays: 25 }, createdAt: '2026-08-07T09:02:00.000Z',
  });
  assert.equal(secondDraft.revisionNumber, 2);
  assert.equal(secondDraft.status, 'draft');
  assert.equal(secondDraft.specification.unitCostMinor, 275);
  assert.equal(secondDraft.specification.composition, '100% cotton');
  const superseded = supersedeMaterialRevision(first, '2026-08-07T09:03:00.000Z');
  assert.equal(superseded.status, 'superseded');
  assert.equal(superseded.version, 3);
});

test('BOM calculates fixed-point material cost and locks editing after submission', () => {
  const approvedRevision = approveMaterialRevision(draftRevision(), '2026-08-07T09:01:00.000Z');
  let bom = createBom({ id: 'bom-1', style, collection, revisionNumber: 1, createdAt: '2026-08-07T09:02:00.000Z' });
  bom = upsertBomLine(bom, {
    componentKey: 'shell', componentRole: 'Main shell fabric', materialRevision: approvedRevision,
    consumptionMicrounits: 1_500_000, wasteBasisPoints: 1_000,
  }, '2026-08-07T09:03:00.000Z');
  assert.equal(bom.lines[0].effectiveConsumptionMicrounits, 1_650_000);
  assert.equal(bom.lines[0].lineCostMinor, 413);
  assert.equal(bom.materialCostMinor, 413);
  const submitted = submitBom(bom, '2026-08-07T09:04:00.000Z');
  const approved = approveBom(submitted, '2026-08-07T09:05:00.000Z');
  assert.equal(approved.status, 'approved');
  assert.throws(
    () => upsertBomLine(approved, {
      componentKey: 'lining', componentRole: 'Lining', materialRevision: approvedRevision,
      consumptionMicrounits: 500_000, wasteBasisPoints: 0,
    }, '2026-08-07T09:06:00.000Z'),
    (error) => error.code === 'BOM_NOT_DRAFT',
  );
});

test('BOM rejects draft material revisions and cross-currency costing', () => {
  const bom = createBom({ id: 'bom-2', style, collection, revisionNumber: 1, createdAt: 'now' });
  assert.throws(
    () => upsertBomLine(bom, {
      componentKey: 'shell', componentRole: 'Shell', materialRevision: draftRevision(),
      consumptionMicrounits: 1_000_000, wasteBasisPoints: 0,
    }, 'now'),
    (error) => error.code === 'BOM_MATERIAL_REVISION_NOT_APPROVED',
  );
  const usd = approveMaterialRevision(draftRevision(200, 'USD'), 'now');
  assert.throws(
    () => upsertBomLine(bom, {
      componentKey: 'shell', componentRole: 'Shell', materialRevision: usd,
      consumptionMicrounits: 1_000_000, wasteBasisPoints: 0,
    }, 'now'),
    (error) => error.code === 'BOM_MATERIAL_CURRENCY_MISMATCH',
  );
});
