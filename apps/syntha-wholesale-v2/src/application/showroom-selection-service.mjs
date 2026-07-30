import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { assertWholesaleStore } from './store-contract.mjs';
import { CAPABILITIES, assertCapability } from '../modules/access-control/public.mjs';
import { createShowroom, openShowroom } from '../modules/showrooms/public.mjs';
import { createSelection, submitSelection, upsertSelectionLine } from '../modules/selections/public.mjs';
import { advanceCommercialCycle } from '../modules/commercial-cycle/public.mjs';

export function createShowroomSelectionService({
  store,
  clock = () => new Date().toISOString(),
  nextId = defaultIdGenerator(),
} = {}) {
  assertWholesaleStore(store);

  function execute(commandId, fingerprint, actorId, action) {
    invariant(commandId, 'COMMAND_ID_REQUIRED', 'Every mutation requires commandId');
    return store.transaction(async (tx) => {
      const previous = tx.getCommand(commandId);
      if (previous) {
        invariant(previous.fingerprint === fingerprint, 'COMMAND_ID_CONFLICT', 'commandId was already used by another mutation', { commandId });
        return previous.result;
      }
      const result = await action(tx);
      tx.insertCommand(Object.freeze({ id: commandId, fingerprint, actorId, result, completedAt: clock() }));
      return result;
    });
  }

  function append(tx, type, aggregateId, payload, commandId, actorId) {
    const event = domainEvent({
      id: nextId('event'),
      type,
      aggregateId,
      occurredAt: clock(),
      payload,
      metadata: { commandId, actorId },
    });
    tx.appendOutbox(event);
  }

  function assertOrganisationActor(tx, organisationId, actorId, capability) {
    const membership = tx.getMembership(organisationId, actorId);
    assertCapability(membership, capability);
  }

  return Object.freeze({
    createShowroom(commandId, actorId, input) {
      return execute(commandId, `createShowroom:${actorId}:${JSON.stringify(input)}`, actorId, (tx) => {
        const collection = requireEntity(tx.getCollection(input.collectionId), 'COLLECTION_NOT_FOUND', { collectionId: input.collectionId });
        assertOrganisationActor(tx, collection.brandId, actorId, CAPABILITIES.SHOWROOM_MANAGE);
        const showroom = createShowroom({ id: nextId('showroom'), collection, ...input, createdAt: clock() });
        tx.insertShowroom(showroom);
        append(tx, 'showroom.created', showroom.id, { collectionId: collection.id }, commandId, actorId);
        return showroom;
      });
    },

    openShowroom(commandId, actorId, showroomId) {
      return execute(commandId, `openShowroom:${actorId}:${showroomId}`, actorId, (tx) => {
        const current = requireEntity(tx.getShowroom(showroomId), 'SHOWROOM_NOT_FOUND', { showroomId });
        const collection = requireEntity(tx.getCollection(current.collectionId), 'COLLECTION_NOT_FOUND', { collectionId: current.collectionId });
        assertOrganisationActor(tx, current.brandId, actorId, CAPABILITIES.SHOWROOM_MANAGE);
        const updated = openShowroom(current, collection, clock());
        tx.saveShowroom(updated, current.version);
        append(tx, 'showroom.opened', showroomId, { version: updated.version }, commandId, actorId);
        return updated;
      });
    },

    createSelection(commandId, actorId, { cycleId, showroomId }) {
      return execute(commandId, `createSelection:${actorId}:${cycleId}:${showroomId}`, actorId, (tx) => {
        const cycle = requireEntity(tx.getCycle(cycleId), 'CYCLE_NOT_FOUND', { cycleId });
        const showroom = requireEntity(tx.getShowroom(showroomId), 'SHOWROOM_NOT_FOUND', { showroomId });
        assertOrganisationActor(tx, cycle.shopId, actorId, CAPABILITIES.SELECTION_WRITE);
        invariant(!tx.getSelectionByCycle(cycleId), 'SELECTION_FOR_CYCLE_EXISTS', 'Cycle already has a selection', { cycleId });
        const selection = createSelection({ id: nextId('selection'), cycle, showroom, createdAt: clock() });
        const advanced = advanceCommercialCycle(cycle, 'selection', clock());
        tx.insertSelection(selection);
        tx.saveCycle(advanced, cycle.version);
        append(tx, 'selection.created', selection.id, { cycleId, showroomId }, commandId, actorId);
        append(tx, 'commercial-cycle.advanced', cycleId, { from: cycle.stage, to: advanced.stage, version: advanced.version }, commandId, actorId);
        return Object.freeze({ selection, cycle: advanced });
      });
    },

    upsertSelectionLine(commandId, actorId, selectionId, line) {
      return execute(commandId, `upsertSelectionLine:${actorId}:${selectionId}:${JSON.stringify(line)}`, actorId, (tx) => {
        const current = requireEntity(tx.getSelection(selectionId), 'SELECTION_NOT_FOUND', { selectionId });
        assertOrganisationActor(tx, current.shopId, actorId, CAPABILITIES.SELECTION_WRITE);
        const updated = upsertSelectionLine(current, line, actorId, clock());
        tx.saveSelection(updated, current.version);
        append(tx, 'selection.line-upserted', selectionId, { sku: line.sku, quantity: line.quantity }, commandId, actorId);
        return updated;
      });
    },

    submitSelection(commandId, actorId, selectionId) {
      return execute(commandId, `submitSelection:${actorId}:${selectionId}`, actorId, (tx) => {
        const current = requireEntity(tx.getSelection(selectionId), 'SELECTION_NOT_FOUND', { selectionId });
        assertOrganisationActor(tx, current.shopId, actorId, CAPABILITIES.SELECTION_WRITE);
        const cycle = requireEntity(tx.getCycle(current.cycleId), 'CYCLE_NOT_FOUND', { cycleId: current.cycleId });
        invariant(cycle.stage === 'selection', 'SELECTION_CYCLE_STAGE_INVALID', 'Cycle must be at selection stage before submission', { stage: cycle.stage });
        const submitted = submitSelection(current, clock());
        const advanced = advanceCommercialCycle(cycle, 'order-builder', clock());
        tx.saveSelection(submitted, current.version);
        tx.saveCycle(advanced, cycle.version);
        append(tx, 'selection.submitted', selectionId, { lineCount: submitted.lines.length }, commandId, actorId);
        append(tx, 'commercial-cycle.advanced', cycle.id, { from: cycle.stage, to: advanced.stage, version: advanced.version }, commandId, actorId);
        return Object.freeze({ selection: submitted, cycle: advanced });
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
