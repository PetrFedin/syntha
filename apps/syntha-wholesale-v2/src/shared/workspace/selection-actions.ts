'use server';

import { randomUUID } from 'node:crypto';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  SelectionAccessRevoked,
  SelectionAlreadyExists,
  SelectionDomainError,
  SelectionNotFound,
  SelectionVersionConflict,
  ShowroomAccessAlreadyExists,
  ShowroomAccessNotFound,
  ShowroomAccessVersionConflict,
  ShowroomNotPublishedForBuyerAccess,
  ShowroomUnavailableForBuyerAccess,
  addSelectionItemUseCase,
  archiveSelectionUseCase,
  createSelectionUseCase,
  getSelectionRepository,
  grantShowroomAccessUseCase,
  markSelectionReadyUseCase,
  revokeShowroomAccessUseCase,
  setSelectionBudgetUseCase,
  setSelectionSizeCurveUseCase,
  type SizeCurveEntry,
} from '@/modules/selection';
import { getShowroomRepository } from '@/modules/showroom';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

function required(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) {
    throw new CommercialApiError(400, 'invalid_field', `${field} is required`);
  }
  return value.trim();
}

function optional(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  if (value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new CommercialApiError(400, 'invalid_field', `${field} is invalid`);
  }
  return value.trim() || undefined;
}

function positiveInteger(formData: FormData, field: string): number {
  const value = Number(required(formData, field));
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be positive`);
  }
  return value;
}

function nonNegativeInteger(formData: FormData, field: string): number {
  const value = Number(required(formData, field));
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be non-negative`);
  }
  return value;
}

function optionalNonNegativeInteger(formData: FormData, field: string): number | undefined {
  const value = optional(formData, field);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be non-negative`);
  }
  return parsed;
}

function sizeCurve(formData: FormData): readonly SizeCurveEntry[] {
  const raw = required(formData, 'sizeCurve');
  return Object.freeze(
    raw.split(',').map((part) => {
      const [size, quantity, ...extra] = part.split(':').map((value) => value.trim());
      if (!size || !quantity || extra.length > 0) {
        throw new CommercialApiError(
          400,
          'invalid_field',
          'sizeCurve must use SIZE:QTY comma-separated format',
        );
      }
      const parsed = Number(quantity);
      if (!Number.isSafeInteger(parsed) || parsed < 0) {
        throw new CommercialApiError(400, 'invalid_field', `Invalid quantity for ${size}`);
      }
      return Object.freeze({ size, quantity: parsed });
    }),
  );
}

function noticeFor(error: unknown): string {
  if (error instanceof LifecycleIdempotencyConflict) return 'selection_idempotency_conflict';
  if (error instanceof ShowroomAccessAlreadyExists) return 'selection_access_exists';
  if (error instanceof ShowroomAccessNotFound) return 'selection_access_not_found';
  if (error instanceof ShowroomNotPublishedForBuyerAccess) return 'selection_showroom_not_published';
  if (error instanceof ShowroomUnavailableForBuyerAccess) return 'selection_showroom_unavailable';
  if (error instanceof ShowroomAccessVersionConflict) return 'selection_access_version_conflict';
  if (error instanceof SelectionAlreadyExists) return 'selection_exists';
  if (error instanceof SelectionNotFound) return 'selection_not_found';
  if (error instanceof SelectionVersionConflict) return 'selection_version_conflict';
  if (error instanceof SelectionAccessRevoked) return 'selection_access_revoked';
  if (error instanceof SelectionDomainError || error instanceof CommercialApiError) {
    return 'invalid_selection_input';
  }
  return 'selection_service_unavailable';
}

function target(notice: string, selectionId?: string): Route {
  const query = new URLSearchParams({ notice });
  if (selectionId) query.set('selectionId', selectionId);
  return `/selection?${query.toString()}` as Route;
}

export async function grantShowroomAccessAction(formData: FormData): Promise<never> {
  let notice = 'selection_access_granted';
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, showroomRepository] = await Promise.all([
      getSelectionRepository(),
      getShowroomRepository(),
    ]);
    const result = await grantShowroomAccessUseCase({
      repository,
      showroomRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      buyerOrganisationId: organisationId(required(formData, 'buyerOrganisationId')),
      showroomId: required(formData, 'showroomId'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    notice = result.replayed ? 'selection_access_replayed' : 'selection_access_granted';
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice));
}

export async function revokeShowroomAccessAction(formData: FormData): Promise<never> {
  let notice = 'selection_access_revoked';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSelectionRepository();
    await revokeShowroomAccessUseCase({
      repository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      grantId: required(formData, 'grantId'),
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice));
}

export async function createSelectionAction(formData: FormData): Promise<never> {
  let notice = 'selection_created';
  let selectionId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSelectionRepository();
    const result = await createSelectionUseCase({
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      grantId: required(formData, 'grantId'),
      title: required(formData, 'title'),
      currency: required(formData, 'currency'),
      budgetMinor: optionalNonNegativeInteger(formData, 'budgetMinor'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    selectionId = result.entity.id;
    notice = result.replayed ? 'selection_replayed' : 'selection_created';
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, selectionId));
}

export async function setSelectionBudgetAction(formData: FormData): Promise<never> {
  const selectionId = required(formData, 'selectionId');
  let notice = 'selection_budget_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSelectionRepository();
    await setSelectionBudgetUseCase({
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      budgetMinor: nonNegativeInteger(formData, 'budgetMinor'),
      currency: optional(formData, 'currency'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, selectionId));
}

export async function addSelectionItemAction(formData: FormData): Promise<never> {
  const selectionId = required(formData, 'selectionId');
  let notice = 'selection_item_added';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSelectionRepository();
    await addSelectionItemUseCase({
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      productReference: required(formData, 'productReference'),
      variantReference: optional(formData, 'variantReference'),
      quantityIntent: optionalNonNegativeInteger(formData, 'quantityIntent'),
      note: optional(formData, 'note'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, selectionId));
}

export async function setSelectionSizeCurveAction(formData: FormData): Promise<never> {
  const selectionId = required(formData, 'selectionId');
  let notice = 'selection_size_curve_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSelectionRepository();
    await setSelectionSizeCurveUseCase({
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      itemId: required(formData, 'itemId'),
      sizeCurve: sizeCurve(formData),
      note: optional(formData, 'note'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, selectionId));
}

export async function markSelectionReadyAction(formData: FormData): Promise<never> {
  const selectionId = required(formData, 'selectionId');
  let notice = 'selection_ready';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSelectionRepository();
    await markSelectionReadyUseCase({
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, selectionId));
}

export async function archiveSelectionAction(formData: FormData): Promise<never> {
  const selectionId = required(formData, 'selectionId');
  let notice = 'selection_archived';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSelectionRepository();
    await archiveSelectionUseCase({
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/selection');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, selectionId));
}
