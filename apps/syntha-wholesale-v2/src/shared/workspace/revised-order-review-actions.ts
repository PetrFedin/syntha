'use server';

import { randomUUID } from 'node:crypto';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  RevisedOrderReviewAlreadyExists,
  RevisedOrderReviewDomainError,
  RevisedOrderReviewNotFound,
  RevisedOrderReviewSourceNotFound,
  RevisedOrderReviewVersionConflict,
  approveRevisedOrderUseCase,
  confirmApprovedRevisedOrderUseCase,
  getOrderAmendmentResponseRepository,
  getRevisedOrderReviewRepository,
  requestRevisedOrderAmendmentUseCase,
  type ProposedOrderLineChange,
} from '@/modules/orders';
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

function integer(formData: FormData, field: string, minimum: number): number {
  const value = Number(required(formData, field));
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new CommercialApiError(
      400,
      'invalid_field',
      `${field} must be an integer greater than or equal to ${minimum}`,
    );
  }
  return value;
}

function noticeFor(error: unknown): string {
  if (error instanceof LifecycleIdempotencyConflict) return 'revised_review_idempotency_conflict';
  if (error instanceof RevisedOrderReviewSourceNotFound) return 'revised_review_source_not_found';
  if (error instanceof RevisedOrderReviewNotFound) return 'revised_review_not_found';
  if (error instanceof RevisedOrderReviewAlreadyExists) return 'revised_review_exists';
  if (error instanceof RevisedOrderReviewVersionConflict) return 'revised_review_version_conflict';
  if (error instanceof RevisedOrderReviewDomainError || error instanceof CommercialApiError) {
    return 'invalid_revised_review_input';
  }
  return 'revised_review_service_unavailable';
}

function target(notice: string, reviewId?: string): Route {
  const query = new URLSearchParams({ notice });
  if (reviewId) query.set('revisedReviewId', reviewId);
  return `/confirmation?${query.toString()}` as Route;
}

async function repositories() {
  const [responseRepository, reviewRepository] = await Promise.all([
    getOrderAmendmentResponseRepository(),
    getRevisedOrderReviewRepository(),
  ]);
  return Object.freeze({ responseRepository, reviewRepository });
}

function refresh(): void {
  revalidatePath('/confirmation');
  revalidatePath('/orders');
}

export async function approveRevisedOrderAction(formData: FormData): Promise<never> {
  let notice = 'revised_order_approved';
  let reviewId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const result = await approveRevisedOrderUseCase({
      ...(await repositories()),
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      versionId: required(formData, 'versionId'),
      expectedVersion: integer(formData, 'expectedVersion', 0),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    reviewId = result.entity.id;
    notice = result.replayed ? 'revised_order_approve_replayed' : 'revised_order_approved';
    refresh();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, reviewId));
}

export async function requestRevisedOrderAmendmentAction(
  formData: FormData,
): Promise<never> {
  let notice = 'revised_order_amendment_requested';
  let reviewId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const change: ProposedOrderLineChange = Object.freeze({
      lineId: required(formData, 'lineId') as ProposedOrderLineChange['lineId'],
      sizeQuantities: Object.freeze([
        Object.freeze({
          size: required(formData, 'size'),
          quantity: integer(formData, 'quantity', 0),
        }),
      ]),
    });
    const result = await requestRevisedOrderAmendmentUseCase({
      ...(await repositories()),
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      versionId: required(formData, 'versionId'),
      expectedVersion: integer(formData, 'expectedVersion', 0),
      reason: required(formData, 'reason'),
      lineChanges: Object.freeze([change]),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    reviewId = result.entity.id;
    notice = result.replayed
      ? 'revised_order_amendment_replayed'
      : 'revised_order_amendment_requested';
    refresh();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, reviewId));
}

export async function confirmRevisedOrderAction(formData: FormData): Promise<never> {
  let notice = 'revised_order_confirmed';
  let reviewId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    reviewId = required(formData, 'reviewId');
    const result = await confirmApprovedRevisedOrderUseCase({
      ...(await repositories()),
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      reviewId,
      expectedVersion: integer(formData, 'expectedVersion', 1),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    notice = result.replayed ? 'revised_order_confirm_replayed' : 'revised_order_confirmed';
    refresh();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, reviewId));
}
