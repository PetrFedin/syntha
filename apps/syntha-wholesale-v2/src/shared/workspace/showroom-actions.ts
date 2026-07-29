'use server';

import { randomUUID } from 'node:crypto';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getCollectionRepository } from '@/modules/collections';
import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  CollectionDoesNotAcceptShowrooms,
  CollectionNotReadyForShowroomPublication,
  ShowroomAlreadyExists,
  ShowroomDomainError,
  ShowroomNotFound,
  ShowroomVersionConflict,
  archiveShowroomUseCase,
  createShowroomUseCase,
  getShowroomRepository,
  publishShowroomUseCase,
  updateShowroomUseCase,
} from '@/modules/showroom';
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
  return value.trim();
}

function date(formData: FormData, field: string): Date {
  const value = new Date(required(formData, field));
  if (Number.isNaN(value.getTime())) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be a date`);
  }
  return value;
}

function optionalDate(formData: FormData, field: string): Date | undefined {
  const value = optional(formData, field);
  if (value === undefined) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be a date`);
  }
  return parsed;
}

function positiveInteger(formData: FormData, field: string): number {
  const value = Number(required(formData, field));
  if (!Number.isInteger(value) || value < 1) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be positive`);
  }
  return value;
}

function noticeFor(error: unknown): string {
  if (error instanceof LifecycleIdempotencyConflict) return 'showroom_idempotency_conflict';
  if (error instanceof ShowroomAlreadyExists) return 'showroom_already_exists';
  if (error instanceof ShowroomNotFound) return 'showroom_not_found';
  if (error instanceof CollectionDoesNotAcceptShowrooms) return 'collection_closed_for_showroom';
  if (error instanceof CollectionNotReadyForShowroomPublication) return 'collection_not_published';
  if (error instanceof ShowroomVersionConflict) return 'showroom_version_conflict';
  if (error instanceof ShowroomDomainError || error instanceof CommercialApiError) {
    return 'invalid_showroom_input';
  }
  return 'showroom_service_unavailable';
}

function target(input: {
  readonly notice: string;
  readonly collectionId?: string;
  readonly showroomId?: string;
}): Route {
  const query = new URLSearchParams({ notice: input.notice });
  if (input.collectionId) query.set('collectionId', input.collectionId);
  if (input.showroomId) query.set('showroomId', input.showroomId);
  return `/showroom?${query.toString()}` as Route;
}

export async function createShowroomAction(formData: FormData): Promise<never> {
  const collectionId = required(formData, 'collectionId');
  let notice = 'showroom_created';
  let showroomId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, collectionRepository] = await Promise.all([
      getShowroomRepository(),
      getCollectionRepository(),
    ]);
    const result = await createShowroomUseCase({
      repository,
      collectionRepository,
      clock,
      ids,
      organisationId: access.organisationId,
      collectionId,
      code: required(formData, 'code'),
      title: required(formData, 'title'),
      description: optional(formData, 'description'),
      opensAt: date(formData, 'opensAt'),
      closesAt: date(formData, 'closesAt'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    showroomId = result.entity.id;
    notice = result.replayed ? 'showroom_replayed' : 'showroom_created';
    revalidatePath('/showroom');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target({ notice, collectionId, showroomId }));
}

export async function updateShowroomAction(formData: FormData): Promise<never> {
  const collectionId = required(formData, 'collectionId');
  const showroomId = required(formData, 'showroomId');
  let notice = 'showroom_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getShowroomRepository();
    await updateShowroomUseCase({
      repository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: showroomId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      title: optional(formData, 'title'),
      description: optional(formData, 'description'),
      opensAt: optionalDate(formData, 'opensAt'),
      closesAt: optionalDate(formData, 'closesAt'),
    });
    revalidatePath('/showroom');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target({ notice, collectionId, showroomId }));
}

export async function publishShowroomAction(formData: FormData): Promise<never> {
  const collectionId = required(formData, 'collectionId');
  const showroomId = required(formData, 'showroomId');
  let notice = 'showroom_published';
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, collectionRepository] = await Promise.all([
      getShowroomRepository(),
      getCollectionRepository(),
    ]);
    const result = await publishShowroomUseCase({
      repository,
      collectionRepository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: showroomId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    notice = result.replayed ? 'showroom_publication_replayed' : 'showroom_published';
    revalidatePath('/showroom');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target({ notice, collectionId, showroomId }));
}

export async function archiveShowroomAction(formData: FormData): Promise<never> {
  const collectionId = required(formData, 'collectionId');
  const showroomId = required(formData, 'showroomId');
  let notice = 'showroom_archived';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getShowroomRepository();
    await archiveShowroomUseCase({
      repository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: showroomId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/showroom');
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target({ notice, collectionId, showroomId }));
}
