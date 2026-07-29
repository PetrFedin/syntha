import { NextResponse } from 'next/server';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
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
  type SizeCurveEntry,
} from '@/modules/selection';
import { CommercialApiError } from '@/shared/server/commercial-api';

function postgresCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

export function selectionApiFailure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (
    error instanceof ShowroomAccessNotFound ||
    error instanceof SelectionNotFound ||
    error instanceof ShowroomUnavailableForBuyerAccess
  ) {
    return NextResponse.json({ error: 'selection_resource_not_found' }, { status: 404 });
  }
  if (error instanceof ShowroomNotPublishedForBuyerAccess) {
    return NextResponse.json({ error: 'showroom_not_published' }, { status: 409 });
  }
  if (error instanceof SelectionAccessRevoked) {
    return NextResponse.json({ error: 'showroom_access_revoked' }, { status: 409 });
  }
  if (
    error instanceof ShowroomAccessAlreadyExists ||
    error instanceof SelectionAlreadyExists ||
    error instanceof SelectionVersionConflict ||
    error instanceof ShowroomAccessVersionConflict ||
    error instanceof LifecycleIdempotencyConflict ||
    postgresCode(error) === '23505'
  ) {
    return NextResponse.json(
      { error: 'selection_conflict', message: error instanceof Error ? error.message : undefined },
      { status: 409 },
    );
  }
  if (error instanceof SelectionDomainError) {
    return NextResponse.json(
      { error: 'invalid_selection', message: error.message },
      { status: 400 },
    );
  }
  if (postgresCode(error) === '23503') {
    return NextResponse.json({ error: 'selection_reference_unavailable' }, { status: 409 });
  }
  return NextResponse.json({ error: 'selection_service_unavailable' }, { status: 503 });
}

export function requiredNonNegativeInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new CommercialApiError(
      400,
      'invalid_field',
      `${field} must be a non-negative safe integer`,
    );
  }
  return Number(value);
}

export function optionalNonNegativeInteger(
  value: unknown,
  field: string,
): number | undefined {
  if (value === undefined) return undefined;
  return requiredNonNegativeInteger(value, field);
}

export function requiredSizeCurve(value: unknown): readonly SizeCurveEntry[] {
  if (!Array.isArray(value)) {
    throw new CommercialApiError(400, 'invalid_field', 'sizeCurve must be an array');
  }
  return Object.freeze(
    value.map((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new CommercialApiError(
          400,
          'invalid_field',
          `sizeCurve[${index}] must be an object`,
        );
      }
      const record = entry as Record<string, unknown>;
      if (typeof record.size !== 'string' || !record.size.trim()) {
        throw new CommercialApiError(
          400,
          'invalid_field',
          `sizeCurve[${index}].size is required`,
        );
      }
      return Object.freeze({
        size: record.size.trim(),
        quantity: requiredNonNegativeInteger(
          record.quantity,
          `sizeCurve[${index}].quantity`,
        ),
      });
    }),
  );
}
