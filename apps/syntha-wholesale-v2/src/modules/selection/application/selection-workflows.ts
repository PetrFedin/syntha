import {
  lifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';
import { getShowroom, type ShowroomRepository } from '@/modules/showroom';

import {
  addSelectionItem,
  archiveSelection,
  createSelection,
  grantShowroomAccess,
  markSelectionReady,
  revokeShowroomAccess,
  selectionId,
  selectionItemId,
  setSelectionBudget,
  setSelectionSizeCurve,
  showroomAccessGrantId,
  type Selection,
  type ShowroomAccessGrant,
  type SizeCurveEntry,
} from '../domain/selection';
import type {
  SelectionAuditAction,
  SelectionAuditRecord,
  SelectionEventName,
  SelectionOutboxEvent,
  SelectionRepository,
} from './selection-repository';

export interface SelectionClock {
  now(): Date;
}

export interface SelectionIdGenerator {
  next(prefix: string): string;
}

export class ShowroomUnavailableForBuyerAccess extends Error {
  constructor(id: string) {
    super(`Showroom ${id} is unavailable for buyer access`);
    this.name = 'ShowroomUnavailableForBuyerAccess';
  }
}

export class ShowroomNotPublishedForBuyerAccess extends Error {
  constructor(id: string) {
    super(`Showroom ${id} must be published before buyer access can be granted`);
    this.name = 'ShowroomNotPublishedForBuyerAccess';
  }
}

export class ShowroomAccessAlreadyExists extends Error {
  constructor(showroomIdValue: string, buyerOrganisationId: OrganisationId) {
    super(
      `Active access already exists for Showroom ${showroomIdValue} and buyer ${buyerOrganisationId}`,
    );
    this.name = 'ShowroomAccessAlreadyExists';
  }
}

export class ShowroomAccessNotFound extends Error {
  constructor(id: string) {
    super(`Showroom access grant ${id} was not found`);
    this.name = 'ShowroomAccessNotFound';
  }
}

export class ShowroomAccessVersionConflict extends Error {
  constructor(id: string) {
    super(`Showroom access grant ${id} was modified by another operation`);
    this.name = 'ShowroomAccessVersionConflict';
  }
}

export class SelectionAlreadyExists extends Error {
  constructor(grantId: string) {
    super(`Selection already exists for Showroom access grant ${grantId}`);
    this.name = 'SelectionAlreadyExists';
  }
}

export class SelectionNotFound extends Error {
  constructor(id: string) {
    super(`Selection ${id} was not found`);
    this.name = 'SelectionNotFound';
  }
}

export class SelectionVersionConflict extends Error {
  constructor(id: string) {
    super(`Selection ${id} was modified by another operation`);
    this.name = 'SelectionVersionConflict';
  }
}

export class SelectionAccessRevoked extends Error {
  constructor(grantId: string) {
    super(`Showroom access grant ${grantId} is revoked`);
    this.name = 'SelectionAccessRevoked';
  }
}

function audit(input: {
  readonly ids: SelectionIdGenerator;
  readonly grant: ShowroomAccessGrant;
  readonly selection?: Selection;
  readonly action: SelectionAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly resultingVersion: number;
  readonly occurredAt: Date;
}): SelectionAuditRecord {
  return Object.freeze({
    id: input.ids.next('selection-audit'),
    sellerOrganisationId: input.grant.sellerOrganisationId,
    buyerOrganisationId: input.grant.buyerOrganisationId,
    showroomId: input.grant.showroomId,
    accessGrantId: input.grant.id,
    selectionId: input.selection?.id ?? null,
    action: input.action,
    actorCredentialId: input.actorCredentialId.trim(),
    expectedVersion: input.expectedVersion,
    resultingVersion: input.resultingVersion,
    occurredAt: input.occurredAt.toISOString(),
  });
}

function event(input: {
  readonly ids: SelectionIdGenerator;
  readonly grant: ShowroomAccessGrant;
  readonly selection?: Selection;
  readonly aggregateType: 'SHOWROOM_ACCESS' | 'SELECTION';
  readonly eventName: SelectionEventName;
  readonly payload?: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: Date;
}): SelectionOutboxEvent {
  const aggregate = input.aggregateType === 'SELECTION' ? input.selection : input.grant;
  if (!aggregate) throw new Error('Selection event aggregate is required');
  return Object.freeze({
    id: input.ids.next('selection-event'),
    sellerOrganisationId: input.grant.sellerOrganisationId,
    buyerOrganisationId: input.grant.buyerOrganisationId,
    aggregateType: input.aggregateType,
    aggregateId: aggregate.id,
    aggregateVersion: aggregate.version,
    eventName: input.eventName,
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    occurredAt: input.occurredAt.toISOString(),
  });
}

async function getGrantForBuyer(input: {
  readonly repository: SelectionRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly grantId: string;
}): Promise<ShowroomAccessGrant> {
  const grant = await input.repository.findGrantForBuyer(
    input.buyerOrganisationId,
    showroomAccessGrantId(input.grantId),
  );
  if (!grant) throw new ShowroomAccessNotFound(input.grantId);
  return grant;
}

async function requireActiveGrantForSelection(input: {
  readonly repository: SelectionRepository;
  readonly selection: Selection;
}): Promise<ShowroomAccessGrant> {
  const grant = await input.repository.findGrantForBuyer(
    input.selection.buyerOrganisationId,
    input.selection.showroomAccessGrantId,
  );
  if (!grant) throw new ShowroomAccessNotFound(input.selection.showroomAccessGrantId);
  if (grant.status !== 'ACTIVE') throw new SelectionAccessRevoked(grant.id);
  return grant;
}

export async function grantShowroomAccessUseCase(input: {
  readonly repository: SelectionRepository;
  readonly showroomRepository: ShowroomRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly buyerOrganisationId: OrganisationId;
  readonly showroomId: string;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<ShowroomAccessGrant>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.sellerOrganisationId,
    commandName: 'GRANT_SHOWROOM_ACCESS',
    idempotencyKey: input.idempotencyKey,
    payload: {
      showroomId: input.showroomId.trim(),
      buyerOrganisationId: input.buyerOrganisationId,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.repository.findGrantReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  let showroom;
  try {
    showroom = await getShowroom({
      repository: input.showroomRepository,
      organisationId: input.sellerOrganisationId,
      id: input.showroomId,
    });
  } catch {
    throw new ShowroomUnavailableForBuyerAccess(input.showroomId);
  }
  if (showroom.status !== 'PUBLISHED') {
    throw new ShowroomNotPublishedForBuyerAccess(showroom.id);
  }
  const snapshot = await input.showroomRepository.findPublicationSnapshot(
    input.sellerOrganisationId,
    showroom.id,
  );
  if (!snapshot) throw new ShowroomUnavailableForBuyerAccess(showroom.id);
  const existing = await input.repository.findActiveGrant(
    input.sellerOrganisationId,
    showroom.id,
    input.buyerOrganisationId,
  );
  if (existing) {
    throw new ShowroomAccessAlreadyExists(showroom.id, input.buyerOrganisationId);
  }

  const grant = grantShowroomAccess({
    id: input.ids.next('showroom-access'),
    sellerOrganisationId: input.sellerOrganisationId,
    buyerOrganisationId: input.buyerOrganisationId,
    showroomId: showroom.id,
    showroomSnapshotId: snapshot.id,
    actorCredentialId: input.actorCredentialId,
    now,
  });
  return input.repository.createGrant(
    grant,
    audit({
      ids: input.ids,
      grant,
      action: 'ACCESS_GRANTED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: null,
      resultingVersion: grant.version,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      grant,
      aggregateType: 'SHOWROOM_ACCESS',
      eventName: 'SHOWROOM_ACCESS_GRANTED',
      payload: {
        showroomId: grant.showroomId,
        showroomSnapshotId: grant.showroomSnapshotId,
      },
      occurredAt: now,
    }),
    command,
  );
}

export async function revokeShowroomAccessUseCase(input: {
  readonly repository: SelectionRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly grantId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
}): Promise<ShowroomAccessGrant> {
  const current = await input.repository.findGrantForSeller(
    input.sellerOrganisationId,
    showroomAccessGrantId(input.grantId),
  );
  if (!current) throw new ShowroomAccessNotFound(input.grantId);
  if (current.version !== input.expectedVersion) {
    throw new ShowroomAccessVersionConflict(input.grantId);
  }
  const now = input.clock.now();
  const changed = revokeShowroomAccess(current, {
    actorCredentialId: input.actorCredentialId,
    now,
  });
  const updated = await input.repository.updateGrant(
    changed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      grant: changed,
      action: 'ACCESS_REVOKED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      resultingVersion: changed.version,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      grant: changed,
      aggregateType: 'SHOWROOM_ACCESS',
      eventName: 'SHOWROOM_ACCESS_REVOKED',
      occurredAt: now,
    }),
  );
  if (!updated) throw new ShowroomAccessVersionConflict(input.grantId);
  return changed;
}

export async function listBuyerShowroomAccess(input: {
  readonly repository: SelectionRepository;
  readonly buyerOrganisationId: OrganisationId;
}): Promise<readonly ShowroomAccessGrant[]> {
  return input.repository.listGrantsForBuyer(input.buyerOrganisationId);
}

export async function createSelectionUseCase(input: {
  readonly repository: SelectionRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly grantId: string;
  readonly title: string;
  readonly currency: string;
  readonly budgetMinor?: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<Selection>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.buyerOrganisationId,
    commandName: 'CREATE_SELECTION',
    idempotencyKey: input.idempotencyKey,
    payload: {
      grantId: input.grantId.trim(),
      title: input.title.trim(),
      currency: input.currency.trim().toUpperCase(),
      budgetMinor: input.budgetMinor ?? 0,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.repository.findSelectionReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const grant = await getGrantForBuyer(input);
  if (grant.status !== 'ACTIVE') throw new SelectionAccessRevoked(grant.id);
  const existing = await input.repository.findSelectionByGrant(
    input.buyerOrganisationId,
    grant.id,
  );
  if (existing) throw new SelectionAlreadyExists(grant.id);

  const selection = createSelection({
    id: input.ids.next('selection'),
    grant,
    buyerOrganisationId: input.buyerOrganisationId,
    title: input.title,
    currency: input.currency,
    budgetMinor: input.budgetMinor,
    ownerCredentialId: input.actorCredentialId,
    now,
  });
  return input.repository.createSelection(
    selection,
    audit({
      ids: input.ids,
      grant,
      selection,
      action: 'SELECTION_CREATED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: null,
      resultingVersion: selection.version,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      grant,
      selection,
      aggregateType: 'SELECTION',
      eventName: 'SELECTION_CREATED',
      payload: { showroomSnapshotId: selection.showroomSnapshotId },
      occurredAt: now,
    }),
    command,
  );
}

export async function getSelection(input: {
  readonly repository: SelectionRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
}): Promise<Selection> {
  const selection = await input.repository.findSelection(
    input.buyerOrganisationId,
    selectionId(input.selectionId),
  );
  if (!selection) throw new SelectionNotFound(input.selectionId);
  return selection;
}

export async function listBuyerSelections(input: {
  readonly repository: SelectionRepository;
  readonly buyerOrganisationId: OrganisationId;
}): Promise<readonly Selection[]> {
  return input.repository.listSelections(input.buyerOrganisationId);
}

async function loadMutableSelection(input: {
  readonly repository: SelectionRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
  readonly expectedVersion: number;
}): Promise<{ readonly selection: Selection; readonly grant: ShowroomAccessGrant }> {
  const selection = await getSelection(input);
  if (selection.version !== input.expectedVersion) {
    throw new SelectionVersionConflict(input.selectionId);
  }
  const grant = await requireActiveGrantForSelection({
    repository: input.repository,
    selection,
  });
  return Object.freeze({ selection, grant });
}

async function persistSelectionChange(input: {
  readonly repository: SelectionRepository;
  readonly ids: SelectionIdGenerator;
  readonly current: Selection;
  readonly changed: Selection;
  readonly grant: ShowroomAccessGrant;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly action: SelectionAuditAction;
  readonly eventName: SelectionEventName;
  readonly payload?: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: Date;
}): Promise<Selection> {
  const updated = await input.repository.updateSelection(
    input.changed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      grant: input.grant,
      selection: input.changed,
      action: input.action,
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      resultingVersion: input.changed.version,
      occurredAt: input.occurredAt,
    }),
    event({
      ids: input.ids,
      grant: input.grant,
      selection: input.changed,
      aggregateType: 'SELECTION',
      eventName: input.eventName,
      payload: input.payload,
      occurredAt: input.occurredAt,
    }),
  );
  if (!updated) throw new SelectionVersionConflict(input.current.id);
  return input.changed;
}

export async function setSelectionBudgetUseCase(input: {
  readonly repository: SelectionRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
  readonly expectedVersion: number;
  readonly budgetMinor: number;
  readonly currency?: string;
  readonly actorCredentialId: string;
}): Promise<Selection> {
  const loaded = await loadMutableSelection(input);
  const now = input.clock.now();
  const changed = setSelectionBudget(loaded.selection, {
    budgetMinor: input.budgetMinor,
    currency: input.currency,
    now,
  });
  return persistSelectionChange({
    repository: input.repository,
    ids: input.ids,
    current: loaded.selection,
    changed,
    grant: loaded.grant,
    expectedVersion: input.expectedVersion,
    actorCredentialId: input.actorCredentialId,
    action: 'BUDGET_CHANGED',
    eventName: 'SELECTION_BUDGET_CHANGED',
    payload: { budgetMinor: changed.budgetMinor, currency: changed.currency },
    occurredAt: now,
  });
}

export async function addSelectionItemUseCase(input: {
  readonly repository: SelectionRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
  readonly expectedVersion: number;
  readonly productReference: string;
  readonly variantReference?: string;
  readonly quantityIntent?: number;
  readonly note?: string;
  readonly actorCredentialId: string;
}): Promise<Selection> {
  const loaded = await loadMutableSelection(input);
  const now = input.clock.now();
  const changed = addSelectionItem(loaded.selection, {
    itemId: input.ids.next('selection-item'),
    productReference: input.productReference,
    variantReference: input.variantReference,
    quantityIntent: input.quantityIntent,
    note: input.note,
    now,
  });
  const item = changed.items.at(-1);
  return persistSelectionChange({
    repository: input.repository,
    ids: input.ids,
    current: loaded.selection,
    changed,
    grant: loaded.grant,
    expectedVersion: input.expectedVersion,
    actorCredentialId: input.actorCredentialId,
    action: 'ITEM_ADDED',
    eventName: 'SELECTION_ITEM_ADDED',
    payload: {
      itemId: item?.id ?? null,
      productReference: item?.productReference ?? null,
    },
    occurredAt: now,
  });
}

export async function setSelectionSizeCurveUseCase(input: {
  readonly repository: SelectionRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
  readonly expectedVersion: number;
  readonly itemId: string;
  readonly sizeCurve: readonly SizeCurveEntry[];
  readonly note?: string;
  readonly actorCredentialId: string;
}): Promise<Selection> {
  const loaded = await loadMutableSelection(input);
  const now = input.clock.now();
  const changed = setSelectionSizeCurve(loaded.selection, {
    itemId: selectionItemId(input.itemId),
    sizeCurve: input.sizeCurve,
    note: input.note,
    now,
  });
  const item = changed.items.find((candidate) => candidate.id === input.itemId);
  return persistSelectionChange({
    repository: input.repository,
    ids: input.ids,
    current: loaded.selection,
    changed,
    grant: loaded.grant,
    expectedVersion: input.expectedVersion,
    actorCredentialId: input.actorCredentialId,
    action: 'SIZE_CURVE_CHANGED',
    eventName: 'SELECTION_SIZE_CURVE_CHANGED',
    payload: { itemId: input.itemId, quantityIntent: item?.quantityIntent ?? 0 },
    occurredAt: now,
  });
}

export async function markSelectionReadyUseCase(input: {
  readonly repository: SelectionRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
}): Promise<Selection> {
  const loaded = await loadMutableSelection(input);
  const now = input.clock.now();
  const changed = markSelectionReady(loaded.selection, now);
  return persistSelectionChange({
    repository: input.repository,
    ids: input.ids,
    current: loaded.selection,
    changed,
    grant: loaded.grant,
    expectedVersion: input.expectedVersion,
    actorCredentialId: input.actorCredentialId,
    action: 'MARKED_READY',
    eventName: 'SELECTION_READY',
    occurredAt: now,
  });
}

export async function archiveSelectionUseCase(input: {
  readonly repository: SelectionRepository;
  readonly clock: SelectionClock;
  readonly ids: SelectionIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly selectionId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
}): Promise<Selection> {
  const loaded = await loadMutableSelection(input);
  const now = input.clock.now();
  const changed = archiveSelection(loaded.selection, now);
  return persistSelectionChange({
    repository: input.repository,
    ids: input.ids,
    current: loaded.selection,
    changed,
    grant: loaded.grant,
    expectedVersion: input.expectedVersion,
    actorCredentialId: input.actorCredentialId,
    action: 'ARCHIVED',
    eventName: 'SELECTION_ARCHIVED',
    occurredAt: now,
  });
}
