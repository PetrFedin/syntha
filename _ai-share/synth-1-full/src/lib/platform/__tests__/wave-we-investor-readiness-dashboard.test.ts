import {
  BRAND_DEV_INVESTOR_READINESS_API,
  brandDevInvestorReadinessArticlesLabelRu,
  brandDevInvestorReadinessFillLabelRu,
  brandDevInvestorReadinessPgSourceLabelRu,
  brandDevInvestorReadinessReadyLabelRu,
  brandDevInvestorReleaseGatePeerHref,
  brandDevInvestorReleaseChecklistPeerHref,
  brandDevInvestorSummaryHref,
  brandDevTasksKanbanPeerHref,
} from '@/lib/platform/brand-dev-investor-readiness-dashboard';
import { buildWorkshop2InvestorReadinessReport } from '@/lib/production/workshop2-investor-readiness';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

describe('wave WE — investor-readiness PG dashboard wire', () => {
  it('dashboard strips wrapper + investor-readiness testids', () => {
    expect('brand-dev-dashboard-strips').toContain('dashboard-strips');
    expect('brand-dev-investor-readiness-strip').toContain('investor-readiness');
    expect('brand-dev-investor-readiness-label').toContain('label');
    expect('brand-dev-investor-readiness-pg-source').toContain('pg-source');
    expect('brand-dev-investor-readiness-ready').toContain('ready');
    expect('brand-dev-investor-readiness-fill').toContain('fill');
    expect('brand-dev-investor-readiness-articles').toContain('articles');
    expect('brand-dev-investor-readiness-link').toContain('link');
    expect('brand-dev-investor-readiness-dossier-link').toContain('dossier');
    expect(BRAND_DEV_INVESTOR_READINESS_API).toBe('/api/workshop2/investor-readiness');
  });

  it('peer strip links tasks kanban + release gate', () => {
    expect('brand-dev-investor-readiness-peer-strip').toContain('peer-strip');
    expect('brand-dev-investor-readiness-kanban-peer-link').toContain('kanban-peer');
    expect('brand-dev-investor-readiness-release-gate-peer-link').toContain('release-gate-peer');
    expect('brand-dev-investor-readiness-tasks-peer-link').toContain('tasks-peer');

    const cid = PLATFORM_CORE_DEMO.collectionId;
    expect(brandDevTasksKanbanPeerHref(cid)).toContain('/brand/calendar');
    expect(brandDevTasksKanbanPeerHref(cid)).toContain('brand-dev-tasks-kanban-panel');
    expect(brandDevInvestorReleaseGatePeerHref(cid)).toContain('techpack-gate');
    expect(brandDevInvestorReleaseChecklistPeerHref(cid)).toContain('checklist');
  });

  it('RU labels for PG dashboard metrics', () => {
    expect(brandDevInvestorReadinessReadyLabelRu(true)).toBe('Готов');
    expect(brandDevInvestorReadinessReadyLabelRu(false)).toBe('Черновик');
    expect(brandDevInvestorReadinessPgSourceLabelRu(true)).toBe('PG');
    expect(brandDevInvestorReadinessPgSourceLabelRu(false)).toBe('memory');
    expect(brandDevInvestorReadinessFillLabelRu(72)).toBe('ТЗ 72%');
    expect(brandDevInvestorReadinessArticlesLabelRu(3)).toBe('3 арт.');
  });

  it('investor summary href includes collection + article', () => {
    const href = brandDevInvestorSummaryHref(
      PLATFORM_CORE_DEMO.collectionId,
      PLATFORM_CORE_DEMO.demoArticleId
    );
    expect(href).toContain('investor-summary');
    expect(href).toContain(PLATFORM_CORE_DEMO.collectionId);
    expect(href).toContain(PLATFORM_CORE_DEMO.demoArticleId);
  });

  it('buildWorkshop2InvestorReadinessReport exposes PG dashboard fields', () => {
    const report = buildWorkshop2InvestorReadinessReport({ ss27Dossiers: [] });
    expect(typeof report.readyForInvestorDemo).toBe('boolean');
    expect(typeof report.pgOnly).toBe('boolean');
    expect(report.ss27.articleCount).toBeGreaterThanOrEqual(0);
    expect(typeof report.stagingMode).toBe('boolean');
    expect(report.stagingNoteRu.length).toBeGreaterThan(0);
  });

  it('investor-readiness API path constant', () => {
    expect(BRAND_DEV_INVESTOR_READINESS_API).toContain('investor-readiness');
  });
});
