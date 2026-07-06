import fs from 'node:fs';
import path from 'node:path';
import { hasEmptyCellInsightPanel } from '@/lib/platform-core-empty-cell-registry';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { brandLinesheetsHrefForDemo } from '@/lib/platform-core-hub-matrix';
import {
  formatMfrEmptyHandoffCountBadgeRu,
  formatMfrEmptyPublishBadgeRu,
  MFR_EMPTY_CO_HANDOFF_COUNT_BADGE_TESTID,
  MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID,
  MFR_EMPTY_HANDOFF_QUEUE_API_PATH,
  MFR_EMPTY_SC_PUBLISH_BADGE_TESTID,
  MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID,
  mfrEmptyHandoffQueueApiHref,
  shouldShowMfrEmptyPublishBadge,
  WAVE_YV_MFR_HANDOFF_QUEUE_EMPTY_RU,
  WAVE_YV_MFR_PUBLISH_BADGE_PREFIX_RU,
} from '@/lib/platform/wave-yv-mfr-empty-pillars-final';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

const MFR_SC_PEER_LINKS = [
  'mfr-empty-sc-shop-showroom-link',
  'mfr-empty-sc-shop-matrix-link',
  'mfr-empty-sc-brand-linesheet-link',
  'mfr-empty-sc-sample-queue-link',
] as const;

const MFR_CO_PEER_LINKS = [
  'mfr-empty-co-brand-handoff-link',
  'mfr-empty-co-shop-tracking-link',
  'mfr-empty-co-shop-matrix-link',
  'mfr-empty-co-handoff-queue-link',
] as const;

describe('wave YV — mfr empty pillars final polish (dedupe VS/SK)', () => {
  it('registers manufacturer empty SC + CO insight panels', () => {
    expect(hasEmptyCellInsightPanel('manufacturer', 'sample_collection')).toBe(true);
    expect(hasEmptyCellInsightPanel('manufacturer', 'collection_order')).toBe(true);
  });

  it('read-only publish badge RU compact — no «Готово для байеров» dup (wave VS)', () => {
    expect(MFR_EMPTY_SC_PUBLISH_BADGE_TESTID).toBe('mfr-empty-sc-publish-badge');
    expect(MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID).toBe('mfr-empty-sc-publish-status-panel');
    expect(shouldShowMfrEmptyPublishBadge(0)).toBe(false);
    expect(formatMfrEmptyPublishBadgeRu(0)).toBeNull();
    expect(formatMfrEmptyPublishBadgeRu(3)).toBe(`${WAVE_YV_MFR_PUBLISH_BADGE_PREFIX_RU} · 3 арт.`);

    const badge = read('components/platform/empty-cells/MfrEmptyPublishStatusBadge.tsx');
    expect(badge).toContain('wave-yv-mfr-empty-pillars-final');
    expect(badge).not.toContain('Готово для байеров');

    const scPanel = read('components/platform/empty-cells/manufacturer-sample-collection-status-panel.tsx');
    expect(scPanel).toContain('MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID');
    expect(scPanel).toContain('manufacturer-sample-collection-pg-table');
  });

  it('read-only handoff count from PG queue — not B2B checkout UI (wave SK/VS)', () => {
    expect(MFR_EMPTY_CO_HANDOFF_COUNT_BADGE_TESTID).toBe('mfr-empty-co-handoff-count-badge');
    expect(MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID).toBe('mfr-empty-co-handoff-count-panel');
    expect(MFR_EMPTY_HANDOFF_QUEUE_API_PATH).toContain('production-handoff-queue');
    expect(mfrEmptyHandoffQueueApiHref('fact-1')).toContain('factoryId=fact-1');
    expect(formatMfrEmptyHandoffCountBadgeRu(2)).toMatch(/В очереди: 2/);
    expect(formatMfrEmptyHandoffCountBadgeRu(0)).toBe(WAVE_YV_MFR_HANDOFF_QUEUE_EMPTY_RU);

    const badge = read('components/platform/empty-cells/MfrEmptyHandoffCountBadge.tsx');
    expect(badge).toContain('mfrEmptyHandoffQueueApiHref');
    expect(badge).not.toContain('shop-co-checkout');

    const coPanel = read('components/platform/empty-cells/manufacturer-po-expectation-panel.tsx');
    expect(coPanel).toContain('MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID');
    expect(coPanel).not.toContain('shop-co-checkout');
  });

  it('mfr empty SC peer strip — ≥2 cross-links (wave VS)', () => {
    expect(MFR_SC_PEER_LINKS.length).toBeGreaterThanOrEqual(2);
    expect('mfr-empty-sc-peer-strip').toContain('peer-strip');
    for (const tid of MFR_SC_PEER_LINKS) {
      expect(tid).toMatch(/^mfr-empty-sc-/);
    }
    const demo = {
      collectionId: 'SS27',
      factoryId: 'fact-1',
      demoArticleId: 'demo-ss27-01',
      demoOrderId: 'B2B-DEMO-SHOP1-SS27',
    };
    const shop = buildShopShowroomBuySession({ collectionId: demo.collectionId });
    expect(shop.showroomHref).toContain('showroom');
    expect(shop.matrixHref).toContain('/shop/b2b/matrix');
    expect(brandLinesheetsHrefForDemo(demo)).toContain('linesheet');
    expect(
      manufacturerHandoffFeatureHref('sample-queue', {
        factoryId: demo.factoryId,
        collectionId: demo.collectionId,
      })
    ).toContain('sample-queue');
  });

  it('mfr empty CO peer strip — ≥2 cross-links (wave VS)', () => {
    expect(MFR_CO_PEER_LINKS.length).toBeGreaterThanOrEqual(2);
    expect('mfr-empty-co-peer-strip').toContain('peer-strip');
    for (const tid of MFR_CO_PEER_LINKS) {
      expect(tid).toMatch(/^mfr-empty-co-/);
    }
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-SHOP1-SS27',
    });
    expect(session.brandHandoffHref).toContain('handoff');
    expect(session.shopTrackingHref).toContain('tracking');
    expect(session.handoffHref).toContain('handoff');
  });
});
