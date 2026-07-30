'use server';

import { randomUUID } from 'node:crypto';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  OrderReviewAlreadyExists,
  OrderReviewDomainError,
  OrderReviewNotFound,
  OrderReviewPersistenceVersionConflict,
  OrderReviewSourceNotFound,
  OrderReviewVersionConflict,
  approveSubmittedOrderUseCase,
  confirmApprovedOrderUseCase,
  getOrderRepository,
  getOrderReviewRepository,
  requestOrderAmendmentUseCase,
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

function nonNegativeInteger(formData: FormData, field: string): number {
  const value = Number(required(formData, field));
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be non-negative`);
  }
  return value;
}

function optionalNonNegativeInteger(
  formData: FormData,
  field: string,
): number | undefined {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be non-negative`);
  }
  return parsed;
}

function optionalBasisPoints(formData: FormData, field: string): number | undefined {
  const value = optionalNonNegativeInteger(formData, field);
  if (value === undefined) return undefined;
  if (value > 10_000) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must not exceed 10000`);
  }
  return value;
}

function noticeFor(error: unknown): string {
  if (error instanceof LifecycleIdempotencyConflict) return 'review_idempotency_conflict';
  if (error instanceof OrderReviewSourceNotFound) return 'review_source_not_found';
  if (error instanceof OrderReviewNotFound) return 'review_not_found';
  if (error instanceof OrderReviewAlreadyExists) return 'review_exists';
  if (
    error instanceof OrderReviewVersionConflict ||
    error instanceof OrderReviewPersistenceVersionConflict
  ) {
    return 'review_version_conflict';
  }
  if (error instanceof OrderReviewDomainError || error instanceof CommercialApiError) {
    return 'invalid_review_input';
  }
  return 'review_service_unavailable';
}

function target(notice: string, reviewId?: string): Route {
  const query = new URLSearchParams({ notice });
  if (reviewId) query.set('reviewId', reviewId);
  return `/confirmation?${query.toString()}` as Route;
}

function revalidateConfirmation(): void {
  revalidatePath('/confirmation');
  revalidatePath('/orders');
}

export async function approveSubmittedOrderAction(formData: FormData): Promise<never> {
  let notice = 'order_approved';
  let reviewId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const [orderRepository, reviewRepository] = await Promise.all([
      getOrderRepository(),
      getOrderReviewRepository(),
    ]);
    const result = await approveSubmittedOrderUseCase({
      orderRepository,
      reviewRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      snapshotId: required(formData, 'snapshotId'),
      expectedVersion: nonNegativeInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    reviewId = result.entity.id;
    notice = result.replayed ? 'order_approval_replayed' : 'order_approved';
    revalidateConfirmation();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, reviewId));
}

export async function requestOrderAmendmentAction(formData: FormData): Promise<never> {
  let notice = 'order_amendment_requested';
  let reviewId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const [orderRepository, reviewRepository] = await Promise.all([
      getOrderRepository(),
      getOrderReviewRepository(),
    ]);
    const size = required(formData, 'size');
    const change: ProposedOrderLineChange = Object.freeze({
      lineId: required(formData, 'lineId') as ProposedOrderLineChange['lineId'],
      sizeQuantities: Object.freeze([
        Object.freeze({
          size,
          quantity: nonNegativeInteger(formData, 'quantity'),
        }),
      ]),
      ...(optionalNonNegativeInteger(formData, 'unitPriceMinor') !== undefined
        ? { unitPriceMinor: optionalNonNegativeInteger(formData, 'unitPriceMinor') }
        : {}),
      ...(optionalBasisPoints(formData, 'discountBasisPoints') !== undefined
        ? { discountBasisPoints: optionalBasisPoints(formData, 'discountBasisPoints') }
        : {}),
      ...(optionalBasisPoints(formData, 'taxBasisPoints') !== undefined
        ? { taxBasisPoints: optionalBasisPoints(formData, 'taxBasisPoints') }
        : {}),
    });
    const result = await requestOrderAmendmentUseCase({
      orderRepository,
      reviewRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      snapshotId: required(formData, 'snapshotId'),
      expectedVersion: nonNegativeInteger(formData, 'expectedVersion'),
      reason: required(formData, 'reason'),
      lineChanges: Object.freeze([change]),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    reviewId = result.entity.id;
    notice = result.replayed
      ? 'order_amendment_replayed'
      : 'order_amendment_requested';
    revalidateConfirmation();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, reviewId));
}

export async function confirmApprovedOrderAction(formData: FormData): Promise<never> {
  let notice = 'order_confirmed';
  let reviewId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    reviewId = required(formData, 'reviewId');
    const [orderRepository, reviewRepository] = await Promise.all([
      getOrderRepository(),
      getOrderReviewRepository(),
    ]);
    const result = await confirmApprovedOrderUseCase({
      orderRepository,
      reviewRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      reviewId,
      expectedVersion: nonNegativeInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    notice = result.replayed ? 'order_confirmation_replayed' : 'order_confirmed';
    revalidateConfirmation();
  } catch (error) {
    notice = noticeFor(error);
  }
  redirect(target(notice, reviewId));
}
