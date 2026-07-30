import { describe, expect, it } from 'vitest';

import { organisationId } from '@/modules/organisations';
import {
  createSelection,
  grantShowroomAccess,
  markSelectionReady,
  selectionItemId,
  type Selection,
} from '@/modules/selection';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import {
  OrderDomainError,
  calculateOrderLine,
  createOrderDraft,
  orderLineId,
  setOrderLineCommercialTerms,
  setOrderLineQuantity,
  submitOrder,
} from '../domain/order';

const now = new Date('2026-07-29T21:00:00.000Z');

function readySelection(): Selection {
  const grant = grantShowroomAccess({
    id: 'grant-1',
    sellerOrganisationId: organisationId('brand-1'),
    buyerOrganisationId: organisationId('shop-1'),
    showroomId: showroomId('showroom-1'),
    showroomSnapshotId: showroomSnapshotId('showroom-snapshot-1'),
    actorCredentialId: 'brand-admin',
    now,
  });
  const selection = createSelection({
    id: 'selection-1',
    grant,
    buyerOrganisationId: organisationId('shop-1'),
    title: 'Main Buy',
    currency: 'EUR',
    ownerCredentialId: 'buyer-1',
    now,
  });
  return markSelectionReady(
    {
      ...selection,
      items: Object.freeze([
        Object.freeze({
          id: selectionItemId('selection-item-1'),
          productReference: 'SKU-001',
          variantReference: 'BLACK',
          quantityIntent: 6,
          sizeCurve: Object.freeze([
            Object.freeze({ size: 'XS', quantity: 1 }),
            Object.freeze({ size: 'S', quantity: 2 }),
            Object.freeze({ size: 'M', quantity: 3 }),
          ]),
          note: 'Window story',
          position: 1,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        }),
      ]),
    },
    now,
  );
}

describe('Order Builder domain', () => {
  it('uses deterministic half-up basis-point calculations', () => {
    expect(
      calculateOrderLine({
        quantity: 3,
        unitPriceMinor: 333,
        discountBasisPoints: 500,
        taxBasisPoints: 2_000,
      }),
    ).toEqual({
      grossMinor: 999,
      discountMinor: 50,
      netMinor: 949,
      taxMinor: 190,
      totalMinor: 1_139,
    });
  });

  it('seeds immutable product and size identity from a READY Selection', () => {
    const order = createOrderDraft({
      id: 'order-1',
      selection: readySelection(),
      lineIds: ['order-line-1'],
      ownerCredentialId: 'buyer-1',
      now,
    });

    expect(order.status).toBe('DRAFT');
    expect(order.lines[0]).toMatchObject({
      productReference: 'SKU-001',
      variantReference: 'BLACK',
      totalQuantity: 6,
      unitPriceMinor: 0,
    });
    expect(order.lines[0]?.sizeQuantities).toEqual([
      { size: 'XS', quantity: 1 },
      { size: 'S', quantity: 2 },
      { size: 'M', quantity: 3 },
    ]);
  });

  it('updates only Selection-origin sizes and recalculates totals', () => {
    const draft = createOrderDraft({
      id: 'order-2',
      selection: readySelection(),
      lineIds: ['order-line-2'],
      ownerCredentialId: 'buyer-1',
      now,
    });
    const priced = setOrderLineCommercialTerms(draft, {
      lineId: orderLineId('order-line-2'),
      unitPriceMinor: 10_000,
      discountBasisPoints: 1_000,
      taxBasisPoints: 2_000,
      now,
    });
    const resized = setOrderLineQuantity(priced, {
      lineId: orderLineId('order-line-2'),
      size: 'M',
      quantity: 4,
      now,
    });

    expect(resized.version).toBe(3);
    expect(resized.totals).toEqual({
      quantity: 7,
      grossMinor: 70_000,
      discountMinor: 7_000,
      netMinor: 63_000,
      taxMinor: 12_600,
      totalMinor: 75_600,
    });
    expect(() =>
      setOrderLineQuantity(resized, {
        lineId: orderLineId('order-line-2'),
        size: 'XL',
        quantity: 1,
        now,
      }),
    ).toThrow('must originate from the Selection');
  });

  it('submits one immutable positive-quantity priced snapshot', () => {
    const draft = createOrderDraft({
      id: 'order-3',
      selection: readySelection(),
      lineIds: ['order-line-3'],
      ownerCredentialId: 'buyer-1',
      now,
    });
    expect(() =>
      submitOrder(draft, {
        snapshotId: 'submitted-order-1',
        actorCredentialId: 'buyer-1',
        now,
      }),
    ).toThrow('positive unit price');

    const priced = setOrderLineCommercialTerms(draft, {
      lineId: orderLineId('order-line-3'),
      unitPriceMinor: 20_000,
      discountBasisPoints: 500,
      taxBasisPoints: 0,
      now,
    });
    const submitted = submitOrder(priced, {
      snapshotId: 'submitted-order-1',
      actorCredentialId: 'buyer-1',
      now,
    });

    expect(submitted.order.status).toBe('SUBMITTED');
    expect(submitted.snapshot.orderVersion).toBe(3);
    expect(submitted.snapshot.totals.totalMinor).toBe(114_000);
    expect(() =>
      setOrderLineCommercialTerms(submitted.order, {
        lineId: orderLineId('order-line-3'),
        unitPriceMinor: 1,
        discountBasisPoints: 0,
        taxBasisPoints: 0,
        now,
      }),
    ).toThrow(OrderDomainError);
  });

  it('rejects unsafe overflow instead of rounding through Number', () => {
    expect(() =>
      calculateOrderLine({
        quantity: Number.MAX_SAFE_INTEGER,
        unitPriceMinor: 2,
        discountBasisPoints: 0,
        taxBasisPoints: 0,
      }),
    ).toThrow('exceeds safe integer range');
  });
});
