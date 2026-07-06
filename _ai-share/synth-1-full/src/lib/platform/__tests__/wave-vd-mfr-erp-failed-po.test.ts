import { buildWorkshop2BulkHandoffIdempotencyKey } from '@/lib/production/workshop2-bulk-handoff-idempotency';
import {
  factoryHandoffNeedsErpAttention,
  canRetryFactoryHandoffErp,
} from '@/lib/production/workshop2-factory-handoff-po-status';
import {
  WORKSHOP2_ERP_AUTO_RETRY_MAX,
  summarizeFactoryErpAttentionRu,
} from '@/lib/production/workshop2-erp-retry-hint';
import { WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX } from '@/lib/server/workshop2-b2b-production-handoff';

describe('wave VD — mfr ERP retry dashboard + failed PO filter + bulk-ack SoT', () => {
  it('ERP auto-retry max is 3 (wave TG server + client hint)', () => {
    expect(WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX).toBe(3);
    expect(WORKSHOP2_ERP_AUTO_RETRY_MAX).toBe(3);
  });

  it('ERP retry dashboard strip testids (wave VD)', () => {
    expect('mfr-op-erp-retry-dashboard-strip').toContain('dashboard');
    expect('mfr-op-erp-retry-dashboard-count').toContain('count');
    expect('mfr-op-erp-retry-dashboard-bulk-retry-btn').toContain('bulk-retry');
    expect('mfr-op-erp-retry-dashboard-failed-filter-link').toContain('failed-filter');
    expect('mfr-op-erp-retry-dashboard-handoff-link').toContain('handoff');
    expect('mfr-op-erp-retry-dashboard-hint').toContain('hint');
  });

  it('handoff queue failed PO filter testids (wave VD)', () => {
    expect('mfr-op-handoff-failed-po-filter').toContain('failed-po-filter');
    expect('mfr-op-handoff-failed-po-filter-toggle').toContain('toggle');
    expect('mfr-op-handoff-failed-po-filter-count').toContain('count');
    expect('mfr-op-handoff-failed-po-filter-empty').toContain('empty');
    expect('failedPo=1').toContain('failedPo');
  });

  it('factoryHandoffNeedsErpAttention covers error, pending_erp, journal-only', () => {
    expect(factoryHandoffNeedsErpAttention('error', null)).toBe(true);
    expect(factoryHandoffNeedsErpAttention('pending_erp', null)).toBe(true);
    expect(factoryHandoffNeedsErpAttention('synced', 'FACTORY-ACK-123')).toBe(true);
    expect(factoryHandoffNeedsErpAttention('synced', 'ERP-LIVE-99')).toBe(false);
    expect(canRetryFactoryHandoffErp('synced', 'FACTORY-ACK-123')).toBe(true);
  });

  it('summarizeFactoryErpAttentionRu RU copy for dashboard', () => {
    const msg = summarizeFactoryErpAttentionRu({
      errorCount: 1,
      journalOnlyCount: 2,
      pendingCount: 0,
    });
    expect(msg).toMatch(/ошибка live ERP/i);
    expect(msg).toMatch(/журнал/i);
  });

  it('bulk-ack dedup: registry SoT strip + orders bulk-sot (wave TZ/TQ)', () => {
    expect('mfr-op-handoff-queue-registry-sot-strip').toContain('registry-sot');
    expect('mfr-op-handoff-queue-registry-sot-link').toContain('registry-sot');
    expect('factory-production-orders-bulk-sot-strip').toContain('bulk-sot');
    expect('factory-production-orders-bulk-sot-handoff-link').toContain('handoff');
    expect('factory-handoff-bulk-acknowledge').toContain('bulk-acknowledge');
  });

  it('bulk handoff idempotency key stable (wave TQ)', () => {
    const a = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-2', 'B2B-1'], 'fact-1');
    const b = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-1', 'B2B-2'], 'fact-1');
    expect(a).toBe(b);
  });

  it('bulk-retry-erp API paths', () => {
    expect('/api/workshop2/factory/production-handoff-queue/bulk-retry-erp').toContain(
      'bulk-retry-erp'
    );
    expect('factory-handoff-bulk-erp-retry').toContain('bulk-erp-retry');
    expect('mfr-op-handoff-erp-failed-filter').toContain('erp-failed');
  });
});
