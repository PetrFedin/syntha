import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { CAPABILITIES, assertCapability } from '../modules/access-control/public.mjs';
import { approveStyle, createSizeGrid, createStyle, publishSizeGrid } from '../modules/product-development/public.mjs';

export function createProductDevelopmentService({
  store,
  clock = () => new Date().toISOString(),
  nextId = defaultIdGenerator(),
} = {}) {
  invariant(store && typeof store.transaction === 'function', 'WHOLESALE_STORE_REQUIRED', 'Wholesale store is required');

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
    invariant(brand.type === 'brand', 'BRAND_REQUIRED', 'Product development owner must be a brand', { brandId });
    const membership = await tx.getMembership(brandId, actorId);
    assertCapability(membership, CAPABILITIES.PRODUCT_DEVELOPMENT_MANAGE);
    return brand;
  }

  return Object.freeze({
    createSizeGrid(commandId, actorId, input) {
      return execute(commandId, `createSizeGrid:${actorId}:${JSON.stringify(input)}`, actorId, async (tx) => {
        await assertBrandActor(tx, input.brandId, actorId);
        invariant(!await tx.getSizeGridByCode(input.brandId, String(input.code ?? '').trim().toUpperCase()), 'SIZE_GRID_CODE_EXISTS', 'Size grid code already exists for brand', {
          brandId: input.brandId,
          code: input.code,
        });
        const sizeGrid = createSizeGrid({ id: nextId('size-grid'), ...input, createdAt: clock() });
        await tx.insertSizeGrid(sizeGrid);
        await append(tx, 'size-grid.created', sizeGrid.id, {
          brandId: sizeGrid.brandId,
          code: sizeGrid.code,
          sizes: sizeGrid.sizes,
          baseSize: sizeGrid.baseSize,
        }, commandId, actorId);
        return sizeGrid;
      });
    },

    publishSizeGrid(commandId, actorId, sizeGridId) {
      return execute(commandId, `publishSizeGrid:${actorId}:${sizeGridId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getSizeGrid(sizeGridId), 'SIZE_GRID_NOT_FOUND', { sizeGridId });
        await assertBrandActor(tx, current.brandId, actorId);
        const published = publishSizeGrid(current, clock());
        await tx.saveSizeGrid(published, current.version);
        await append(tx, 'size-grid.published', published.id, {
          brandId: published.brandId,
          code: published.code,
          version: published.version,
        }, commandId, actorId);
        return published;
      });
    },

    createStyle(commandId, actorId, input) {
      return execute(commandId, `createStyle:${actorId}:${JSON.stringify(input)}`, actorId, async (tx) => {
        const collection = requireEntity(await tx.getCollection(input.collectionId), 'COLLECTION_NOT_FOUND', { collectionId: input.collectionId });
        await assertBrandActor(tx, collection.brandId, actorId);
        invariant(input.brandId === collection.brandId, 'STYLE_COLLECTION_BRAND_MISMATCH', 'Style brand must match collection brand');
        const sizeGrid = requireEntity(await tx.getSizeGrid(input.sizeGridId), 'SIZE_GRID_NOT_FOUND', { sizeGridId: input.sizeGridId });
        const styleCode = String(input.styleCode ?? '').trim().toUpperCase();
        invariant(!await tx.getStyleByCode(input.brandId, styleCode), 'STYLE_CODE_EXISTS', 'Style code already exists for brand', {
          brandId: input.brandId,
          styleCode,
        });
        const style = createStyle({ id: nextId('style'), ...input, collection, sizeGrid, createdAt: clock() });
        await tx.insertStyle(style);
        await append(tx, 'style.created', style.id, {
          brandId: style.brandId,
          collectionId: style.collectionId,
          styleCode: style.styleCode,
          sizeGridId: style.sizeGrid.id,
          sizeGridVersion: style.sizeGrid.version,
        }, commandId, actorId);
        return style;
      });
    },

    approveStyle(commandId, actorId, styleId) {
      return execute(commandId, `approveStyle:${actorId}:${styleId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getStyle(styleId), 'STYLE_NOT_FOUND', { styleId });
        await assertBrandActor(tx, current.brandId, actorId);
        const approved = approveStyle(current, clock());
        await tx.saveStyle(approved, current.version);
        await append(tx, 'style.approved', approved.id, {
          brandId: approved.brandId,
          collectionId: approved.collectionId,
          styleCode: approved.styleCode,
          sizeGridId: approved.sizeGrid.id,
          sizeGridVersion: approved.sizeGrid.version,
          version: approved.version,
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
