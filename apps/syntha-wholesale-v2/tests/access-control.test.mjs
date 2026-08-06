import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPABILITIES,
  assertCapability,
  createMembership,
} from '../src/modules/access-control/public.mjs';

test('roles are constrained by organisation type', () => {
  assert.throws(() => createMembership({
    id: 'm1', organisationId: 'brand-1', organisationType: 'brand', userId: 'u1', role: 'buyer', createdAt: 'now',
  }), (error) => error.code === 'MEMBERSHIP_ROLE_INVALID');
  assert.throws(() => createMembership({
    id: 'm2', organisationId: 'shop-1', organisationType: 'shop', userId: 'u2', role: 'product', createdAt: 'now',
  }), (error) => error.code === 'MEMBERSHIP_ROLE_INVALID');
});

test('viewer cannot modify orders', () => {
  const membership = createMembership({
    id: 'm1', organisationId: 'shop-1', organisationType: 'shop', userId: 'u1', role: 'viewer', createdAt: 'now',
  });
  assert.throws(() => assertCapability(membership, CAPABILITIES.ORDER_WRITE), (error) => error.code === 'CAPABILITY_DENIED');
});

test('brand product role can develop products but cannot confirm orders', () => {
  const membership = createMembership({
    id: 'm-product', organisationId: 'brand-1', organisationType: 'brand', userId: 'developer-1', role: 'product', createdAt: 'now',
  });
  assert.doesNotThrow(() => assertCapability(membership, CAPABILITIES.PRODUCT_DEVELOPMENT_MANAGE));
  assert.throws(() => assertCapability(membership, CAPABILITIES.ORDER_CONFIRM), (error) => error.code === 'CAPABILITY_DENIED');
});
