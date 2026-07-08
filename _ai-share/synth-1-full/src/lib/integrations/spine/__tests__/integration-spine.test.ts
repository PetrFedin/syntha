import { mapExternalOrderStatus, wholesaleOrderIdForExternalImport } from '../integration-platform';
import { statusIndicatesBrandConfirm } from '../operational-import-handoff.service';
import { resolveEligibleForCollection } from '../eligible-gate';
import {
  getCentricApprovedForArticle,
  listIntegrationExternalRefs,
  upsertExternalRef,
} from '../integration-external-refs-persistence.file';
import { importWholesaleOrder } from '../order-import.service';
import { findImportedOrderByExternalKey } from '../imported-orders-persistence';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('integration spine', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syntha-int-'));

  beforeAll(() => {
    process.env.SPINE_IMPORTED_ORDERS_PG = '0';
    process.env.B2B_INTEGRATION_EXTERNAL_REFS_FILE = path.join(tmpDir, 'refs.json');
    process.env.B2B_INTEGRATION_META_FILE = path.join(tmpDir, 'meta.json');
    process.env.B2B_IMPORTED_ORDERS_FILE = path.join(tmpDir, 'orders.json');
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('maps JOOR pending to pending_approval', () => {
    expect(mapExternalOrderStatus('joor', 'pending')).toBe('pending_approval');
    expect(mapExternalOrderStatus('joor', 'confirmed')).toBe('confirmed');
  });

  it('generates stable wholesaleOrderId for external import', () => {
    expect(wholesaleOrderIdForExternalImport('joor', 'abc-123')).toBe('INT-JOOR-abc-123');
  });

  it('statusIndicatesBrandConfirm matches PATCH v1 confirm labels', () => {
    expect(statusIndicatesBrandConfirm('confirmed')).toBe(true);
    expect(statusIndicatesBrandConfirm('approved')).toBe(true);
    expect(statusIndicatesBrandConfirm('Подтверждён брендом (e2e)')).toBe(true);
    expect(statusIndicatesBrandConfirm('pending')).toBe(false);
  });

  it('Centric Approved ref makes article eligible', () => {
    upsertExternalRef({
      platform: 'centric',
      externalId: 'ST-1',
      externalRevision: 'Approved',
      synthaEntityType: 'article',
      synthaEntityId: 'demo-ss27-01',
      lastSyncedAt: new Date().toISOString(),
      syncDirection: 'inbound',
    });
    expect(getCentricApprovedForArticle('demo-ss27-01')).toBe(true);
    const refs = listIntegrationExternalRefs().filter((r) => r.synthaEntityId === 'demo-ss27-01');
    expect(refs.length).toBeGreaterThanOrEqual(1);
    const gate = resolveEligibleForCollection({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    });
    expect(gate.eligibleForCollection).toBe(true);
    expect(gate.sources).toContain('centric_approved');
  });

  it('import merge does not duplicate wholesaleOrderId', () => {
    const raw = {
      id: 'joor-order-99',
      status: 'pending',
      customer_name: 'Test Shop',
      lines: [{ sku: 'SS27-M-COAT-01', quantity: 10, unit_price: 100 }],
    };
    const first = importWholesaleOrder({ platform: 'joor', externalOrderId: 'joor-order-99', raw });
    expect(first.created).toBe(true);
    const second = importWholesaleOrder({
      platform: 'joor',
      externalOrderId: 'joor-order-99',
      raw,
    });
    expect(second.created).toBe(false);
    expect(second.wholesaleOrderId).toBe(first.wholesaleOrderId);
    expect(findImportedOrderByExternalKey('joor', 'joor-order-99')?.wholesaleOrderId).toBe(
      first.wholesaleOrderId
    );
  });
});
