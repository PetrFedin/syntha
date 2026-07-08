import {
  buildShopBuyerMirrorHeadline,
  formatBrandPeerStatusSummaryRu,
} from '@/lib/platform-core-chain-peer-mirror';

describe('platform-core-chain-peer-mirror', () => {
  const baseSteps = [
    { id: 'shop_sent', labelRu: 'Отправлен', done: true },
    { id: 'brand_confirmed', labelRu: 'Подтверждён', done: false },
    { id: 'production_po', labelRu: 'PO', done: false },
  ];

  it('formatBrandPeerStatusSummaryRu: awaiting confirmation', () => {
    expect(
      formatBrandPeerStatusSummaryRu({
        steps: baseSteps,
        handedOff: false,
      })
    ).toBe('ожидает подтверждения');
  });

  it('formatBrandPeerStatusSummaryRu: confirmed awaiting handoff', () => {
    expect(
      formatBrandPeerStatusSummaryRu({
        steps: baseSteps.map((s) => (s.id === 'brand_confirmed' ? { ...s, done: true } : s)),
        handedOff: false,
      })
    ).toBe('подтвердил · ожидает передачи в цех');
  });

  it('formatBrandPeerStatusSummaryRu: ERP error after handoff', () => {
    expect(
      formatBrandPeerStatusSummaryRu({
        steps: baseSteps.map((s) => ({ ...s, done: true })),
        handedOff: true,
        poStatus: 'error',
      })
    ).toBe('передал · ERP: ошибка синхронизации');
  });

  it('buildShopBuyerMirrorHeadline filters steps by milestones policy', () => {
    const headline = buildShopBuyerMirrorHeadline(
      {
        steps: [...baseSteps, { id: 'materials_supplied', labelRu: 'Материалы', done: false }],
        handedOff: true,
      },
      'milestones'
    );
    expect(headline).not.toBeNull();
    expect(headline!.totalCount).toBe(3);
    expect(headline!.visibilityLabelRu).toContain('без деталей');
  });
});
