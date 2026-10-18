import { NextResponse } from 'next/server';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  OrderAlreadyExists,
  OrderDomainError,
  OrderNotFound,
  OrderSelectionAccessRevoked,
  OrderSelectionNotReady,
  OrderVersionConflict,
  SubmittedOrderSnapshotNotFound,
} from '@/modules/orders';
import { SelectionNotFound } from '@/modules/selection';
import { CommercialApiError } from '@/shared/server/commercial-api';

function postgresCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

export function orderApiFailure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (
    error instanceof OrderNotFound ||
    error instanceof SelectionNotFound ||
    error instanceof SubmittedOrderSnapshotNotFound
  ) {
    return NextResponse.json({ error: 'order_resource_not_found' }, { status: 404 });
  }
  if (error instanceof OrderSelectionNotReady) {
    return NextResponse.json({ error: 'selection_not_ready' }, { status: 409 });
  }
  if (error instanceof OrderSelectionAccessRevoked) {
    return NextResponse.json({ error: 'order_access_revoked' }, { status: 409 });
  }
  if (
    error instanceof OrderAlreadyExists ||
    error instanceof OrderVersionConflict ||
    error instanceof LifecycleIdempotencyConflict ||
    postgresCode(error) === '23505'
  ) {
    return NextResponse.json(
      { error: 'order_conflict', message: error instanceof Error ? error.message : undefined },
      { status: 409 },
    );
  }
  if (error instanceof OrderDomainError) {
    return NextResponse.json(
      { error: 'invalid_order', message: error.message },
      { status: 400 },
    );
  }
  if (postgresCode(error) === '23503') {
    return NextResponse.json({ error: 'order_reference_unavailable' }, { status: 409 });
  }
  return NextResponse.json({ error: 'order_service_unavailable' }, { status: 503 });
}

export function requiredNonNegativeSafeInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new CommercialApiError(
      400,
      'invalid_field',
      `${field} must be a non-negative safe integer`,
    );
  }
  return Number(value);
}

export function requiredBasisPoints(value: unknown, field: string): number {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 10_000) {
    throw new CommercialApiError(
      400,
      'invalid_field',
      `${field} must be an integer from 0 through 10000`,
    );
  }
  return Number(value);
}

export function requiredPerspective(value: string | null): 'buyer' | 'seller' {
  if (value === 'buyer' || value === 'seller') return value;
  throw new CommercialApiError(
    400,
    'invalid_perspective',
    'perspective must be buyer or seller',
  );
}
