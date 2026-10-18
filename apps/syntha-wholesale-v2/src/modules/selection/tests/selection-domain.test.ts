import { describe, expect, it } from 'vitest';

import { organisationId } from '@/modules/organisations';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import {
  SelectionDomainError,
  addSelectionItem,
  createSelection,
  grantShowroomAccess,
  markSelectionReady,
  revokeShowroomAccess,
  selectionItemId,
  setSelectionBudget,
  setSelectionSizeCurve,
} from '../domain/selection';

const now = new Date('2026-07-29T18:00:00.000Z');

function activeGrant() {
  return grantShowroomAccess({
    id: 'grant-1',
    sellerOrganisationId: organisationId('brand-1'),
    buyerOrganisationId: organisationId('shop-1'),
    showroomId: showroomId('showroom-1'),
    showroomSnapshotId: showroomSnapshotId('snapshot-1'),
    actorCredentialId: 'brand-admin',
    now,
  });
}

describe('buyer access and Selection domain', () => {
  it('binds an access grant to distinct seller and buyer organisations', () => {
    const grant = activeGrant();
    expect(grant.status).toBe('ACTIVE');
    expect(grant.version).toBe(1);
    expect(grant.showroomSnapshotId).toBe('snapshot-1');

    expect(() =>
      grantShowroomAccess({
        id: 'grant-invalid',
        sellerOrganisationId: organisationId('brand-1'),
        buyerOrganisationId: organisationId('brand-1'),
        showroomId: showroomId('showroom-1'),
        showroomSnapshotId: showroomSnapshotId('snapshot-1'),
        actorCredentialId: 'brand-admin',
        now,
      }),
    ).toThrow(SelectionDomainError);
  });

  it('creates a Shop-private draft Selection from active access', () => {
    const selection = createSelection({
      id: 'selection-1',
      grant: activeGrant(),
      buyerOrganisationId: organisationId('shop-1'),
      title: 'AW27 first buy',
      currency: 'eur',
      budgetMinor: 125_000,
      ownerCredentialId: 'buyer-1',
      now,
    });

    expect(selection.currency).toBe('EUR');
    expect(selection.budgetMinor).toBe(125_000);
    expect(selection.status).toBe('DRAFT');
    expect(selection.items).toEqual([]);
  });

  it('rejects Selection creation after access revocation', () => {
    const revoked = revokeShowroomAccess(activeGrant(), {
      actorCredentialId: 'brand-admin',
      now: new Date('2026-07-29T18:05:00.000Z'),
    });

    expect(() =>
      createSelection({
        id: 'selection-2',
        grant: revoked,
        buyerOrganisationId: organisationId('shop-1'),
        title: 'Blocked buy',
        currency: 'EUR',
        ownerCredentialId: 'buyer-1',
        now,
      }),
    ).toThrow('Selection requires active Showroom access');
  });

  it('maintains budget, unique shortlist items and size-curve total', () => {
    const initial = createSelection({
      id: 'selection-3',
      grant: activeGrant(),
      buyerOrganisationId: organisationId('shop-1'),
      title: 'Core assortment',
      currency: 'EUR',
      ownerCredentialId: 'buyer-1',
      now,
    });
    const budgeted = setSelectionBudget(initial, {
      budgetMinor: 500_000,
      now: new Date('2026-07-29T18:01:00.000Z'),
    });
    const withItem = addSelectionItem(budgeted, {
      itemId: 'item-1',
      productReference: 'SKU-001',
      variantReference: 'BLACK',
      note: 'Window story',
      now: new Date('2026-07-29T18:02:00.000Z'),
    });
    const sized = setSelectionSizeCurve(withItem, {
      itemId: selectionItemId('item-1'),
      sizeCurve: [
        { size: 'xs', quantity: 1 },
        { size: 's', quantity: 2 },
        { size: 'm', quantity: 3 },
      ],
      now: new Date('2026-07-29T18:03:00.000Z'),
    });

    expect(sized.version).toBe(4);
    expect(sized.items[0]?.quantityIntent).toBe(6);
    expect(sized.items[0]?.sizeCurve.map((entry) => entry.size)).toEqual(['XS', 'S', 'M']);

    expect(() =>
      addSelectionItem(sized, {
        itemId: 'item-duplicate',
        productReference: 'SKU-001',
        variantReference: 'BLACK',
        now,
      }),
    ).toThrow('Selection item already exists');
  });

  it('requires unique size labels and at least one item before READY', () => {
    const empty = createSelection({
      id: 'selection-4',
      grant: activeGrant(),
      buyerOrganisationId: organisationId('shop-1'),
      title: 'Empty',
      currency: 'USD',
      ownerCredentialId: 'buyer-1',
      now,
    });
    expect(() => markSelectionReady(empty, now)).toThrow('at least one item');

    const withItem = addSelectionItem(empty, {
      itemId: 'item-1',
      productReference: 'SKU-002',
      now,
    });
    expect(() =>
      setSelectionSizeCurve(withItem, {
        itemId: selectionItemId('item-1'),
        sizeCurve: [
          { size: 'm', quantity: 1 },
          { size: 'M', quantity: 2 },
        ],
        now,
      }),
    ).toThrow('Duplicate size label');

    expect(markSelectionReady(withItem, now).status).toBe('READY');
  });
});
