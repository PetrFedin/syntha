import type { OrganisationId } from '@/modules/organisations';
import type { ShowroomId, ShowroomSnapshotId } from '@/modules/showroom';

export type ShowroomAccessGrantId = string & { readonly __brand: 'ShowroomAccessGrantId' };
export type SelectionId = string & { readonly __brand: 'SelectionId' };
export type SelectionItemId = string & { readonly __brand: 'SelectionItemId' };
export type ShowroomAccessStatus = 'ACTIVE' | 'REVOKED';
export type SelectionStatus = 'DRAFT' | 'READY' | 'ARCHIVED';

export interface SizeCurveEntry {
  readonly size: string;
  readonly quantity: number;
}

export interface ShowroomAccessGrant {
  readonly id: ShowroomAccessGrantId;
  readonly sellerOrganisationId: OrganisationId;
  readonly buyerOrganisationId: OrganisationId;
  readonly showroomId: ShowroomId;
  readonly showroomSnapshotId: ShowroomSnapshotId;
  readonly status: ShowroomAccessStatus;
  readonly grantedByCredentialId: string;
  readonly grantedAt: string;
  readonly revokedByCredentialId?: string;
  readonly revokedAt?: string;
  readonly version: number;
}

export interface SelectionItem {
  readonly id: SelectionItemId;
  readonly productReference: string;
  readonly variantReference?: string;
  readonly quantityIntent: number;
  readonly sizeCurve: readonly SizeCurveEntry[];
  readonly note: string;
  readonly position: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Selection {
  readonly id: SelectionId;
  readonly sellerOrganisationId: OrganisationId;
  readonly buyerOrganisationId: OrganisationId;
  readonly showroomAccessGrantId: ShowroomAccessGrantId;
  readonly showroomId: ShowroomId;
  readonly showroomSnapshotId: ShowroomSnapshotId;
  readonly title: string;
  readonly currency: string;
  readonly budgetMinor: number;
  readonly status: SelectionStatus;
  readonly items: readonly SelectionItem[];
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export class SelectionDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SelectionDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new SelectionDomainError(`${label} must not be empty`);
  return normalized;
}

function optionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function nonNegativeInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new SelectionDomainError(`${label} must be a non-negative safe integer`);
  }
  return value;
}

function currencyCode(value: string): string {
  const normalized = requiredText(value, 'Selection currency').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new SelectionDomainError('Selection currency must be a three-letter ISO code');
  }
  return normalized;
}

function normalizeSizeCurve(entries: readonly SizeCurveEntry[]): readonly SizeCurveEntry[] {
  const seen = new Set<string>();
  const normalized = entries.map((entry) => {
    const size = requiredText(entry.size, 'Size label').toUpperCase();
    if (seen.has(size)) throw new SelectionDomainError(`Duplicate size label: ${size}`);
    seen.add(size);
    return Object.freeze({
      size,
      quantity: nonNegativeInteger(entry.quantity, `Quantity for size ${size}`),
    });
  });
  return Object.freeze(normalized);
}

export function showroomAccessGrantId(value: string): ShowroomAccessGrantId {
  return requiredText(value, 'Showroom access grant id') as ShowroomAccessGrantId;
}

export function selectionId(value: string): SelectionId {
  return requiredText(value, 'Selection id') as SelectionId;
}

export function selectionItemId(value: string): SelectionItemId {
  return requiredText(value, 'Selection item id') as SelectionItemId;
}

export function grantShowroomAccess(input: {
  readonly id: string;
  readonly sellerOrganisationId: OrganisationId;
  readonly buyerOrganisationId: OrganisationId;
  readonly showroomId: ShowroomId;
  readonly showroomSnapshotId: ShowroomSnapshotId;
  readonly actorCredentialId: string;
  readonly now: Date;
}): ShowroomAccessGrant {
  if (input.sellerOrganisationId === input.buyerOrganisationId) {
    throw new SelectionDomainError('Buyer organisation must differ from seller organisation');
  }
  return Object.freeze({
    id: showroomAccessGrantId(input.id),
    sellerOrganisationId: input.sellerOrganisationId,
    buyerOrganisationId: input.buyerOrganisationId,
    showroomId: input.showroomId,
    showroomSnapshotId: input.showroomSnapshotId,
    status: 'ACTIVE' as const,
    grantedByCredentialId: requiredText(input.actorCredentialId, 'Grant credential id'),
    grantedAt: input.now.toISOString(),
    version: 1,
  });
}

export function revokeShowroomAccess(
  grant: ShowroomAccessGrant,
  input: { readonly actorCredentialId: string; readonly now: Date },
): ShowroomAccessGrant {
  if (grant.status !== 'ACTIVE') {
    throw new SelectionDomainError('Showroom access is already revoked');
  }
  return Object.freeze({
    ...grant,
    status: 'REVOKED' as const,
    revokedByCredentialId: requiredText(input.actorCredentialId, 'Revocation credential id'),
    revokedAt: input.now.toISOString(),
    version: grant.version + 1,
  });
}

export function createSelection(input: {
  readonly id: string;
  readonly grant: ShowroomAccessGrant;
  readonly buyerOrganisationId: OrganisationId;
  readonly title: string;
  readonly currency: string;
  readonly budgetMinor?: number;
  readonly ownerCredentialId: string;
  readonly now: Date;
}): Selection {
  if (input.grant.status !== 'ACTIVE') {
    throw new SelectionDomainError('Selection requires active Showroom access');
  }
  if (input.grant.buyerOrganisationId !== input.buyerOrganisationId) {
    throw new SelectionDomainError('Selection buyer organisation does not match access grant');
  }
  const timestamp = input.now.toISOString();
  return Object.freeze({
    id: selectionId(input.id),
    sellerOrganisationId: input.grant.sellerOrganisationId,
    buyerOrganisationId: input.buyerOrganisationId,
    showroomAccessGrantId: input.grant.id,
    showroomId: input.grant.showroomId,
    showroomSnapshotId: input.grant.showroomSnapshotId,
    title: requiredText(input.title, 'Selection title'),
    currency: currencyCode(input.currency),
    budgetMinor: nonNegativeInteger(input.budgetMinor ?? 0, 'Selection budget'),
    status: 'DRAFT' as const,
    items: Object.freeze([]),
    ownerCredentialId: requiredText(input.ownerCredentialId, 'Selection owner credential id'),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

function assertDraft(selection: Selection): void {
  if (selection.status !== 'DRAFT') {
    throw new SelectionDomainError('Only a draft Selection can be changed');
  }
}

export function setSelectionBudget(
  selection: Selection,
  input: { readonly budgetMinor: number; readonly currency?: string; readonly now: Date },
): Selection {
  assertDraft(selection);
  return Object.freeze({
    ...selection,
    budgetMinor: nonNegativeInteger(input.budgetMinor, 'Selection budget'),
    currency: input.currency === undefined ? selection.currency : currencyCode(input.currency),
    updatedAt: input.now.toISOString(),
    version: selection.version + 1,
  });
}

export function addSelectionItem(
  selection: Selection,
  input: {
    readonly itemId: string;
    readonly productReference: string;
    readonly variantReference?: string;
    readonly quantityIntent?: number;
    readonly note?: string;
    readonly now: Date;
  },
): Selection {
  assertDraft(selection);
  const productReference = requiredText(input.productReference, 'Product reference');
  const variantReference = optionalText(input.variantReference);
  const duplicate = selection.items.some(
    (item) =>
      item.productReference === productReference &&
      (item.variantReference ?? '') === (variantReference ?? ''),
  );
  if (duplicate) throw new SelectionDomainError('Selection item already exists');
  const timestamp = input.now.toISOString();
  const item: SelectionItem = Object.freeze({
    id: selectionItemId(input.itemId),
    productReference,
    variantReference,
    quantityIntent: nonNegativeInteger(input.quantityIntent ?? 0, 'Quantity intent'),
    sizeCurve: Object.freeze([]),
    note: (input.note ?? '').trim(),
    position: selection.items.length + 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return Object.freeze({
    ...selection,
    items: Object.freeze([...selection.items, item]),
    updatedAt: timestamp,
    version: selection.version + 1,
  });
}

export function setSelectionSizeCurve(
  selection: Selection,
  input: {
    readonly itemId: SelectionItemId;
    readonly sizeCurve: readonly SizeCurveEntry[];
    readonly note?: string;
    readonly now: Date;
  },
): Selection {
  assertDraft(selection);
  const index = selection.items.findIndex((item) => item.id === input.itemId);
  if (index < 0) throw new SelectionDomainError('Selection item not found');
  const sizeCurve = normalizeSizeCurve(input.sizeCurve);
  const quantityIntent = sizeCurve.reduce((sum, entry) => sum + entry.quantity, 0);
  nonNegativeInteger(quantityIntent, 'Size-curve total quantity');
  const current = selection.items[index];
  const updated: SelectionItem = Object.freeze({
    ...current,
    sizeCurve,
    quantityIntent,
    note: input.note === undefined ? current.note : input.note.trim(),
    updatedAt: input.now.toISOString(),
  });
  const items = [...selection.items];
  items[index] = updated;
  return Object.freeze({
    ...selection,
    items: Object.freeze(items),
    updatedAt: input.now.toISOString(),
    version: selection.version + 1,
  });
}

export function markSelectionReady(selection: Selection, now: Date): Selection {
  assertDraft(selection);
  if (selection.items.length === 0) {
    throw new SelectionDomainError('Selection must contain at least one item');
  }
  return Object.freeze({
    ...selection,
    status: 'READY' as const,
    updatedAt: now.toISOString(),
    version: selection.version + 1,
  });
}

export function archiveSelection(selection: Selection, now: Date): Selection {
  if (selection.status === 'ARCHIVED') {
    throw new SelectionDomainError('Selection is already archived');
  }
  return Object.freeze({
    ...selection,
    status: 'ARCHIVED' as const,
    updatedAt: now.toISOString(),
    version: selection.version + 1,
  });
}
