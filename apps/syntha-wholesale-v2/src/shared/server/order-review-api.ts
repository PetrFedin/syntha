import { NextResponse } from 'next/server';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  ConfirmedOrderVersionNotFound,
  OrderReviewAlreadyExists,
  OrderReviewDomainError,
  OrderReviewNotFound,
  OrderReviewPersistenceVersionConflict,
  OrderReviewSourceNotFound,
  OrderReviewVersionConflict,
  type ProposedOrderLineChange,
} from '@/modules/orders';
import { CommercialApiError } from '@/shared/server/commercial-api';
import {
  requiredBasisPoints,
  requiredNonNegativeSafeInteger,
} from '@/shared/server/order-api';

function postgresCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

export function orderReviewApiFailure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (
    error instanceof OrderReviewNotFound ||
    error instanceof OrderReviewSourceNotFound ||
    error instanceof ConfirmedOrderVersionNotFound
  ) {
    return NextResponse.json({ error: 'order_review_resource_not_found' }, { status: 404 });
  }
  if (
    error instanceof OrderReviewAlreadyExists ||
    error instanceof OrderReviewVersionConflict ||
    error instanceof OrderReviewPersistenceVersionConflict ||
    error instanceof LifecycleIdempotencyConflict ||
    postgresCode(error) === '23505'
  ) {
    return NextResponse.json(
      {
        error: 'order_review_conflict',
        message: error instanceof Error ? error.message : undefined,
      },
      { status: 409 },
    );
  }
  if (error instanceof OrderReviewDomainError) {
    return NextResponse.json(
      { error: 'invalid_order_review', message: error.message },
      { status: 400 },
    );
  }
  if (postgresCode(error) === '23503') {
    return NextResponse.json({ error: 'order_review_reference_unavailable' }, { status: 409 });
  }
  return NextResponse.json({ error: 'order_review_service_unavailable' }, { status: 503 });
}

export function requiredReviewPerspective(value: string | null): 'buyer' | 'seller' {
  if (value === 'buyer' || value === 'seller') return value;
  throw new CommercialApiError(
    400,
    'invalid_perspective',
    'perspective must be buyer or seller',
  );
}

function optionalNonNegativeInteger(value: unknown, field: string): number | undefined {
  return value === undefined
    ? undefined
    : requiredNonNegativeSafeInteger(value, field);
}

function optionalBasisPoints(value: unknown, field: string): number | undefined {
  return value === undefined ? undefined : requiredBasisPoints(value, field);
}

function requiredSizeQuantities(
  value: unknown,
  field: string,
): readonly { readonly size: string; readonly quantity: number }[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be a non-empty array`);
  }
  return Object.freeze(
    value.map((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new CommercialApiError(
          400,
          'invalid_field',
          `${field}[${index}] must be an object`,
        );
      }
      const source = entry as Record<string, unknown>;
      if (typeof source.size !== 'string' || !source.size.trim()) {
        throw new CommercialApiError(
          400,
          'invalid_field',
          `${field}[${index}].size is required`,
        );
      }
      return Object.freeze({
        size: source.size.trim(),
        quantity: requiredNonNegativeSafeInteger(
          source.quantity,
          `${field}[${index}].quantity`,
        ),
      });
    }),
  );
}

export function requiredProposedOrderLineChanges(
  value: unknown,
): readonly ProposedOrderLineChange[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CommercialApiError(
      400,
      'invalid_field',
      'lineChanges must be a non-empty array',
    );
  }
  return Object.freeze(
    value.map((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new CommercialApiError(
          400,
          'invalid_field',
          `lineChanges[${index}] must be an object`,
        );
      }
      const source = entry as Record<string, unknown>;
      if (typeof source.lineId !== 'string' || !source.lineId.trim()) {
        throw new CommercialApiError(
          400,
          'invalid_field',
          `lineChanges[${index}].lineId is required`,
        );
      }
      const sizeQuantities = source.sizeQuantities === undefined
        ? undefined
        : requiredSizeQuantities(
            source.sizeQuantities,
            `lineChanges[${index}].sizeQuantities`,
          );
      const note = source.note === undefined
        ? undefined
        : typeof source.note === 'string' && source.note.trim()
          ? source.note.trim()
          : (() => {
              throw new CommercialApiError(
                400,
                'invalid_field',
                `lineChanges[${index}].note must be non-empty`,
              );
            })();
      return Object.freeze({
        lineId: source.lineId.trim() as ProposedOrderLineChange['lineId'],
        ...(sizeQuantities ? { sizeQuantities } : {}),
        ...(source.unitPriceMinor !== undefined
          ? {
              unitPriceMinor: optionalNonNegativeInteger(
                source.unitPriceMinor,
                `lineChanges[${index}].unitPriceMinor`,
              ),
            }
          : {}),
        ...(source.discountBasisPoints !== undefined
          ? {
              discountBasisPoints: optionalBasisPoints(
                source.discountBasisPoints,
                `lineChanges[${index}].discountBasisPoints`,
              ),
            }
          : {}),
        ...(source.taxBasisPoints !== undefined
          ? {
              taxBasisPoints: optionalBasisPoints(
                source.taxBasisPoints,
                `lineChanges[${index}].taxBasisPoints`,
              ),
            }
          : {}),
        ...(note ? { note } : {}),
      });
    }),
  );
}
