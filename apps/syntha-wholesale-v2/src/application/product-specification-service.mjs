import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { CAPABILITIES, assertCapability } from '../modules/access-control/public.mjs';
import {
  approveMaterialRevision,
  createMaterial,
  createMaterialRevision,
  createNextMaterialRevision,
  supersedeMaterialRevision,
} from '../modules/materials/public.mjs';
import {
  approveBom,
  createBom,
  removeBomLine,
  submitBom,
  supersedeBom,
  upsertBomLine,
} from '../modules/bom/public.mjs';

export function createProductSpecificationService({
  store,
  clock = () => new Date().toISOString(),
  nextId = defaultIdGenerator(),
} = {}) {
  invariant(store && typeof store.transaction === 'function', 'PRODUCT_SPEC_STORE_REQUIRED', 'Product specification store is required');

  function execute(commandId, fingerprint, actorId, action) {
    invariant(commandId, 'COMMAND_ID_REQUIRED', 'Every mutation requires commandId');
    return store.transaction(async (tx) => {
      const previous = await tx.getCommand(commandId);
      if (previous) {
        invariant(previous.fingerprint === fingerprint, 'COMMAND_ID_CONFLICT', 'commandId was already used by another mutation', { commandId });
        return previous.result;
      }
      const result = await action(tx);
      await tx.insertCommand(Object.freeze({ id: commandId, fingerprint, actorId, result, completedAt: clock() }));
      return result;
    });
  }

  async function append(tx, type, aggregateId, payload, commandId, actorId) {
    await tx.appendOutbox(domainEvent({
      id: nextId('event'),
      type,
      aggregateId,
      occurredAt: clock(),
      payload,
      metadata: { commandId, actorId },
    }));
  }

  async function assertBrandActor(tx, brandId, actorId) {
    const brand = requireEntity(await tx.getOrganisation(brandId), 'BRAND_NOT_FOUND', { brandId });
    invariant(brand.type === 'brand', 'BRAND_REQUIRED', 'Product specification owner must be a brand', { brandId });
    const membership = await tx.getMembership(brandId, actorId);
    assertCapability(membership, CAPABILITIES.PRODUCT_SPECIFICATION_MANAGE);
  }

  return Object.freeze({
    createMaterial(commandId, actorId, input) {
      return execute(commandId, `createMaterial:${actorId}:${JSON.stringify(input)}`, actorId, async (tx) => {
        await assertBrandActor(tx, input.brandId, actorId);
        const normalizedCode = String(input.code ?? '').trim().toUpperCase();
        invariant(!await tx.getMaterialByCode(input.brandId, normalizedCode), 'MATERIAL_CODE_EXISTS', 'Material code already exists for brand', {
          brandId: input.brandId,
          code: normalizedCode,
        });
        const material = createMaterial({ id: nextId('material'), brandId: input.brandId, code: input.code, name: input.name, type: input.type, createdAt: clock() });
        const revision = createMaterialRevision({ id: nextId('material-revision'), material, revisionNumber: 1, specification: input.specification, createdAt: clock() });
        await tx.insertMaterial(material);
        await tx.insertMaterialRevision(revision);
        await append(tx, 'material.created', material.id, {
          brandId: material.brandId,
          code: material.code,
          type: material.type,
          revisionId: revision.id,
          revisionNumber: revision.revisionNumber,
        }, commandId, actorId);
        return Object.freeze({ material, revision });
      });
    },

    approveMaterialRevision(commandId, actorId, revisionId) {
      return execute(commandId, `approveMaterialRevision:${actorId}:${revisionId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getMaterialRevision(revisionId), 'MATERIAL_REVISION_NOT_FOUND', { revisionId });
        await assertBrandActor(tx, current.brandId, actorId);
        const approvedAt = clock();
        const previous = await tx.getApprovedMaterialRevision(current.materialId);
        if (previous && previous.id !== current.id) {
          const superseded = supersedeMaterialRevision(previous, approvedAt);
          await tx.saveMaterialRevision(superseded, previous.version);
        }
        const approved = approveMaterialRevision(current, approvedAt);
        await tx.saveMaterialRevision(approved, current.version);
        await append(tx, 'material-revision.approved', approved.id, {
          materialId: approved.materialId,
          brandId: approved.brandId,
          revisionNumber: approved.revisionNumber,
          previousRevisionId: previous?.id ?? null,
        }, commandId, actorId);
        return approved;
      });
    },

    createMaterialRevision(commandId, actorId, materialId, changes = {}) {
      return execute(commandId, `createMaterialRevision:${actorId}:${materialId}:${JSON.stringify(changes)}`, actorId, async (tx) => {
        const material = requireEntity(await tx.getMaterial(materialId), 'MATERIAL_NOT_FOUND', { materialId });
        await assertBrandActor(tx, material.brandId, actorId);
        invariant(!await tx.getDraftMaterialRevision(materialId), 'MATERIAL_DRAFT_REVISION_EXISTS', 'Material already has a draft revision', { materialId });
        const approved = requireEntity(await tx.getApprovedMaterialRevision(materialId), 'APPROVED_MATERIAL_REVISION_REQUIRED', { materialId });
        const revision = createNextMaterialRevision({ id: nextId('material-revision'), material, approvedRevision: approved, changes, createdAt: clock() });
        await tx.insertMaterialRevision(revision);
        await append(tx, 'material-revision.created', revision.id, {
          materialId,
          brandId: material.brandId,
          revisionNumber: revision.revisionNumber,
          sourceRevisionId: approved.id,
        }, commandId, actorId);
        return revision;
      });
    },

    createBom(commandId, actorId, styleId) {
      return execute(commandId, `createBom:${actorId}:${styleId}`, actorId, async (tx) => {
        const style = requireEntity(await tx.getStyle(styleId), 'STYLE_NOT_FOUND', { styleId });
        await assertBrandActor(tx, style.brandId, actorId);
        const collection = requireEntity(await tx.getCollection(style.collectionId), 'COLLECTION_NOT_FOUND', { collectionId: style.collectionId });
        const existing = await tx.listBomsByStyle(styleId);
        invariant(existing.length === 0, 'BOM_ALREADY_EXISTS_FOR_STYLE', 'Style already has a BOM; create a revision instead', { styleId });
        const bom = createBom({ id: nextId('bom'), style, collection, revisionNumber: 1, createdAt: clock() });
        await tx.insertBom(bom);
        await append(tx, 'bom.created', bom.id, {
          brandId: bom.brandId,
          styleId: bom.styleId,
          styleVersion: bom.styleVersion,
          revisionNumber: bom.revisionNumber,
        }, commandId, actorId);
        return bom;
      });
    },

    reviseBom(commandId, actorId, bomId) {
      return execute(commandId, `reviseBom:${actorId}:${bomId}`, actorId, async (tx) => {
        const source = requireEntity(await tx.getBom(bomId), 'BOM_NOT_FOUND', { bomId });
        await assertBrandActor(tx, source.brandId, actorId);
        invariant(source.status === 'approved', 'APPROVED_BOM_REQUIRED', 'Only an approved BOM can be revised', { bomId, status: source.status });
        invariant(!await tx.getActiveBomByStyle(source.styleId), 'ACTIVE_BOM_REVISION_EXISTS', 'Style already has a draft or submitted BOM revision', { styleId: source.styleId });
        const style = requireEntity(await tx.getStyle(source.styleId), 'STYLE_NOT_FOUND', { styleId: source.styleId });
        const collection = requireEntity(await tx.getCollection(source.collectionId), 'COLLECTION_NOT_FOUND', { collectionId: source.collectionId });
        const bom = createBom({ id: nextId('bom'), style, collection, revisionNumber: source.revisionNumber + 1, sourceBom: source, createdAt: clock() });
        await tx.insertBom(bom);
        await append(tx, 'bom.revision-created', bom.id, {
          styleId: bom.styleId,
          revisionNumber: bom.revisionNumber,
          sourceBomId: source.id,
        }, commandId, actorId);
        return bom;
      });
    },

    upsertBomLine(commandId, actorId, bomId, input) {
      return execute(commandId, `upsertBomLine:${actorId}:${bomId}:${JSON.stringify(input)}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getBom(bomId), 'BOM_NOT_FOUND', { bomId });
        await assertBrandActor(tx, current.brandId, actorId);
        const materialRevision = requireEntity(await tx.getMaterialRevision(input.materialRevisionId), 'MATERIAL_REVISION_NOT_FOUND', { materialRevisionId: input.materialRevisionId });
        const updated = upsertBomLine(current, { ...input, materialRevision }, clock());
        await tx.saveBom(updated, current.version);
        await append(tx, 'bom.line-upserted', updated.id, {
          styleId: updated.styleId,
          componentKey: String(input.componentKey ?? '').trim().toUpperCase(),
          materialRevisionId: materialRevision.id,
          materialCostMinor: updated.materialCostMinor,
        }, commandId, actorId);
        return updated;
      });
    },

    removeBomLine(commandId, actorId, bomId, componentKey) {
      return execute(commandId, `removeBomLine:${actorId}:${bomId}:${componentKey}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getBom(bomId), 'BOM_NOT_FOUND', { bomId });
        await assertBrandActor(tx, current.brandId, actorId);
        const updated = removeBomLine(current, componentKey, clock());
        await tx.saveBom(updated, current.version);
        await append(tx, 'bom.line-removed', updated.id, {
          styleId: updated.styleId,
          componentKey: String(componentKey ?? '').trim().toUpperCase(),
          materialCostMinor: updated.materialCostMinor,
        }, commandId, actorId);
        return updated;
      });
    },

    submitBom(commandId, actorId, bomId) {
      return execute(commandId, `submitBom:${actorId}:${bomId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getBom(bomId), 'BOM_NOT_FOUND', { bomId });
        await assertBrandActor(tx, current.brandId, actorId);
        const submitted = submitBom(current, clock());
        await tx.saveBom(submitted, current.version);
        await append(tx, 'bom.submitted', submitted.id, {
          styleId: submitted.styleId,
          revisionNumber: submitted.revisionNumber,
          lineCount: submitted.lines.length,
          materialCostMinor: submitted.materialCostMinor,
          currency: submitted.currency,
        }, commandId, actorId);
        return submitted;
      });
    },

    approveBom(commandId, actorId, bomId) {
      return execute(commandId, `approveBom:${actorId}:${bomId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getBom(bomId), 'BOM_NOT_FOUND', { bomId });
        await assertBrandActor(tx, current.brandId, actorId);
        const approvedAt = clock();
        const previous = await tx.getApprovedBomByStyle(current.styleId);
        if (previous && previous.id !== current.id) {
          const superseded = supersedeBom(previous, approvedAt);
          await tx.saveBom(superseded, previous.version);
        }
        const approved = approveBom(current, approvedAt);
        await tx.saveBom(approved, current.version);
        await append(tx, 'bom.approved', approved.id, {
          styleId: approved.styleId,
          styleVersion: approved.styleVersion,
          revisionNumber: approved.revisionNumber,
          materialCostMinor: approved.materialCostMinor,
          currency: approved.currency,
          previousBomId: previous?.id ?? null,
        }, commandId, actorId);
        return approved;
      });
    },
  });
}

function requireEntity(entity, code, details) {
  invariant(entity, code, 'Entity not found', details);
  return entity;
}

function defaultIdGenerator() {
  let sequence = 0;
  return (prefix) => `${prefix}_${++sequence}`;
}
