import { invariant } from '../core/errors.mjs';

export function createMemoryProductSpecificationStore({ sourceStore } = {}) {
  invariant(sourceStore && typeof sourceStore.snapshot === 'function', 'PRODUCT_SPEC_SOURCE_STORE_REQUIRED', 'Product specification source store is required');
  let state = emptyState();
  let tail = Promise.resolve();

  function transaction(work) {
    const run = tail.then(async () => {
      const source = await sourceStore.snapshot();
      const draft = cloneState(state);
      const result = await work(view(draft, source));
      state = draft;
      return result;
    });
    tail = run.catch(() => undefined);
    return run;
  }

  return Object.freeze({
    transaction,
    snapshot() {
      return Object.freeze({
        materials: [...state.materials.values()],
        materialRevisions: [...state.materialRevisions.values()],
        boms: [...state.boms.values()],
        commands: [...state.commands.values()],
        outbox: [...state.outbox.values()],
        events: [...state.outbox.values()].map((record) => record.event),
      });
    },
  });
}

function emptyState() {
  return {
    materials: new Map(),
    materialRevisions: new Map(),
    boms: new Map(),
    commands: new Map(),
    outbox: new Map(),
  };
}

function cloneState(state) {
  return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, new Map(value)]));
}

function view(state, source) {
  return Object.freeze({
    getOrganisation: async (id) => source.organisations.find((item) => item.id === id),
    getMembership: async (organisationId, userId) => source.memberships.find((item) => item.organisationId === organisationId && item.userId === userId),
    getCollection: async (id) => source.collections.find((item) => item.id === id),
    getStyle: async (id) => source.styles.find((item) => item.id === id),

    getMaterial: async (id) => state.materials.get(id),
    getMaterialByCode: async (brandId, code) => [...state.materials.values()].find((item) => item.brandId === brandId && item.code === code),
    insertMaterial: async (material) => insertUnique(state.materials, material.id, material, 'MATERIAL_ALREADY_EXISTS'),

    getMaterialRevision: async (id) => state.materialRevisions.get(id),
    listMaterialRevisions: async (materialId) => [...state.materialRevisions.values()].filter((item) => item.materialId === materialId).sort((left, right) => left.revisionNumber - right.revisionNumber),
    getDraftMaterialRevision: async (materialId) => [...state.materialRevisions.values()].find((item) => item.materialId === materialId && item.status === 'draft'),
    getApprovedMaterialRevision: async (materialId) => [...state.materialRevisions.values()].find((item) => item.materialId === materialId && item.status === 'approved'),
    insertMaterialRevision: async (revision) => insertUnique(state.materialRevisions, revision.id, revision, 'MATERIAL_REVISION_ALREADY_EXISTS'),
    saveMaterialRevision: async (revision, expectedVersion) => saveVersioned(state.materialRevisions, revision, expectedVersion, 'MATERIAL_REVISION_CONCURRENCY_CONFLICT'),

    getBom: async (id) => state.boms.get(id),
    listBomsByStyle: async (styleId) => [...state.boms.values()].filter((item) => item.styleId === styleId).sort((left, right) => left.revisionNumber - right.revisionNumber),
    getActiveBomByStyle: async (styleId) => [...state.boms.values()].find((item) => item.styleId === styleId && ['draft', 'submitted'].includes(item.status)),
    getApprovedBomByStyle: async (styleId) => [...state.boms.values()].find((item) => item.styleId === styleId && item.status === 'approved'),
    insertBom: async (bom) => insertUnique(state.boms, bom.id, bom, 'BOM_ALREADY_EXISTS'),
    saveBom: async (bom, expectedVersion) => saveVersioned(state.boms, bom, expectedVersion, 'BOM_CONCURRENCY_CONFLICT'),

    getCommand: async (id) => state.commands.get(id),
    insertCommand: async (command) => insertUnique(state.commands, command.id, command, 'COMMAND_ALREADY_EXISTS'),
    appendOutbox: async (event) => insertUnique(state.outbox, event.id, Object.freeze({ event, status: 'pending', publishedAt: null }), 'OUTBOX_EVENT_ALREADY_EXISTS'),
  });
}

function insertUnique(map, key, value, code) {
  invariant(!map.has(key), code, 'Entity already exists', { key });
  map.set(key, value);
}

function saveVersioned(map, entity, expectedVersion, code) {
  const current = map.get(entity.id);
  invariant(current, 'ENTITY_NOT_FOUND', 'Versioned entity not found', { id: entity.id });
  invariant(current.version === expectedVersion, code, 'Optimistic concurrency conflict', {
    id: entity.id,
    expectedVersion,
    actualVersion: current.version,
  });
  invariant(entity.version === expectedVersion + 1, 'VERSION_INCREMENT_INVALID', 'Version must increment exactly once', {
    id: entity.id,
    expectedVersion,
    nextVersion: entity.version,
  });
  map.set(entity.id, entity);
}
