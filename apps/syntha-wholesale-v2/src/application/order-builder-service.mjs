import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { assertWholesaleStore } from './store-contract.mjs';
import { CAPABILITIES, assertCapability, assertTradeCapability } from '../modules/access-control/public.mjs';
import { createOrderDraft, acceptOrderTerms, attachReadyOrder } from '../modules/orders/public.mjs';
import { advanceCommercialCycle, attachOrder } from '../modules/commercial-cycle/public.mjs';

export function createOrderBuilderService({
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
    tx.appendOutbox(domainEvent({
      id: nextId('event'),
      type,
      aggregateId,
      occurredAt: clock(),
      payload,
      metadata: { commandId, actorId },
    }));
  }

  return Object.freeze({
    createOrderDraft(commandId, actorId, { selectionId, terms }) {
      return execute(commandId, `createOrderDraft:${actorId}:${selectionId}:${JSON.stringify(terms)}`, actorId, (tx) => {
        const selection = requireEntity(tx.getSelection(selectionId), 'SELECTION_NOT_FOUND', { selectionId });
        const cycle = requireEntity(tx.getCycle(selection.cycleId), 'CYCLE_NOT_FOUND', { cycleId: selection.cycleId });
        const collection = requireEntity(tx.getCollection(selection.collectionId), 'COLLECTION_NOT_FOUND', { collectionId: selection.collectionId });
        invariant(cycle.stage === 'order-builder', 'ORDER_BUILDER_STAGE_REQUIRED', 'Cycle must be at order-builder stage', { stage: cycle.stage });
        invariant(!tx.getOrderByCycle(cycle.id), 'ORDER_FOR_CYCLE_EXISTS', 'Cycle already has an order draft', { cycleId: cycle.id });
        assertOrganisationActor(tx, selection.shopId, actorId, CAPABILITIES.ORDER_WRITE);
        const order = createOrderDraft({ id: nextId('order'), selection, currency: collection.currency, terms, createdAt: clock() });
        tx.insertOrder(order);
        append(tx, 'order.draft-created', order.id, { selectionId, totalAmount: order.totalAmount, currency: order.currency }, commandId, actorId);
        return order;
      });
    },

    acceptTerms(commandId, actorId, { orderId, organisationId }) {
      return execute(commandId, `acceptOrderTerms:${actorId}:${orderId}:${organisationId}`, actorId, (tx) => {
        const current = requireEntity(tx.getOrder(orderId), 'ORDER_NOT_FOUND', { orderId });
        invariant(organisationId === current.brandId || organisationId === current.shopId, 'ORDER_PARTY_INVALID', 'Organisation is not an order party', { organisationId });
        assertOrganisationActor(tx, organisationId, actorId, CAPABILITIES.ORDER_CONFIRM);
        const updated = acceptOrderTerms(current, organisationId, clock());
        tx.saveOrder(updated, current.version);
        append(tx, 'order.terms-accepted', orderId, { organisationId, status: updated.status }, commandId, actorId);
        return updated;
      });
    },

    attachOrderToCycle(commandId, actorId, orderId) {
      return execute(commandId, `attachOrderToCycle:${actorId}:${orderId}`, actorId, (tx) => {
        const current = requireEntity(tx.getOrder(orderId), 'ORDER_NOT_FOUND', { orderId });
        const cycle = requireEntity(tx.getCycle(current.cycleId), 'CYCLE_NOT_FOUND', { cycleId: current.cycleId });
        assertTradeCapability({
          memberships: tx.listMembershipsForTrade(cycle.brandId, cycle.shopId),
          actorId,
          brandId: cycle.brandId,
          shopId: cycle.shopId,
          capability: CAPABILITIES.ORDER_WRITE,
        });
        invariant(cycle.stage === 'order-builder', 'ORDER_BUILDER_STAGE_REQUIRED', 'Cycle must be at order-builder stage', { stage: cycle.stage });
        const readyOrder = attachReadyOrder(current, clock());
        const orderStage = advanceCommercialCycle(cycle, 'order', clock());
        tx.saveCycle(orderStage, cycle.version);
        const cycleWithOrder = attachOrder(orderStage, readyOrder, clock());
        tx.saveCycle(cycleWithOrder, orderStage.version);
        tx.saveOrder(readyOrder, current.version);
        append(tx, 'order.attached', orderId, { cycleId: cycle.id, totalAmount: readyOrder.totalAmount }, commandId, actorId);
        append(tx, 'commercial-cycle.advanced', cycle.id, { from: cycle.stage, to: orderStage.stage, version: orderStage.version }, commandId, actorId);
        return Object.freeze({ order: readyOrder, cycle: cycleWithOrder });
      });
    },
  });
}

function assertOrganisationActor(tx, organisationId, actorId, capability) {
  const membership = tx.getMembership(organisationId, actorId);
  assertCapability(membership, capability);
}

function requireEntity(entity, code, details) {
  invariant(entity, code, 'Entity not found', details);
  return entity;
}

function defaultIdGenerator() {
  let sequence = 0;
  return (prefix) => `${prefix}_${++sequence}`;
}
